import type { DappConnectionManager } from '@wizardconnect/dapp';
import { deriveAddress, validateSigned, walletRequest, type Network, type Plan } from '@/core/bch';
import { AppError, WalletSigningError, invariant, walletRejection } from '@/core/errors';
export type Signer = Pick<DappConnectionManager, 'isWalletDiscovered' | 'signTransaction'> &
  Partial<Pick<DappConnectionManager, 'on' | 'off'>>;
export async function signPlan(
  signer: Signer | null,
  ready: boolean,
  plan: Plan,
  signal?: AbortSignal,
): Promise<string> {
  if (!signer || !ready || !signer.isWalletDiscovered())
    throw new WalletSigningError(
      'session_readiness',
      'WALLET_NOT_READY',
      'Connect a ready wallet before signing.',
    );

  let requestSent = false,
    responseReceived = false,
    sequence: number | undefined;
  const sent = (message: { action?: string; sequence?: number }) => {
    if (message.action === 'sign_transaction_request') {
      requestSent = true;
      sequence = message.sequence;
    }
  };
  const received = (message: { action?: string; sequence?: number }) => {
    if (
      message.action === 'sign_transaction_response' &&
      (sequence === undefined || sequence === message.sequence)
    )
      responseReceived = true;
  };
  signer.on?.('messagesent', sent);
  signer.on?.('messagereceived', received);
  try {
    const result = await signer.signTransaction(
      { transaction: walletRequest(plan), inputPaths: plan.inputPaths },
      { signal },
    );
    responseReceived = true;
    if (result.error) throw walletRejection(result.error);
    if (!result.signedTransaction)
      throw walletRejection('WALLET_EMPTY_SIGNATURE_RESPONSE');
    try {
      validateSigned(result.signedTransaction, plan);
    } catch (error) {
      const code = error instanceof AppError ? error.code : 'INVALID_SIGNATURE';
      throw new WalletSigningError(
        'signed_transaction_validation',
        code,
        'The wallet returned transaction data that ReturnTail rejected. Do not retry until the saved attempt and network history are checked.',
      );
    }
    return result.signedTransaction;
  } catch (error) {
    if (error instanceof WalletSigningError) throw error;
    if (error instanceof Error && error.name === 'AbortError')
      throw new WalletSigningError(
        'signing_timeout',
        'WALLET_RESPONSE_TIMEOUT',
        'The wallet response timed out. The wallet may still have acted; reconcile the saved attempt and address history before retrying.',
      );
    throw new WalletSigningError(
      responseReceived ? 'wallet_response' : requestSent ? 'wallet_response' : 'relay_submission',
      'WALLET_REQUEST_FAILED',
      responseReceived
        ? 'The wallet response could not be processed. Check the saved attempt and address history before retrying.'
        : requestSent
          ? 'WizardConnect sent the request but no usable wallet response was received. Check the saved attempt and address history before retrying.'
          : 'WizardConnect could not submit the request to the wallet. Confirm the session is connected and retry only after checking the saved attempt and address history.',
    );
  } finally {
    signer.off?.('messagesent', sent);
    signer.off?.('messagereceived', received);
  }
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
