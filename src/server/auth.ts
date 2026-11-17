import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { invariant } from '@/core/errors';
import { pool, transaction } from './db';
import { hash, token, passwordHash, passwordMatches } from './security';
import { network, authSecret } from './config';
export const SESSION_COOKIE = 'returntail_session';
export async function merchant() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const r = await pool().query<{ id: string; email: string }>(
    'SELECT m.id,m.email FROM sessions s JOIN merchants m ON m.id=s.merchant_id WHERE s.token_hash=$1 AND s.expires_at>now()',
    [hash(value)],
  );
  return r.rows[0] ?? null;
}
export async function requireMerchant() {
  const m = await merchant();
  invariant(m, 'UNAUTHENTICATED', 'Sign in to your merchant account.', 401);
  return m;
}
export async function authenticate(
  input: { email: string; password: string; storeName?: string },
  register: boolean,
) {
  authSecret();
  const email = input.email.trim().toLowerCase();
  const encoded = register ? await passwordHash(input.password) : null;
  const dummy = 'scrypt:00000000000000000000000000000000:' + '00'.repeat(64);
  let id: string;
  if (register) {
    id = randomUUID();
    await transaction(async (db) => {
      const exists = await db.query('SELECT id FROM merchants WHERE email=$1', [email]);
      invariant(
        !exists.rows.length,
        'ACCOUNT_UNAVAILABLE',
        'Unable to register with these details. Try signing in.',
        409,
      );
      await db.query('INSERT INTO merchants(id,email,password_hash) VALUES($1,$2,$3)', [
        id,
        email,
        encoded,
      ]);
      await db.query('INSERT INTO stores(id,merchant_id,name,network) VALUES($1,$2,$3,$4)', [
        randomUUID(),
        id,
        input.storeName ?? 'My store',
        network(),
      ]);
    });
  } else {
    const found = await pool().query<{ id: string; password_hash: string }>(
      'SELECT id,password_hash FROM merchants WHERE email=$1',
      [email],
    );
    const matches = await passwordMatches(input.password, found.rows[0]?.password_hash ?? dummy);
    invariant(
      found.rows[0] && matches,
      'INVALID_CREDENTIALS',
      'Email or password is incorrect.',
      401,
    );
    id = found.rows[0].id;
  }
  const session = token();
  await pool().query(
    "INSERT INTO sessions(token_hash,merchant_id,expires_at) VALUES($1,$2,now()+interval '7 days')",
    [hash(session), id],
  );
  (await cookies()).set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 86400,
  });
  return { id, email };
}
export async function logout() {
  const c = await cookies(),
    old = c.get(SESSION_COOKIE)?.value;
  if (old) await pool().query('DELETE FROM sessions WHERE token_hash=$1', [hash(old)]);
  c.delete(SESSION_COOKIE);
}
