'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
const checks = [
  { name: 'Public service readiness', path: '/api/health', expected: 200, explanation: 'Reads migration and configuration readiness without exposing credentials.' },
  { name: 'Private merchant workspace', path: '/api/workspace', expected: 401, explanation: 'A request without a session must not return merchant records.' },
  { name: 'Private purchase access', path: '/api/orders/00000000-0000-4000-8000-000000000000', expected: 401, explanation: 'A request without a session or receipt capability must be rejected.' },
];
type Result = { status: number | null; verdict: string; time: string; detail: string };
export function BreakItLab() {
  const [results, setResults] = useState<Record<string, Result>>({}), [running, setRunning] = useState('');
  const lock = useRef(false);
  async function run(check: typeof checks[number]) {
    if (lock.current) return;
    lock.current = true; setRunning(check.path);
    const time = new Date().toISOString();
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
    try {
      // Fixed read-only allowlist. Never send the viewer's cookies, credentials or capabilities.
      const response = await fetch(check.path, { method: 'GET', credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal });
      let detail = 'Response body intentionally omitted.';
      let ready = true;
      if (check.path === '/api/health') {
        const health = await response.json() as { service?: unknown; database?: unknown; configured?: unknown; network?: unknown };
        ready = health.service === 'returntail' && health.database === true && health.configured === true;
        detail = `Database migration: ${health.database === true ? 'ready' : 'not ready'}. Configuration: ${health.configured === true ? 'ready' : 'not ready'}. Network: ${health.network === 'mainnet' ? 'mainnet' : health.network === 'chipnet' ? 'chipnet' : 'unknown'}.`;
      }
      if (check.path !== '/api/health') await response.body?.cancel();
      setResults(old => ({ ...old, [check.path]: { status: response.status, time, detail,
        verdict: response.status === check.expected && ready ? 'Expected response observed' : 'Unexpected response — investigate' } }));
    } catch {
      setResults(old => ({ ...old, [check.path]: { status: null, time, detail: 'No verifiable response. Retry when the connection is available.', verdict: 'Check unavailable' } }));
    } finally { clearTimeout(timeout); lock.current = false; setRunning(''); }
  }
  return <div className="lab-console"><div className="lab-console-heading"><h2>Ask the running application</h2><span>GET only · no credentials</span></div>
    {checks.map(check => <section className="lab-check" key={check.path}>
      <div><h3>{check.name}</h3><code>GET {check.path}</code><p>{check.explanation}</p></div>
      <div className="lab-check-action"><span>Expected HTTP {check.expected}</span><button className="button secondary small" disabled={!!running} onClick={() => void run(check)}><RefreshCw size={15} className={running === check.path ? 'spin' : ''} />{running === check.path ? 'Checking…' : 'Run read-only check'}</button></div>
      {results[check.path] && <div className="lab-result" role="status"><strong>{results[check.path].verdict}</strong><span>HTTP {results[check.path].status ?? 'unavailable'}</span><p>{results[check.path].detail}</p><time dateTime={results[check.path].time}>{results[check.path].time}</time></div>}
    </section>)}
    <p className="lab-footnote">These probes observe the current deployment. They do not test funds movement or prove that every security control is correct. Infrastructure may record normal access logs; no purchase or refund is created.</p>
  </div>;
}
export function InvariantEvidence() {
  const source = 'https://github.com/sopskistar/returntail/blob/main/';
  return <section className="invariant-evidence"><h2>Financial safeguards need deeper tests.</h2><p>These checks run against isolated PostgreSQL records and synthetic blockchain fixtures. They are source evidence, separate from the live probes above.</p>
    <dl><div><dt>Two approvals at once</dt><dd>Row locks and atomic reservations enforce the cumulative refund limit.</dd></div><div><dt>The network times out</dt><dd>Signed bytes and transaction identity survive; uncertain funds stay reserved.</dd></div><div><dt>The destination is changed</dt><dd>BCH byte parsing and the script VM validate signed outputs against the approved plan.</dd></div></dl>
    <div className="button-row"><a className="text-link" href={`${source}tests/db/refunds.test.ts`} target="_blank" rel="noreferrer">Inspect database security tests <ArrowUpRight size={16} /></a><a className="text-link" href={`${source}tests/core.test.ts`} target="_blank" rel="noreferrer">Inspect transaction validation <ArrowUpRight size={16} /></a></div>
  </section>;
}
