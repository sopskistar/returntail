'use client';
import { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
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
  const source = 'https://github.com/sopskistar/ReturnTail/blob/main/';
  return (
    <section className="invariant-evidence" aria-labelledby="invariant-evidence-title">
      <h2 id="invariant-evidence-title">Financial safeguards, with evidence.</h2>
      <p>
        The probes above query this deployment using read-only GET requests. These three safeguards
        are supported by isolated PostgreSQL tests; the real mainnet facts are linked separately.
        No lab action creates a purchase, refund, reservation or wallet request.
      </p>
      <div className="invariant-grid">
        <article className="invariant-card">
          <h3>Cumulative refund limit</h3>
          <div className="invariant-step">
            <strong>DO</strong>
            <p>Try to approve refund requests whose combined value exceeds the confirmed purchase.</p>
          </div>
          <div className="invariant-step">
            <strong>SEE</strong>
            <p>
              <b>Mainnet:</b> the 10,000-sat purchase and 4,000-sat refund are confirmed. You
              reported the separate 7,000-sat approval attempt was blocked with 6,000 sats
              remaining, then rejected. That decision is application evidence; the public receipt
              does not expose its private audit row.
            </p>
          </div>
          <div className="invariant-step">
            <strong>PROOF</strong>
            <p>
              <a href="https://returntail.vercel.app/resolution/6c5fb204-f24e-4fa1-b944-d4ff710ecb02" target="_blank" rel="noreferrer">Public confirmed receipt</a>
              {' · '}
              <a href="https://explorer.selene.cash/tx/2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65?network=mainnet" target="_blank" rel="noreferrer">10,000-sat payment</a>
              {' · '}
              <a href="https://blockchair.com/bitcoin-cash/transaction/2ea6fecd4d77ad7af9bbd69038eb0c76f1d8a536835041828da0298189b51c65" target="_blank" rel="noreferrer">payment cross-check</a>
              {' · '}
              <a href="https://explorer.selene.cash/tx/c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b?network=mainnet" target="_blank" rel="noreferrer">4,000-sat refund</a>
              {' · '}
              <a href="https://blockchair.com/bitcoin-cash/transaction/c4ce3d46aa2f14c81a9a6fb8b12dcde6e8e9678539f1e20d060073cce670b85b" target="_blank" rel="noreferrer">refund cross-check</a>
              {' · '}
              <a href={`${source}tests/db/refunds.test.ts#L300`} target="_blank" rel="noreferrer">isolated cumulative-limit assertion</a>
              .
            </p>
          </div>
        </article>

        <article className="invariant-card">
          <h3>Duplicate processing protection</h3>
          <div className="invariant-step">
            <strong>DO</strong>
            <p>Repeat an identical request or simulate an uncertain broadcast outcome.</p>
          </div>
          <div className="invariant-step">
            <strong>SEE</strong>
            <p>
              <b>Isolated tests:</b> idempotent retries resolve to one request; an uncertain signed
              transaction is reconciled before action, and recovery uses only the saved bytes.
              This was not an attack or transaction on mainnet.
            </p>
          </div>
          <div className="invariant-step">
            <strong>PROOF</strong>
            <p>
              <a href={`${source}tests/db/refunds.test.ts#L334`} target="_blank" rel="noreferrer">duplicate refund submission</a>
              {' · '}
              <a href={`${source}tests/db/refunds.test.ts#L432`} target="_blank" rel="noreferrer">uncertain-broadcast reconciliation</a>
              {' · '}
              <a href={`${source}tests/db/refunds.test.ts#L547`} target="_blank" rel="noreferrer">replacement blocked</a>
              {' · '}
              <a href={`${source}tests/db/refunds.test.ts#L566`} target="_blank" rel="noreferrer">identical-byte recovery</a>
              .
            </p>
          </div>
        </article>

        <article className="invariant-card">
          <h3>Merchant authorization</h3>
          <div className="invariant-step">
            <strong>DO</strong>
            <p>Attempt to approve a refund using a different merchant identity.</p>
          </div>
          <div className="invariant-step">
            <strong>SEE</strong>
            <p>
              <b>Isolated PostgreSQL test:</b> the other merchant receives “not found”; reserved
              and settled balances remain zero. The live probes above separately verify
              unauthenticated API boundaries.
            </p>
          </div>
          <div className="invariant-step">
            <strong>PROOF</strong>
            <p>
              <a href={`${source}tests/db/refunds.test.ts#L283`} target="_blank" rel="noreferrer">unauthorized merchant approval assertion</a>
              {' · '}
              <a href={`${source}tests/browser/workflow.spec.ts#L69`} target="_blank" rel="noreferrer">live-boundary browser test</a>
              .
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
