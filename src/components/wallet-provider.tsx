'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  useWizardConnect,
  AlphanumericQRCode,
  type UseWizardConnectResult,
} from '@wizardconnect/react';
import type { Network, Plan } from '@/core/bch';
import { deriveAddress } from '@/core/bch';
import { signPlan, walletSource } from '@/client/wallet-adapter';
import { walletError } from '@/core/errors';
import { Check, Copy, Unplug, Wallet, X } from 'lucide-react';
const storage = {
  getItem: (k: string) => (typeof window === 'undefined' ? null : window.sessionStorage.getItem(k)),
  setItem: (k: string, v: string) => {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(k, v);
  },
  removeItem: (k: string) => {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(k);
  },
};
type Value = {
  wc: UseWizardConnectResult;
  network: Network;
  sign: (plan: Plan) => Promise<string>;
  source: (firstIndex: number, count?: number) => ReturnType<typeof walletSource>;
};
const Context = createContext<Value | null>(null);
export function WalletProvider({ network, children }: { network: Network; children: ReactNode }) {
  const wc = useWizardConnect({
    dappName: 'ReturnTail',
    sessionKey: `returntail-wizard-${network}`,
    storage,
  });
  const dialog = useRef<HTMLDialogElement>(null),
    [copied, setCopied] = useState(false);
  const signing = useRef<AbortController | null>(null);
  useEffect(() => {
    const el = dialog.current;
    if (wc.state === 'connecting' && wc.uri) {
      el?.showModal();
    } else if (el?.open) el.close();
  }, [wc.state, wc.uri]);
  useEffect(() => () => signing.current?.abort(), []);
  const sign = async (plan: Plan) => {
    const controller = new AbortController();
    signing.current = controller;
    const timeout = setTimeout(() => controller.abort(), 120000);
    try {
      return await signPlan(wc.manager, wc.state === 'connected', plan, controller.signal);
    } catch (e) {
      throw new Error(walletError(e));
    } finally {
      clearTimeout(timeout);
      signing.current = null;
    }
  };
  return (
    <Context.Provider
      value={{ wc, network, sign, source: (i, c) => walletSource(wc.manager, network, i, c) }}
    >
      {children}
      <dialog
        ref={dialog}
        className="wallet-dialog"
        onCancel={() => void wc.disconnect()}
        aria-labelledby="wallet-title"
      >
        <div className="dialog-heading">
          <h2 id="wallet-title">Connect your BCH wallet</h2>
          <button
            className="icon-button"
            aria-label="Close wallet connection"
            onClick={() => void wc.disconnect()}
          >
            <X size={20} />
          </button>
        </div>
        <p>
          Scan with a WizardConnect-enabled wallet. Use Paytaca, or Selene if your installed version
          supports it.
        </p>
        <div className="qr-frame">
          {wc.qrUri && <AlphanumericQRCode value={wc.qrUri} size={240} />}
        </div>
        <p className="network-label">
          {network === 'mainnet' ? 'Mainnet — real BCH' : 'Chipnet — test coins only'}
        </p>
        {wc.uri && (
          <div className="button-row">
            <a className="button" href={wc.uri}>
              Open wallet
              <Wallet size={16} />
            </a>
            <button
              className="button secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(wc.uri!);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}{' '}
              {copied ? 'Copied' : 'Copy connection'}
            </button>
          </div>
        )}
        <p className="fine">
          Your wallet keeps its signing keys. Public address paths and encrypted relay credentials
          stay in this browser tab.
        </p>
      </dialog>
    </Context.Provider>
  );
}
export function useWallet() {
  const context = useContext(Context);
  if (!context) throw Error('Wallet context is unavailable.');
  return context;
}
export function WalletButton() {
  const { wc } = useWallet();
  return (
    <button
      className="button secondary wallet-button"
      onClick={() => (wc.state === 'connected' ? void wc.disconnect() : wc.connect())}
      disabled={wc.state === 'connecting' || wc.state === 'reconnecting'}
    >
      {wc.state === 'connected' ? <Unplug size={17} /> : <Wallet size={17} />}{' '}
      {wc.state === 'connected'
        ? `${wc.walletName ?? 'Wallet'} connected`
        : wc.state === 'reconnecting'
          ? 'Reconnecting…'
          : wc.state === 'connecting'
            ? 'Connecting…'
            : 'Connect wallet'}
    </button>
  );
}
export function WalletInfo() {
  const { wc, network } = useWallet();
  let address = '';
  try {
    const x = wc.manager?.getSessionPaths().find((p) => p.name === 'receive');
    if (x) address = deriveAddress(x.xpub, 0, network);
  } catch {
    /* wrong-network state shown below */
  }
  return (
    <div className="wallet-info">
      <WalletButton />
      {wc.state === 'connected' && (
        <>
          <p>
            {address ? (
              <>
                <span className="label">First receive address</span>
                <code className="wrap">{address}</code>
              </>
            ) : (
              'The connected wallet does not provide a matching network receive key.'
            )}
          </p>
          <p className="fine">
            Connection reveals public address paths. It does not prove ownership. A valid, observed
            spend can prove control of its source address.
          </p>
        </>
      )}
      {wc.error && (
        <p className="error-text" role="alert">
          {wc.error}
        </p>
      )}
    </div>
  );
}
