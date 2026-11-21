import { randomUUID } from 'node:crypto';
const base = process.argv[2];
if (!base) throw Error('Usage: npm run smoke -- https://your-authorized-deployment.example');
const url = new URL(base);
if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
  throw Error('Use HTTPS for hosted smoke checks.');
const expectedNetwork = process.argv[3];
if (expectedNetwork && !['mainnet', 'chipnet'].includes(expectedNetwork))
  throw Error('Optional expected network must be mainnet or chipnet.');
const cases = [
  ...['/', '/guide', '/evidence', '/privacy', '/wallet-check', '/lab', '/register', '/login', '/robots.txt',
    '/sitemap.xml', '/icon.svg', '/brand/social.png', '/api/health', '/api/session']
    .map(path => ({ path, expected: 200 })),
  { path: '/missing-release-check-page', expected: 404 },
  { path: '/api/workspace', expected: 401 },
  { path: `/api/orders/${randomUUID()}`, expected: 401 },
  { path: '/api/jobs/reconcile', expected: 401 },
  { path: '/api/jobs/network', expected: 401 },
  { path: '/api/auth/login', expected: 403, method: 'POST', headers: {
    Origin: 'https://untrusted.invalid', 'Content-Type': 'application/json',
  }, body: '{}' },
  { path: '/api/orders', expected: 401, method: 'POST', headers: {
    Origin: url.origin, 'Content-Type': 'application/json',
  }, body: JSON.stringify({ title: 'Unauthorized request must be rejected', amount: 10000 }) },
  { path: `/api/orders/${randomUUID()}/cancel`, expected: 401, method: 'POST', headers: {
    Origin: url.origin, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID(),
  }, body: '{}' },
  { path: '/api/store/receive-preview', expected: 401, method: 'POST', headers: {
    Origin: url.origin, 'Content-Type': 'application/json',
  }, body: '{}' },
];
const results = await Promise.all(cases.map(async ({ path, expected, ...init }) => {
  try {
    const response = await fetch(new URL(path, url), {
      ...init, signal: AbortSignal.timeout(30000), redirect: 'manual',
    });
    const secure = response.headers.get('x-content-type-options') === 'nosniff'
      && response.headers.get('x-frame-options') === 'DENY'
      && !!response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'");
    const api = path.startsWith('/api/');
    const privateCache = !api || response.headers.get('cache-control')?.includes('no-store');
    let ok = response.status === expected && secure && privateCache;
    let details = {};
    if (path === '/api/health' || path === '/api/session') {
      const body = await response.json();
      ok &&= !expectedNetwork || body.network === expectedNetwork;
      if (path === '/api/health') {
        ok &&= body.configured === true && body.database === true;
        details = { network: body.network, database: body.database, configured: body.configured };
      } else ok &&= body.merchant === null;
    }
    return { path, status: response.status, expected, ok, secure, privateCache, ...details };
  } catch (error) {
    return { path, ok: false, error: error instanceof Error ? error.message : 'Request failed' };
  }
}));
console.log(JSON.stringify({ base: url.origin, checkedAt: new Date().toISOString(),
  createsAccountsOrOrders: false, transfersFunds: false,
  passed: results.filter(r => r.ok).length, total: results.length, results }, null, 2));
if (results.some(r => !r.ok)) process.exit(1);
