import { NextResponse } from 'next/server';
import { z } from 'zod';
import { timingSafeEqual } from 'node:crypto';
import { AppError, invariant } from '@/core/errors';
import { assertOrigin, ipBucket, rateLimit } from '@/server/security';
import { pool } from '@/server/db';
import { authenticate, logout, merchant, requireMerchant } from '@/server/auth';
import { network } from '@/server/config';
import * as service from '@/server/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const uuid = z.string().uuid();
const credentials = z
  .object({
    email: z.email().max(254),
    password: z.string().min(12).max(128),
    storeName: z.string().trim().min(2).max(100).optional(),
  })
  .strict();
const wallet = z
  .object({
    xpub: z.string().min(100).max(120),
    changeXpub: z.string().min(100).max(120),
    changeIndex: z.number().int().min(0).max(10000),
    indices: z
      .array(z.number().int().min(0).max(9999))
      .min(1)
      .max(50)
      .refine((a) => new Set(a).size === a.length),
  })
  .strict();
type Context = { params: Promise<{ path: string[] }> };
async function actor(req: Request): Promise<{ capability: string } | { merchantId: string }> {
  const cap = req.headers.get('authorization');
  if (cap?.startsWith('Bearer ')) return { capability: cap.slice(7) };
  return { merchantId: (await requireMerchant()).id };
}
function key(req: Request) {
  return req.headers.get('idempotency-key') ?? '';
}
async function jsonBody(req: Request): Promise<unknown> {
  const reader = req.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    bytes += part.value.length;
    if (bytes > 220000) {
      await reader.cancel();
      throw new AppError('BODY_TOO_LARGE', 'Request body is too large.', 413);
    }
    chunks.push(part.value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw new AppError('INVALID_JSON', 'Request body is not valid JSON.');
  }
}
async function dispatch(req: Request, ctx: Context) {
  const { path } = await ctx.params;
  const [root, id, action] = path,
    method = req.method;
  if (method === 'GET' && root === 'health') {
    let database = false;
    try {
      await pool().query('SELECT 1 FROM schema_migrations LIMIT 1');
      database = true;
    } catch {
      /* only disclose readiness */
    }
    return {
      service: 'returntail',
      network: network(),
      database,
      configured: database && !!process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32,
    };
  }
  if (method === 'GET' && root === 'jobs' && id === 'reconcile') {
    const secret = process.env.CRON_SECRET,
      authorization = req.headers.get('authorization') ?? '';
    invariant(
      secret && secret.length >= 32,
      'JOB_DISABLED',
      'Reconciliation job is not configured.',
      503,
    );
    const expected = Buffer.from(`Bearer ${secret}`),
      actual = Buffer.from(authorization);
    invariant(
      actual.length === expected.length && timingSafeEqual(expected, actual),
      'UNAUTHORIZED',
      'Job authentication required.',
      401,
    );
    return service.reconcileAll();
  }
  if (method === 'POST') assertOrigin(req);
  await rateLimit(pool(), `api:${ipBucket(req)}`, 120);
  if (method === 'GET' && root === 'session')
    return { merchant: await merchant(), network: network() };
  if (method === 'GET' && root === 'workspace')
    return service.workspace((await requireMerchant()).id);
  if (method === 'GET' && root === 'resolutions') {
    uuid.parse(id);
    return service.publicResolution(id);
  }
  if (method === 'GET' && root === 'orders') {
    uuid.parse(id);
    return service.orderDetail(id, await actor(req));
  }
  invariant(method === 'POST', 'NOT_FOUND', 'Endpoint not found.', 404);
  const body = await jsonBody(req);
  if (root === 'auth') {
    await rateLimit(pool(), `auth:${ipBucket(req)}`, 10);
    if (id === 'logout') {
      await logout();
      return { signedOut: true };
    }
    invariant(id === 'register' || id === 'login', 'NOT_FOUND', 'Endpoint not found.', 404);
    const input = credentials.parse(body);
    await rateLimit(pool(), `auth-email:${input.email.toLowerCase()}`, 10, 300);
    return authenticate(input, id === 'register');
  }
  if (root === 'store') {
    const input = z
      .object({
        name: z.string().trim().min(2).max(100),
        xpub: z.string().min(100).max(120).optional(),
      })
      .strict()
      .parse(body);
    return service.configureStore((await requireMerchant()).id, input.name, input.xpub);
  }
  if (root === 'orders' && !id) {
    const input = z
      .object({
        title: z.string().trim().min(2).max(160),
        amount: z.number().int().min(546).max(2100000000000000),
      })
      .strict()
      .parse(body);
    return service.createOrder((await requireMerchant()).id, input, key(req));
  }
  if (root === 'orders') {
    uuid.parse(id);
    const who = await actor(req);
    await rateLimit(pool(), `order:${id}`, 30);
    if (action === 'verify') {
      const input = z
        .object({
          txid: z
            .string()
            .regex(/^[a-f0-9]{64}$/)
            .optional(),
        })
        .strict()
        .parse(body);
      return service.verifyPurchase(id, who, input.txid);
    }
    if (action === 'reconcile') return service.reconcileOrder(id, who);
    if (action === 'refunds') {
      invariant(
        'capability' in who,
        'CUSTOMER_LINK_REQUIRED',
        'Open the private customer purchase link to request a refund.',
        403,
      );
      const input = z
        .object({
          amount: z.number().int().min(546).max(2100000000000000),
          address: z.string().min(40).max(120),
          reason: z.string().trim().min(5).max(1000),
        })
        .strict()
        .parse(body);
      return service.requestRefund(id, who.capability, input, key(req));
    }
    if (action === 'prepare') {
      const input = z.object({ source: wallet, refundId: uuid.optional() }).strict().parse(body);
      return service.prepareAttempt(id, who, input.source, key(req), input.refundId);
    }
  }
  if (root === 'refunds' && action === 'decision') {
    uuid.parse(id);
    const input = z
      .object({
        decision: z.enum(['approve', 'reject']),
        note: z.string().trim().max(1000).default(''),
      })
      .strict()
      .parse(body);
    return service.decideRefund(
      (await requireMerchant()).id,
      id,
      input.decision,
      input.note,
      key(req),
    );
  }
  if (root === 'attempts') {
    uuid.parse(id);
    const who = await actor(req);
    if (action === 'sign') {
      const input = z
        .object({ raw: z.string().regex(/^(?:[a-f0-9]{2}){10,100000}$/i) })
        .strict()
        .parse(body);
      return service.submitSigned(id, who, input.raw);
    }
    if (action === 'cancel') return service.cancelUnsigned(id, who);
    if (action === 'rebroadcast') return service.rebroadcastSaved(id, who);
  }
  throw new AppError('NOT_FOUND', 'Endpoint not found.', 404);
}
async function handler(req: Request, ctx: Context) {
  try {
    return NextResponse.json(await dispatch(req, ctx), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: e.issues[0]?.message ?? 'Check your input.' },
        { status: 400 },
      );
    if (e instanceof AppError)
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status: e.status, headers: e.status === 429 ? { 'Retry-After': '60' } : {} },
      );
    // Do not send SQL, connection strings, wallet session material, or raw tx errors to clients.
    const code = typeof e === 'object' && e !== null && 'code' in e ? String(e.code) : 'unknown';
    console.error(
      JSON.stringify({
        event: 'request_failed',
        code: /^[A-Z0-9_]{1,30}$/.test(code) ? code : 'internal',
      }),
    );
    return NextResponse.json(
      {
        error: 'SERVICE_UNAVAILABLE',
        message:
          'This action could not be completed. Your saved transaction attempts are retained. Check service configuration and retry.',
      },
      { status: 503 },
    );
  }
}
export { handler as GET, handler as POST };
