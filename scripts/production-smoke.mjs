const base = process.argv[2];
if (!base) throw Error('Usage: npm run smoke -- https://your-authorized-deployment.example');
const url = new URL(base);
if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
  throw Error('Use HTTPS for hosted smoke checks.');
const results = await Promise.all(
  [
    '',
    '/guide',
    '/evidence',
    '/privacy',
    '/register',
    '/robots.txt',
    '/sitemap.xml',
    '/icon.svg',
    '/brand/social.png',
    '/api/health',
    '/api/workspace',
  ].map(async (path) => {
    const response = await fetch(new URL(path || '/', url), {
      signal: AbortSignal.timeout(15000),
      redirect: 'manual',
    });
    const expected = path === '/api/workspace' ? 401 : 200;
    const ok = response.status === expected;
    if (path === '/api/health') {
      const health = await response.json();
      return {
        path,
        status: response.status,
        ok: ok && health.configured === true,
        network: health.network,
        database: health.database,
      };
    }
    return {
      path: path || '/',
      status: response.status,
      ok,
      secureHeader: response.headers.get('x-content-type-options') === 'nosniff',
    };
  }),
);
console.log(
  JSON.stringify(
    { base: url.origin, checkedAt: new Date().toISOString(), readOnly: true, results },
    null,
    2,
  ),
);
if (results.some((r) => !r.ok)) process.exit(1);
