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
import type { Workspace, OrderDetail, CreatedOrder } from '@/client/types';
import { bch } from '@/core/money';
import { explorer, deriveAddress } from '@/core/bch';
import { sameDestination } from '@/client/address-check';
import { ConfirmDialog } from './confirm-dialog';
import { AddressChecker } from './address-checker';
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
                      {o.cancellationReviewRequired && <Status state="review_required" />}
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
export function NewOrder({ correctedFrom }: { correctedFrom?: string }) {
  const { wc, network } = useWallet();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [created, setCreated] = useState<CreatedOrder | null>(null),
    [copied, setCopied] = useState(false),
    [original, setOriginal] = useState<OrderDetail | null>(null),
    [title, setTitle] = useState(''),
    [amount, setAmount] = useState(correctedFrom ? '10000' : ''),
    [selectedIndex, setSelectedIndex] = useState(''),
    [native, setNative] = useState(''),
    [origin, setOrigin] = useState('');
  type Review = {
    title: string;
    amount: number;
    address: string;
    addressIndex: number;
    receiving?: { xpub: string; index: number };
  };
  const [review, setReview] = useState<Review | null>(null);
  const keys = useRef(new Map<string, string>());
  useEffect(() => {
    Promise.resolve(window.location.origin).then(setOrigin);
  }, []);
  useEffect(() => {
    if (!correctedFrom) return;
    let live = true;
    api<OrderDetail>(`orders/${correctedFrom}`)
      .then((result) => {
        if (!live) return;
        setOriginal(result);
        setTitle(result.title);
        if (result.state !== 'cancelled' || result.cancellation?.review_required)
          setError(
            'Cancel the original request safely first. Any late activity needs manual review.',
          );
      })
      .catch((e) => {
        if (live) setError(message(e));
      });
    return () => {
      live = false;
    };
  }, [correctedFrom]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      let receiving: Review['receiving'];
      if (selectedIndex !== '') {
        const index = Number(selectedIndex);
        if (wc.state !== 'connected' || !wc.manager)
          throw Error('Connect your existing merchant wallet to select a Receive index.');
        const receive = wc.manager.getSessionPaths().find((path) => path.name === 'receive');
        if (!receive) throw Error('The connected wallet did not advertise a receiving chain.');
        if (!sameDestination(deriveAddress(receive.xpub, index, network), native, network))
          throw Error(
            'The pasted Paytaca address does not match this index on the connected receiving chain. Stop and check the account and index.',
          );
        receiving = { xpub: receive.xpub, index };
      }
      const preview = await api<{ address: string; addressIndex: number }>(
        'store/receive-preview',
        { ...(receiving ? { receiving } : {}) },
      );
      setReview({
        title: title.trim(),
        amount: Number(amount),
        ...preview,
        ...(receiving ? { receiving } : {}),
      });
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function create() {
    if (!review) return;
    setBusy(true);
    setError('');
    const input = {
      title: review.title,
      amount: review.amount,
      expectedReceiveIndex: review.addressIndex,
      ...(review.receiving ? { receiving: review.receiving } : {}),
      ...(correctedFrom ? { correctedFrom } : {}),
    };
    const fingerprint = JSON.stringify(input);
    const key = keys.current.get(fingerprint) ?? requestKey();
    keys.current.set(fingerprint, key);
    try {
      // A wallet may have changed while the confirmation was open.
      if (
        review.receiving &&
        (wc.state !== 'connected' ||
          wc.manager?.getSessionPaths().find((path) => path.name === 'receive')?.xpub !==
            review.receiving.xpub)
      )
        throw Error('The connected wallet changed. Review the receiving destination again.');
      setCreated(await api<CreatedOrder>('orders', input, undefined, key));
      setReview(null);
    } catch (e) {
      setError(message(e));
      // Keep the reviewed input and its key after an uncertain response. A retry
      // must recover the same private capability, never allocate another address.
    } finally {
      setBusy(false);
    }
  }
  const link = created ? `${origin}/pay/${created.id}#access=${created.capability}` : '';
  const validAmount = Number.isSafeInteger(Number(amount)) && Number(amount) >= 546;
  return (
    <div className="detail-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>
            {created
              ? 'Payment request created'
              : correctedFrom
                ? 'Create corrected request'
                : 'New payment request'}
          </h2>
        </div>
        <div className="panel-body">
          {error && <ServiceError error={error} />}
          {created ? (
            <div>
              <h3>Ready for your customer.</h3>
              <p className="fine">
                Reference {created.reference}. Save the complete private link now. It is available
                here or through an identical creation retry.
              </p>
              <dl className="data-list request-review">
                <div>
                  <dt>Amount</dt>
                  <dd>
                    {created.amount.toLocaleString()} satoshis · {bch(created.amount)} BCH
                  </dd>
                </div>
                <div className="long">
                  <dt>Exact receiving address</dt>
                  <dd>
                    <code className="wrap">{created.address}</code>
                  </dd>
                </div>
                <div>
                  <dt>Receive index</dt>
                  <dd>{created.addressIndex}</dd>
                </div>
              </dl>
              <div className="field private-link-field">
                <label htmlFor="private-customer-link">Private customer purchase link</label>
                <textarea
                  id="private-customer-link"
                  readOnly
                  value={link}
                  rows={4}
                  spellCheck={false}
                  onFocus={(event) => event.target.select()}
                />
                <button
                  className="button secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(link);
                      setCopied(true);
                    } catch {
                      setError(
                        'Clipboard unavailable. Select and copy the complete link manually.',
                      );
                    }
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Private link copied' : 'Copy private customer link'}
                </button>
              </div>
              <p className="fine">
                This link authorizes private purchase and refund access. Share it with the customer
                only. Compare the exact destination with Paytaca before sharing.
              </p>
              <div className="button-row request-actions">
                <Link href={`/workspace/orders/${created.id}`} className="button">
                  View purchase
                  <ArrowUpRight size={16} />
                </Link>
                <a href={link} className="text-link" target="_blank" rel="noreferrer">
                  Open customer page
                  <ArrowUpRight size={16} />
                </a>
              </div>
              <div className="request-comparison">
                <AddressChecker address={created.address} index={created.addressIndex} />
              </div>
            </div>
          ) : (
            <form method="post" action="/api/orders" onSubmit={submit}>
              {original && (
                <p className="alert">
                  Corrects {original.reference}: {original.amount.toLocaleString()} satoshis (
                  {bch(original.amount)} BCH). The original destination stays retired.
                </p>
              )}
              <div className="field">
                <label htmlFor="title">Purchase description</label>
                <input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <small aria-live="polite">
                  {validAmount
                    ? `${Number(amount).toLocaleString()} satoshis = ${bch(Number(amount))} BCH`
                    : 'Enter a whole amount of at least 546 satoshis.'}
                </small>
              </div>
              <details className="receive-selection">
                <summary>Match a different positive Paytaca Receive index</summary>
                <p className="fine">
                  If Paytaca shows another index, select a fresh Receive address there. Connect the
                  same merchant wallet, enter that positive index and paste its exact public
                  address. The server derives from your saved chain and rejects allocated addresses
                  and any blockchain history.
                </p>
                <WalletInfo />
                <div className="field">
                  <label htmlFor="receive-index">Paytaca Receive index (optional)</label>
                  <input
                    id="receive-index"
                    type="number"
                    min={1}
                    max={9999}
                    step={1}
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(e.target.value)}
                  />
                  <small>
                    Leave blank for the next fresh address. Indices 1 through 9,999; never index
                    zero.
                  </small>
                </div>
                <div className="field">
                  <label htmlFor="native-receive">Native Paytaca Receive address</label>
                  <input
                    id="native-receive"
                    value={native}
                    onChange={(e) => setNative(e.target.value)}
                    required={selectedIndex !== ''}
                    maxLength={120}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <small>
                    The pasted address is compared locally. The server checks your saved receiving
                    chain and index; it never accepts an arbitrary destination.
                  </small>
                </div>
              </details>
              <p className="fine">
                Review the exact amount and destination before creating this 24-hour payment
                request. All previous destinations remain reserved permanently.
              </p>
              <div className="form-footer">
                <button
                  className="button"
                  disabled={
                    busy ||
                    (!!correctedFrom &&
                      (!original ||
                        original.state !== 'cancelled' ||
                        !!original.cancellation?.review_required))
                  }
                  aria-busy={busy}
                >
                  {busy ? 'Checking destination…' : 'Review payment request'}
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
          Open Receive in Paytaca, choose BCH and the same personal wallet, and compare the entire
          address and positive index with this request.
        </p>
        <p>
          A public-address match does not establish physical-wallet control. No signature or
          transfer is requested here.
        </p>
        <Link href="/workspace/settings" className="text-link">
          Review receiving wallet
          <ArrowUpRight size={16} />
        </Link>
      </aside>
      {review && (
        <ConfirmDialog
          title="Confirm payment request"
          confirm="Create private payment request"
          busy={busy}
          onClose={() => setReview(null)}
          onConfirm={() => void create()}
        >
          {error && <ServiceError error={error} />}
          <p>{review.title}</p>
          <p>
            <strong>
              {review.amount.toLocaleString()} satoshis = {bch(review.amount)} BCH
            </strong>
          </p>
          <p>Receive index {review.addressIndex}. Exact destination:</p>
          <code className="wrap">{review.address}</code>
          <p>
            The address had no history at review. Creation checks again and permanently assigns it
            to this request.
          </p>
        </ConfirmDialog>
      )}
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
