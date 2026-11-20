'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Clipboard,
  FilePlus2,
  RefreshCw,
  Wallet,
  LogOut,
  Inbox,
  Copy,
} from 'lucide-react';
import { api, message, requestKey } from '@/client/api';
import type { Workspace, OrderDetail } from '@/client/types';
import { bch } from '@/core/money';
import { explorer } from '@/core/bch';
import { WalletInfo, useWallet } from './wallet-provider';
import { Status } from './status';
export function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <>
      <button
        className="button secondary small"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await api('auth/logout', {});
            router.push('/login');
            router.refresh();
          } catch (e) {
            setError(message(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <LogOut size={15} />
        Sign out
      </button>
      {error && (
        <span role="alert" className="error-text">
          {error}
        </span>
      )}
    </>
  );
}
export function WorkspaceClient({ refunds = false }: { refunds?: boolean }) {
  const [data, setData] = useState<Workspace | null>(null),
    [error, setError] = useState(''),
    [inbox, setInbox] = useState<OrderDetail[]>([]);
  useEffect(() => {
    let live = true;
    api<Workspace>('workspace')
      .then(async (r) => {
        if (live) setData(r);
        if (refunds) {
          const orders = await Promise.all(r.orders.map((o) => api<OrderDetail>(`orders/${o.id}`)));
          if (live) setInbox(orders.filter((o) => o.refunds.length));
        }
      })
      .catch((e) => {
        if (live) setError(message(e));
      });
    return () => {
      live = false;
    };
  }, [refunds]);
  if (error) return <ServiceError error={error} />;
  if (!data) return <Loading label="Loading your merchant workspace" />;
  return (
    <div className="workspace-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>{refunds ? 'Refund inbox' : `${data.store.name} payments`}</h2>
          <span className="count">
            {refunds ? inbox.reduce((n, o) => n + o.refunds.length, 0) : data.orders.length}{' '}
            {refunds ? 'requests' : 'orders'}
          </span>
        </div>
        {refunds ? (
          inbox.length ? (
            <div>
              {inbox.map((o) => (
                <div className="refund-entry" key={o.id}>
                  <div className="refund-top">
                    <h3>
                      <Link href={`/workspace/orders/${o.id}`}>{o.title}</Link>
                    </h3>
                    <span className="fine">{o.reference}</span>
                  </div>
                  {o.refunds.map((r) => (
                    <div key={r.id} className="refund-top">
                      <span>{bch(r.amount)} BCH</span>
                      <Status state={r.state} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Inbox size={34} strokeWidth={1.3} />
              <h3>Nothing to resolve. Yet.</h3>
              <p>
                Customer refund requests appear here after a verified purchase. Open a payment to
                review its complete trail.
              </p>
              <Link className="button secondary" href="/workspace">
                View payments
              </Link>
            </div>
          )
        ) : data.orders.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Purchase</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Payment state</th>
                  <th scope="col">Open</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/workspace/orders/${o.id}`}>{o.title}</Link>
                      <small>{o.reference}</small>
                    </td>
                    <td className="amount">{bch(o.amount)} BCH</td>
                    <td>
                      <Status state={o.state} />
                    </td>
                    <td>
                      <Link
                        className="icon-button"
                        href={`/workspace/orders/${o.id}`}
                        aria-label={`Open ${o.title}`}
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FilePlus2 size={38} strokeWidth={1.25} />
            <h3>Your first payment starts here.</h3>
            <p>
              Create a private payment request. When a purchase needs attention, its refund trail
              stays connected.
            </p>
            <Link
              className="button"
              href={data.store.walletConfigured ? '/workspace/new' : '/workspace/settings'}
            >
              {data.store.walletConfigured ? 'Create payment request' : 'Set up your wallet'}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </section>
      <aside className="stack">
        <section className="side-note">
          <Wallet size={24} strokeWidth={1.5} />
          <h2>
            Your wallet.
            <br />
            Your decision.
          </h2>
          <p>
            {data.store.walletConfigured
              ? 'Your public receiving key is configured. Each order gets its own BCH address.'
              : 'Connect a supported wallet and save its public receiving key before creating a payment request.'}
          </p>
          <Link href="/workspace/settings" className="text-link">
            {data.store.walletConfigured ? 'Review wallet settings' : 'Connect your store wallet'}
            <ArrowUpRight size={16} />
          </Link>
        </section>
        <section className="panel">
          <div className="panel-body">
            <h3>What counts as proof?</h3>
            <p style={{ marginTop: 12 }}>
              A wallet connection is not a payment. A merchant approval is not a refund. Network
              evidence is checked separately.
            </p>
            <Link href="/evidence" className="text-link">
              Read the evidence guide
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
export function StoreSettings() {
  const { wc } = useWallet();
  const [store, setStore] = useState<Workspace['store'] | null>(null),
    [name, setName] = useState(''),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api<Workspace>('workspace')
      .then((r) => {
        setStore(r.store);
        setName(r.store.name);
      })
      .catch((e) => setError(message(e)));
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const xpub =
        wc.state === 'connected'
          ? wc.manager?.getSessionPaths().find((p) => p.name === 'receive')?.xpub
          : undefined;
      await api('store', { name, ...(xpub ? { xpub } : {}) });
      setSuccess(
        xpub
          ? 'Store and public receiving key saved. Ownership remains unverified until an eligible signed spend is observed.'
          : 'Store profile saved.',
      );
      const r = await api<Workspace>('workspace');
      setStore(r.store);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="detail-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>Store profile</h2>
        </div>
        <div className="panel-body">
          {error && <ServiceError error={error} />}{' '}
          {success && (
            <div className="alert success" role="status">
              <Check size={18} />
              {success}
            </div>
          )}
          <form method="post" action="/api/store" onSubmit={save}>
            <div className="field">
              <label htmlFor="name">Store name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div className="subtle-divider" />
            <h3>Merchant receiving wallet</h3>
            <p className="fine" style={{ marginBlock: '15px 20px' }}>
              Connect Paytaca with WizardConnect enabled. Selene may work where its installed
              version supports the protocol. Physical-wallet compatibility still requires
              verification.
            </p>
            <WalletInfo />
            {store?.ownershipProofs?.length ? (
              <div style={{ marginTop: 20 }}>
                <p className="fine">Observed control of these specific source addresses:</p>
                {store.ownershipProofs.map((proof) => (
                  <a
                    key={proof.address}
                    className="text-link wrap"
                    href={explorer(store.network, proof.txid)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {proof.address.slice(0, 22)}…<ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="fine" style={{ marginTop: 16 }}>
                Wallet address ownership: unverified. A saved public key is not ownership proof.
              </p>
            )}
            <p className="fine" style={{ marginTop: 20 }}>
              Saving a public receive key lets ReturnTail derive unique order addresses and reveals
              their public history. It cannot spend funds. The key is locked after your first order
              to protect existing purchase links.
            </p>
            <div className="form-footer">
              <button className="button" disabled={busy} aria-busy={busy}>
                {busy
                  ? 'Saving…'
                  : wc.state === 'connected'
                    ? 'Save store & receiving key'
                    : 'Save store profile'}
                <Check size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>
      <aside className="side-note">
        <Clipboard size={25} />
        <h2>Connection is not ownership.</h2>
        <p>
          {store?.walletConfigured
            ? 'Your store has a public receive key.'
            : 'A receiving key has not been configured yet.'}
        </p>
        <p>
          Only an observed, valid signed spend establishes control of the specific source address it
          spends from.
        </p>
        <p>
          Use separate wallet sessions for your merchant and customer when testing. Never enter a
          seed phrase or private key into ReturnTail.
        </p>
      </aside>
    </div>
  );
}
export function NewOrder() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [created, setCreated] = useState<{ id: string; capability: string; reference: string } | null>(
      null,
    ),
    [copied, setCopied] = useState(false);
  const key = useRef('');
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    Promise.resolve(window.location.origin).then(setOrigin);
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    key.current ||= requestKey();
    try {
      const result = await api<{ id: string; capability: string; reference: string }>(
        'orders',
        { title: f.get('title'), amount: Number(f.get('amount')) },
        undefined,
        key.current,
      );
      setCreated(result);
      key.current = '';
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const link = created ? `${origin}/pay/${created.id}#access=${created.capability}` : '';
  return (
    <div className="detail-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>{created ? 'Payment request created' : 'New payment request'}</h2>
        </div>
        <div className="panel-body">
          {error && <ServiceError error={error} />}{' '}
          {created ? (
            <div className="animated-state">
              <div className="success-mark">
                <Check size={25} />
              </div>
              <h3>Ready for your customer.</h3>
              <p className="fine" style={{ marginTop: 12 }}>
                Reference {created.reference}. Save this private link now; the capability is shown
                only on this creation screen or an identical idempotent retry.
              </p>
              <div className="copy-link">
                <input readOnly value={link} aria-label="Private customer purchase link" />
                <button
                  className="button secondary"
                  aria-label="Copy private customer link"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(link);
                      setCopied(true);
                    } catch {
                      setError('Clipboard unavailable. Select and copy the link manually.');
                    }
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="fine">
                This link authorizes access to the purchase and refund requests. Share it with the
                customer only.
              </p>
              <div className="button-row" style={{ marginTop: 24 }}>
                <Link href={`/workspace/orders/${created.id}`} className="button">
                  View purchase
                  <ArrowUpRight size={16} />
                </Link>
                <a href={link} className="text-link" target="_blank" rel="noreferrer">
                  Open customer page
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          ) : (
            <form method="post" action="/api/orders" onSubmit={submit}>
              <div className="field">
                <label htmlFor="title">Purchase description</label>
                <input
                  id="title"
                  name="title"
                  placeholder="What is your customer purchasing?"
                  minLength={2}
                  maxLength={160}
                  required
                />
                <small>Visible to your customer. Avoid personal or sensitive information.</small>
              </div>
              <div className="field">
                <label htmlFor="amount">Amount in satoshis</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min={546}
                  max={2100000000000000}
                  step={1}
                  placeholder="10000"
                  required
                />
                <small>
                  1 BCH = 100,000,000 satoshis. Minimum 546 satoshis. No fiat conversion.
                </small>
              </div>
              <p className="fine">
                A unique receiving address ties the exact BCH amount to this purchase. Payment
                requests expire after 24 hours.
              </p>
              <div className="form-footer">
                <button className="button" disabled={busy} aria-busy={busy}>
                  {busy ? 'Creating…' : 'Create private payment request'}
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
      <aside className="side-note">
        <FilePlus2 size={25} />
        <h2>
          One purchase.
          <br />A complete trail.
        </h2>
        <p>
          The customer pays directly to your wallet. ReturnTail checks the transaction
          independently.
        </p>
        <p>When a refund is needed, its amount and decision stay tied to this original purchase.</p>
        <Link href="/workspace/settings" className="text-link">
          Review receiving wallet
          <ArrowUpRight size={16} />
        </Link>
      </aside>
    </div>
  );
}
export function ServiceError({ error }: { error: string }) {
  return (
    <div className="alert error" role="alert">
      <CircleAlert size={19} />
      <div>{error}</div>
    </div>
  );
}
export function Loading({ label = 'Loading purchase' }: { label?: string }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <RefreshCw size={22} />
      <p>{label}…</p>
      <div className="loading-bars" aria-hidden="true">
        <div />
        <div />
        <div />
      </div>
    </div>
  );
}
