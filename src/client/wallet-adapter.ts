import type { DappConnectionManager } from '@wizardconnect/dapp';
import { deriveAddress, validateSigned, walletRequest, type Network, type Plan } from '@/core/bch';
import { invariant } from '@/core/errors';
export type Signer = Pick<DappConnectionManager, 'isWalletDiscovered' | 'signTransaction'>;
export async function signPlan(
  signer: Signer | null,
  ready: boolean,
  plan: Plan,
  signal?: AbortSignal,
): Promise<string> {
  invariant(
    signer && ready && signer.isWalletDiscovered(),
    'WALLET_DISCONNECTED',
    'Connect a ready wallet before signing.',
  );
  const result = await signer.signTransaction(
    { transaction: walletRequest(plan), inputPaths: plan.inputPaths },
    { signal },
  );
  invariant(
    !result.error && result.signedTransaction,
    'SIGNATURE_REJECTED',
    result.error || 'Wallet did not return a signed transaction.',
  );
  validateSigned(result.signedTransaction, plan);
  return result.signedTransaction;
}
export function walletSource(
  manager: DappConnectionManager | null,
  n: Network,
  firstIndex: number,
  count = 5,
) {
  invariant(
    manager && manager.isWalletDiscovered(),
    'WALLET_DISCONNECTED',
    'Connect your wallet first.',
  );
  const paths = manager.getSessionPaths(),
    receive = paths.find((p) => p.name === 'receive'),
    change = paths.find((p) => p.name === 'change');
  invariant(
    receive && change,
    'WALLET_CAPABILITY',
    'The wallet must supply receive and change public paths.',
  );
  const indices = Array.from({ length: count }, (_, i) => firstIndex + i);
  deriveAddress(receive.xpub, firstIndex, n);
  deriveAddress(change.xpub, 0, n);
  return { xpub: receive.xpub, changeXpub: change.xpub, changeIndex: 0, indices };
}
