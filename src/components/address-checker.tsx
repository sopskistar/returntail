'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { deriveAddress } from '@/core/bch';
import { findReceiveIndex, sameDestination } from '@/client/address-check';
import { useWallet, WalletButton } from './wallet-provider';
type Props = { address?: string; index?: number };
export function AddressChecker(props: Props) {
  const { wc } = useWallet();
  const identity = wc.manager?.getSessionPaths().map(p => p.xpub).join(':') ?? '';
  return <AddressComparison key={`${wc.state}:${identity}`} {...props} />;
}
function AddressComparison({ address, index }: Props) {
  const { wc, network } = useWallet();
  const [native, setNative] = useState(''), [result, setResult] = useState(''), [busy, setBusy] = useState(false);
  const task = useRef<AbortController | null>(null);
  // Remount on connection identity changes; cancel work without preserving results.
  useEffect(() => () => task.current?.abort(), []);
  async function check(event: FormEvent) {
    event.preventDefault();
    task.current?.abort();
    const controller = new AbortController(); task.current = controller;
    setBusy(true); setResult('');
    try {
      if (wc.state !== 'connected' || !wc.manager) throw Error('Connect the wallet you are checking first.');
      const paths = wc.manager.getSessionPaths();
      const receive = paths.find(p => p.name === 'receive');
      if (!receive) throw Error('This wallet did not advertise a receiving chain.');
      if (address && index !== undefined && !sameDestination(deriveAddress(receive.xpub, index, network), address, network))
        throw Error('The connected wallet’s receiving chain differs from this request. Stop: check the selected wallet and account.');
      const found = await findReceiveIndex(receive.xpub, native, network, 256, controller.signal);
      controller.signal.throwIfAborted();
      setResult(found === null
        ? 'No match in receive indices 0–255. This does not prove incompatibility: a later index or a different selected account may explain it. Stop funding until resolved.'
        : address && index === found && sameDestination(native, address, network)
          ? `Exact destination match at receive index ${found}. This is a public-address comparison, not a cryptographic ownership proof. Review the same destination in the native wallet.`
          : `Native Receive matches the advertised chain at index ${found}.${index !== undefined ? ` This request uses index ${index}; these are different destinations.` : ''} A chain match does not prove control of another index.`);
    } catch (error) {
      if (!controller.signal.aborted) setResult(error instanceof Error ? error.message : 'Address comparison failed.');
    } finally { if (!controller.signal.aborted) setBusy(false); }
  }
  return <section className="address-checker" aria-label="Private address comparison">
    <h2>Compare your wallet’s Receive address</h2>
    <p>Open Receive in your native wallet, choose BCH and the same personal wallet, then copy its public address. Paste only the address, with its network prefix.</p>
    <WalletButton />
    <form onSubmit={check}>
      <label htmlFor={`native-address-${index ?? 'wallet'}`}>Address copied from the native wallet</label>
      <input id={`native-address-${index ?? 'wallet'}`} value={native} onChange={e => { task.current?.abort(); setBusy(false); setNative(e.target.value); setResult(''); }} maxLength={120} autoComplete="off" spellCheck={false} placeholder="bitcoincash:… or bchtest:…" required />
      <button className="button secondary" disabled={busy || wc.state !== 'connected'}>{busy ? 'Comparing locally…' : 'Compare address locally'}</button>
    </form>
    <p className="fine">Runs only in this browser. No signing, key export, address upload, database write or blockchain transaction. Searches receive indices 0–255. Equivalent token-aware addresses are compared by destination.</p>
    <p role="status" className="comparison-result">{result}</p>
    {index === 0 && <p className="alert warning">Funding remains paused. Paytaca 0.27.3 hides receive index zero. A later-index match cannot verify this request’s exact address.</p>}
  </section>;
}
