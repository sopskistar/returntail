'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  FileCheck2,
  LockKeyhole,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { api, message, requestKey } from '@/client/api';
import type { AttemptView, OrderDetail, RefundView } from '@/client/types';
import { bch } from '@/core/money';
import { explorer } from '@/core/bch';
import { useWallet, WalletInfo } from './wallet-provider';
import { StateTrail, Status } from './status';
import { Loading, ServiceError } from './workspace-client';
import { AddressChecker } from './address-checker';
export function OrderClient({ id, merchant = false }: { id: string; merchant?: boolean }) {
  const [order, setOrder] = useState<OrderDetail | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(''),
    [notice, setNotice] = useState(''),
    [firstIndex, setFirstIndex] = useState(0);
  const { wc, network, source, sign } = useWallet(),
    access = useRef<string | undefined>(undefined),
    keys = useRef(new Map<string, string>());
  const refresh = useCallback(async () => {
    const r = await api<OrderDetail>(`orders/${id}`, undefined, access.current);
    setOrder(r);
    return r;
  }, [id]);
  useEffect(() => {
    let live = true;
    async function load() {
      if (!merchant) {
        const hash = new URLSearchParams(window.location.hash.slice(1)),
          cap = hash.get('access') ?? sessionStorage.getItem(`returntail-receipt-${id}`);
        if (!cap)
          throw new Error(
            'Open the complete private purchase link supplied by the merchant. Its access key is missing.',
          );
        access.current = cap;
        sessionStorage.setItem(`returntail-receipt-${id}`, cap);
        window.history.replaceState(null, '', window.location.pathname);
      }
      const r = await api<OrderDetail>(`orders/${id}`, undefined, access.current);
      if (live) setOrder(r);
    }
    load().catch((e) => {
      if (live) setError(message(e));
    });
    return () => {
      live = false;
    };
  }, [id, merchant]);
  const pending =
    order?.attempts.some((a) => a.txid && a.confirmations < 6 && a.state !== 'review_required') ||
    order?.payment?.state === 'unconfirmed';
  useEffect(() => {
    if (!pending) return;
    const interval = setInterval(() => {
      api<OrderDetail>(`orders/${id}/reconcile`, {}, access.current)
        .then(setOrder)
        .catch(() => {
          /* Explicit check exposes errors; background failure never changes state. */
        });
    }, 30000);
    return () => clearInterval(interval);
  }, [id, pending]);
  const key = (operation: string) => {
    let k = keys.current.get(operation);
    if (!k) {
      k = requestKey();
      keys.current.set(operation, k);
    }
    return k;
  };
  async function run(operation: string, fn: () => Promise<unknown>) {
    setBusy(operation);
    setError('');
    setNotice('');
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy('');
    }
  }
  async function verify() {
    await run('verify', async () => {
      await api(`orders/${id}/verify`, {}, access.current);
      setNotice('The payment was checked against the BCH network.');
    });
  }
  async function reconcile() {
    await run('reconcile', async () => {
      const r = await api<OrderDetail>(`orders/${id}/reconcile`, {}, access.current);
      setOrder(r);
      setNotice(
        'Saved transactions were checked against the network. An unknown outcome stays reserved.',
      );
    });
  }
  async function prepare(refundId?: string) {
    await run(`prepare-${refundId ?? 'payment'}`, async () => {
      const wallet = source(firstIndex, 5);
      await api<AttemptView>(
        `orders/${id}/prepare`,
        { source: wallet, ...(refundId ? { refundId } : {}) },
        access.current,
        key(`prepare-${refundId ?? 'payment'}`),
      );
    });
  }
  async function authorize(a: AttemptView) {
    await run(`sign-${a.id}`, async () => {
      if (a.kind === 'payment' && order?.addressIndex === 0 && !a.txid)
        throw new Error('Funding paused: Paytaca 0.27.3 cannot display this request’s index-zero destination. Do not authorize payment.');
      const storageKey = `returntail-signed-${a.id}`;
      let raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        raw = await sign(a.plan);
        sessionStorage.setItem(storageKey, raw);
      }
      const result = await api<AttemptView>(`attempts/${a.id}/sign`, { raw }, access.current);
      sessionStorage.removeItem(storageKey);
      setNotice(
        result.state === 'confirmed'
          ? 'The new transaction is independently observed and confirmed.'
          : result.state === 'unconfirmed'
            ? 'The transaction is independently observed and awaiting a block confirmation.'
            : result.state === 'broadcast_unknown'
              ? 'Broadcast outcome is unknown. The transaction and reservation are saved. Check the network before any retry.'
              : 'The signed transaction was submitted. Independent observation is still pending.',
      );
    });
  }
  async function cancel(a: AttemptView) {
    await run(`cancel-${a.id}`, async () => {
      if (sessionStorage.getItem(`returntail-signed-${a.id}`))
        throw new Error(
          'This browser has a signed transaction for this attempt. Submit the saved bytes; do not cancel or replace it.',
        );
      await api(`attempts/${a.id}/cancel`, {}, access.current);
      keys.current.delete(`prepare-${a.refundId ?? 'payment'}`);
      setNotice('Unsigned intent cancelled. The approved refund amount stays reserved.');
    });
  }
  async function rebroadcast(a: AttemptView) {
    await run(`rebroadcast-${a.id}`, async () => {
      await api(`attempts/${a.id}/rebroadcast`, {}, access.current);
      setNotice(
        'The saved transaction was reconciled first. Any rebroadcast used identical signed bytes and the same transaction ID.',
      );
    });
  }
  async function decision(r: RefundView, which: 'approve' | 'reject', note: string) {
    await run(`${which}-${r.id}`, async () => {
      await api(
        `refunds/${r.id}/decision`,
        { decision: which, note },
        undefined,
        key(`decision-${r.id}-${which}-${note}`),
      );
      setNotice(
        which === 'approve'
          ? 'Refund approved and amount reserved. No BCH has moved; review and sign the new transaction.'
          : 'Request rejected. The decision is recorded in the audit trail.',
      );
    });
  }
  async function requestRefund(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      input = {
        amount: Number(f.get('amount')),
        address: String(f.get('address')),
        reason: String(f.get('reason')),
      };
    await run('request', async () => {
      await api(
        `orders/${id}/refunds`,
        input,
        access.current,
        key(`request-${JSON.stringify(input)}`),
      );
      setNotice(
        'Refund requested. The merchant must review and authorize a new transaction before any BCH is returned.',
      );
    });
  }
  if (!order) return error ? <ServiceError error={error} /> : <Loading />;
  const paymentAttempt = order.attempts.find(
    (a) => a.kind === 'payment' && a.state !== 'cancelled',
  );
  const receivingChecked = order.events.some(event =>
    event.action === 'order.created' && event.detail.receivingHistoryChecked === true);
  return (
    <div>
      {merchant ? (
        <div className="breadcrumb">
          <Link href="/workspace">Payments</Link>
          <span>/</span>
          <span>{order.reference}</span>
        </div>
      ) : (
        <div className="checkout-heading">
          <span className="private-note">
            <LockKeyhole size={13} />
            Private purchase & refund access
          </span>
          <h1>{order.storeName}</h1>
          <p>Keep this private link to follow your payment and any refund.</p>
        </div>
      )}
      {error && <ServiceError error={error} />}{' '}
      {notice && (
        <div className="alert success" role="status">
          <Check size={18} />
          <span>{notice}</span>
        </div>
      )}
      {order.network !== network && (
        <ServiceError error="This purchase belongs to another network. Do not sign with the current wallet." />
      )}
      {!receivingChecked && <ServiceError error="This request predates receiving-address checks. Ask the merchant for a new payment link before paying; existing transfers need manual review." />}
      {order.addressIndex === 0 && order.state === 'awaiting_payment' && <div className="alert warning" role="alert">Funding paused. This preserved request uses receive index zero, which Paytaca 0.27.3 cannot display in Receive. Do not send BCH to this address. <Link className="text-link" href="/wallet-check">Read the unfunded preflight</Link>.</div>}
      <div className={`detail-grid ${merchant ? 'merchant-flow' : 'customer-flow'}`}>
        <div className="stack purchase-stack">
          <section className="panel">
            <div className="panel-heading">
              <h2>{order.title}</h2>
              <Status state={order.state} />
            </div>
            <div className="panel-body">
              <span className="label">{order.reference}</span>
              <div className="purchase-total">
                {bch(order.amount)} <span>BCH</span>
              </div>
              <StateTrail
                state={
                  order.state === 'awaiting_payment' && paymentAttempt
                    ? paymentAttempt.state
                    : order.state
                }
              />
              <div className="subtle-divider" />
              <dl className="data-list">
                <div>
                  <dt>Network</dt>
                  <dd>
                    {order.network === 'mainnet'
                      ? 'Mainnet — real BCH'
                      : 'Chipnet — test coins only'}
                  </dd>
                </div>
                <div className="long">
                  <dt>Merchant receiving address</dt>
                  <dd>
                    <code className="wrap">{order.address}</code>
                  </dd>
                </div>
                <div>
                  <dt>Merchant receive index</dt>
                  <dd>{order.addressIndex}</dd>
                </div>
                <div>
                  <dt>Payment window</dt>
                  <dd>{new Date(order.expiresAt).toLocaleString()}</dd>
                </div>
              </dl>
              {merchant && order.state === 'awaiting_payment' && (
                <p className="fine">
                  Before sharing this request, compare the exact destination with your native
                  wallet. Public-key derivation alone is not proof of wallet control.
                </p>
              )}
              {order.payment && (
                <div style={{ marginTop: 22 }}>
                  <span className="label">Original payment</span>
                  <a
                    className="text-link wrap"
                    href={explorer(order.network, order.payment.txid)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {order.payment.txid.slice(0, 16)}…<ArrowUpRight size={15} />
                  </a>
                  <p className="fine">
                    Output {order.payment.vout}; {order.payment.confirmations} confirmation
                    {order.payment.confirmations === 1 ? '' : 's'}. Last check:{' '}
                    {new Date(order.payment.checked_at).toLocaleString()}.
                  </p>
                  <p className="fine">
                    Provider: {order.payment.evidence.provider}.{' '}
                    {order.payment.evidence.merkleVerified
                      ? 'Merkle inclusion checked.'
                      : 'Pending block inclusion.'}{' '}
                    {order.payment.evidence.witness
                      ? `Witness: ${order.payment.evidence.witness}.`
                      : ''}
                  </p>
                </div>
              )}
              <div className="balance-row">
                <div>
                  <span className="label">Refundable now</span>
                  <strong>{order.remaining.toLocaleString()} sats</strong>
                </div>
                <div>
                  <span className="label">Reserved</span>
                  <strong>{order.reserved.toLocaleString()} sats</strong>
                </div>
                <div>
                  <span className="label">Settled</span>
                  <strong>{order.settled.toLocaleString()} sats</strong>
                </div>
              </div>
              <div className="button-row" style={{ marginTop: 25, gap: 12 }}>
                <button className="button secondary" onClick={verify} disabled={!!busy}>
                  {busy === 'verify' ? 'Checking…' : 'Check payment'}
                  <RefreshCw size={15} />
                </button>
                {order.attempts.some((a) => a.txid) && (
                  <button className="text-link" onClick={reconcile} disabled={!!busy}>
                    {busy === 'reconcile' ? 'Checking…' : 'Reconcile transactions'}
                  </button>
                )}
              </div>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Refund trail</h2>
              <span className="count">{order.refunds.length} requests</span>
            </div>
            {order.refunds.length ? (
              order.refunds.map((r) => (
                <RefundEntry
                  key={r.id}
                  refund={r}
                  attempt={order.attempts.find(
                    (a) => a.refundId === r.id && a.state !== 'cancelled',
                  )}
                  merchant={merchant}
                  busy={busy}
                  decision={decision}
                  prepare={() => prepare(r.id)}
                  authorize={authorize}
                  cancel={cancel}
                  reconcile={reconcile}
                  rebroadcast={rebroadcast}
                  order={order}
                />
              ))
            ) : (
              <div className="empty-state">
                <FileCheck2 size={30} strokeWidth={1.4} />
                <h3>No refund requests.</h3>
                <p>
                  {merchant
                    ? 'If the customer requests a refund, review its reason and destination here.'
                    : 'Once your payment is confirmed, you can request a full or partial refund here.'}
                </p>
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Activity record</h2>
            </div>
            <div className="panel-body">
              <ol className="activity">
                {order.events.map((event) => (
                  <li key={event.id}>
                    <span>{event.action.split('.').join(' ').split('_').join(' ')}</span>
                    <time dateTime={event.created_at}>
                      {new Date(event.created_at).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
        <aside className="stack purchase-actions">
          {merchant && order.state === 'awaiting_payment' && <div className="panel panel-body"><AddressChecker address={order.address} index={order.addressIndex} /></div>}
          {!merchant && order.state === 'awaiting_payment' && (
            <section className="panel">
              <div className="panel-heading">
                <h2>Pay with your wallet</h2>
              </div>
              <div className="panel-body">
                <WalletInfo />
                <p className="fine" style={{ marginTop: 18 }}>
                  Use confirmed BCH from your connected wallet. Review the recipient, fee and change
                  before signing.
                </p>
                <FundingIndex value={firstIndex} onChange={setFirstIndex} />
                {paymentAttempt ? (
                  <TransactionReview
                    attempt={paymentAttempt}
                    busy={!!busy}
                    onSign={() => authorize(paymentAttempt)}
                    onCancel={() => cancel(paymentAttempt)}
                    onReconcile={reconcile}
                    onRebroadcast={() => rebroadcast(paymentAttempt)}
                    order={order}
                  />
                ) : (
                  <button
                    className="button"
                    disabled={!!busy || wc.state !== 'connected' || !receivingChecked || order.addressIndex === 0}
                    onClick={() => prepare()}
                  >
                    <Wallet size={16} />
                    {busy.startsWith('prepare') ? 'Finding BCH…' : 'Prepare payment'}
                  </button>
                )}
              </div>
            </section>
          )}
          {!merchant && (
            <section className="panel">
              <div className="panel-heading">
                <h2>Something went wrong?</h2>
              </div>
              <div className="panel-body">
                {order.state === 'confirmed' && order.remaining >= 546 ? (
                  <form method="post" onSubmit={requestRefund}>
                    <div className="field">
                      <label htmlFor="refund-amount">Refund amount in satoshis</label>
                      <input
                        id="refund-amount"
                        name="amount"
                        type="number"
                        min={546}
                        max={order.remaining}
                        step={1}
                        defaultValue={order.remaining}
                        required
                      />
                      <small>
                        Up to {order.remaining.toLocaleString()} satoshis. Full or partial refunds.
                      </small>
                    </div>
                    <div className="field">
                      <label htmlFor="refund-address">Your refund address</label>
                      <input
                        id="refund-address"
                        name="address"
                        placeholder={order.network === 'mainnet' ? 'bitcoincash:q…' : 'bchtest:q…'}
                        minLength={40}
                        maxLength={120}
                        required
                        autoComplete="off"
                      />
                      <small>
                        Use your own {order.network} receiving address. Check it carefully; we do
                        not infer it from the purchase inputs.
                      </small>
                    </div>
                    <div className="field">
                      <label htmlFor="reason">What happened?</label>
                      <textarea
                        id="reason"
                        name="reason"
                        minLength={5}
                        maxLength={1000}
                        placeholder="Explain the issue to your merchant."
                        required
                      />
                    </div>
                    <button className="button" disabled={!!busy}>
                      {busy === 'request' ? 'Sending request…' : 'Request refund'}
                    </button>
                    <p className="fine" style={{ marginTop: 16 }}>
                      Submitting a request does not return funds. The merchant decides, then
                      authorizes a new BCH transaction.
                    </p>
                  </form>
                ) : (
                  <p className="fine">
                    {order.state === 'confirmed'
                      ? 'Your remaining balance is reserved or has already been refunded. Track the requests in the refund trail.'
                      : 'A confirmed original payment is required before requesting a refund. Check the payment after your transaction is visible.'}
                  </p>
                )}
              </div>
            </section>
          )}
          {merchant && (
            <section className="panel">
              <div className="panel-heading">
                <h2>Merchant signing wallet</h2>
              </div>
              <div className="panel-body">
                <WalletInfo />
                <FundingIndex value={firstIndex} onChange={setFirstIndex} />
                <p className="fine">
                  The receive public path must match this store. Your wallet approves each refund
                  separately.
                </p>
              </div>
            </section>
          )}
          <div className="side-note">
            <CircleAlert size={24} />
            <h2>
              A refund is
              <br />a new payment.
            </h2>
            <p>
              BCH payments cannot be reversed. Merchant approval reserves an amount; it does not
              move funds.
            </p>
            <p>
              “Confirmed” means the new transaction was independently observed in a block. An
              unknown broadcast stays reserved until reconciled.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
function FundingIndex({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <details style={{ marginBlock: 20 }}>
      <summary className="fine">Can’t find your BCH?</summary>
      <div className="field" style={{ marginTop: 15 }}>
        <label htmlFor="first-index">Receive address range starts at</label>
        <input
          id="first-index"
          type="number"
          value={value}
          min={0}
          max={9995}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <small>
          Checks five receive addresses from this index. Choose the range containing your confirmed
          BCH. This release does not scan your entire wallet. Funds on other paths or change-only
          UTXOs are not selected.
        </small>
      </div>
    </details>
  );
}
function TransactionReview({
  attempt: a,
  busy,
  onSign,
  onCancel,
  onReconcile,
  onRebroadcast,
  order,
}: {
  attempt: AttemptView;
  busy: boolean;
  onSign: () => Promise<void>;
  onCancel: () => Promise<void>;
  onReconcile: () => Promise<void>;
  onRebroadcast?: () => Promise<void>;
  order: OrderDetail;
}) {
  return (
    <div className="transaction-review animated-state">
      <h3>Review before signing.</h3>
      <Status state={a.state} />
      <dl className="data-list" style={{ marginTop: 20 }}>
        <div>
          <dt>Original purchase</dt>
          <dd>{order.reference}</dd>
        </div>
        <div>
          <dt>Network</dt>
          <dd>{a.plan.network}</dd>
        </div>
        <div className="long">
          <dt>Recipient</dt>
          <dd>
            <code className="wrap">{a.plan.destination}</code>
          </dd>
        </div>
        <div className="long">
          <dt>Wallet sources</dt>
          <dd>
            {a.plan.inputPaths.map(([i, path, index]) => (
              <span key={i} className="fine" style={{ display: 'block' }}>
                Input {i + 1}: {path}/{index}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>Recipient amount</dt>
          <dd>{a.plan.amount.toLocaleString()} sats</dd>
        </div>
        <div>
          <dt>Network fee</dt>
          <dd>{a.plan.fee.toLocaleString()} sats</dd>
        </div>
        <div className="total">
          <dt>Total wallet debit</dt>
          <dd>{a.plan.debit.toLocaleString()} sats</dd>
        </div>
        <div className="long">
          <dt>Wallet change address</dt>
          <dd>
            <code className="wrap">{a.plan.changeAddress}</code>
          </dd>
        </div>
      </dl>
      {a.txid && (
        <a
          href={explorer(order.network, a.txid)}
          className="text-link"
          target="_blank"
          rel="noreferrer"
        >
          Inspect transaction
          <ArrowUpRight size={15} />
        </a>
      )}
      {a.state === 'awaiting_signature' ? (
        <>
          <p>
            Signing authorizes the new transaction above. ReturnTail validates the signed intent,
            saves it, then broadcasts it. Your wallet can reject the request.
          </p>
          <div className="button-row">
            <button className="button" disabled={busy} onClick={onSign}>
              {busy ? 'Waiting for wallet…' : 'Authorize in wallet'}
              <ArrowUpRight size={16} />
            </button>
            <button className="button secondary" disabled={busy} onClick={onCancel}>
              Cancel unsigned intent
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            {a.state === 'broadcast_unknown'
              ? 'The transaction fate is uncertain. Its amount remains reserved. Reconcile it; do not create another payment.'
              : a.state === 'confirmed'
                ? 'The signed transaction is observed and confirmed.'
                : 'The saved transaction is being tracked. Check the network for its current state.'}
          </p>
          <button
            className="button secondary"
            style={{ marginTop: 18 }}
            disabled={busy}
            onClick={onReconcile}
          >
            Check saved transaction
            <RefreshCw size={15} />
          </button>
          {onRebroadcast && ['signed', 'broadcast_unknown', 'broadcast'].includes(a.state) && (
            <button className="text-link" disabled={busy} onClick={onRebroadcast}>
              Recheck & rebroadcast saved transaction
            </button>
          )}
        </>
      )}
    </div>
  );
}
function RefundEntry({
  refund: r,
  attempt,
  merchant,
  busy,
  decision,
  prepare,
  authorize,
  cancel,
  reconcile,
  rebroadcast,
  order,
}: {
  refund: RefundView;
  attempt: AttemptView | undefined;
  merchant: boolean;
  busy: string;
  decision: (r: RefundView, d: 'approve' | 'reject', note: string) => Promise<void>;
  prepare: () => Promise<void>;
  authorize: (a: AttemptView) => Promise<void>;
  cancel: (a: AttemptView) => Promise<void>;
  reconcile: () => Promise<void>;
  rebroadcast: (a: AttemptView) => Promise<void>;
  order: OrderDetail;
}) {
  const [note, setNote] = useState('');
  return (
    <article className="refund-entry">
      <div className="refund-top">
        <h3>{bch(r.amount)} BCH</h3>
        <Status state={r.state} />
      </div>
      <p>{r.reason}</p>
      <p className="refund-destination">
        <span className="label">Requested refund destination</span>
        <code className="wrap">{r.address}</code>
      </p>
      {r.decision_note && <p className="fine">Merchant note: {r.decision_note}</p>}
      {r.state !== 'rejected' && <StateTrail state={r.state} refund />}
      {merchant && r.state === 'requested' && (
        <>
          <div className="field">
            <label htmlFor={`note-${r.id}`}>Decision note (optional)</label>
            <textarea
              id={`note-${r.id}`}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A helpful note for your customer."
            />
          </div>
          <div className="refund-actions">
            <button
              className="button"
              disabled={!!busy}
              onClick={() => decision(r, 'approve', note)}
            >
              Approve & reserve amount
              <Check size={15} />
            </button>
            <button
              className="button danger"
              disabled={!!busy}
              onClick={() => decision(r, 'reject', note)}
            >
              Reject request
            </button>
          </div>
          <p className="fine">
            Approval reserves {r.amount.toLocaleString()} satoshis. Signing is a separate step.
          </p>
        </>
      )}
      {merchant && r.state === 'approved' && !attempt && (
        <div className="refund-actions">
          <button className="button" disabled={!!busy} onClick={prepare}>
            {busy.startsWith('prepare') ? 'Finding BCH…' : 'Prepare refund transaction'}
            <Wallet size={15} />
          </button>
        </div>
      )}
      {merchant && attempt && (
        <TransactionReview
          attempt={attempt}
          busy={!!busy}
          onSign={() => authorize(attempt)}
          onCancel={() => cancel(attempt)}
          onReconcile={reconcile}
          onRebroadcast={() => rebroadcast(attempt)}
          order={order}
        />
      )}
      {attempt?.txid && (
        <Link href={`/resolution/${r.id}`} className="text-link">
          Shareable resolution receipt
          <ArrowUpRight size={15} />
        </Link>
      )}
    </article>
  );
}
