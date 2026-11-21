export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function invariant(
  condition: unknown,
  code: string,
  message: string,
  status = 400,
): asserts condition {
  if (!condition) throw new AppError(code, message, status);
}
export type WalletFailureStage =
  | 'session_readiness'
  | 'relay_submission'
  | 'wallet_response'
  | 'wallet_rejection'
  | 'signed_transaction_validation'
  | 'signing_timeout';

/** A safe diagnostic. Raw relay errors, transaction bytes and session data never leave memory. */
export class WalletSigningError extends Error {
  constructor(
    public readonly stage: WalletFailureStage,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'WalletSigningError';
  }
}

export function walletFailure(error: unknown): WalletSigningError {
  if (error instanceof WalletSigningError) return error;

  if (error instanceof AppError) {
    return new WalletSigningError(
      'signed_transaction_validation',
      safeWalletCode(error.code),
      'The wallet returned transaction data that ReturnTail rejected. Do not retry until the saved attempt and network history are checked.',
    );
  }

  const name = error instanceof Error ? error.name : '';
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? safeWalletCode(String(error.code))
      : 'WALLET_REQUEST_FAILED';

  if (name === 'AbortError')
    return new WalletSigningError(
      'signing_timeout',
      'WALLET_RESPONSE_TIMEOUT',
      'The wallet response timed out. The wallet may still have acted; reconcile the saved attempt and address history before retrying.',
    );

  return new WalletSigningError(
    'wallet_response',
    code,
    'No valid wallet signature response was received. Check the saved attempt and address history before retrying.',
  );
}

export function walletRejection(error: unknown): WalletSigningError {
  return new WalletSigningError(
    'wallet_rejection',
    safeWalletCode(typeof error === 'string' ? error : ''),
    'The wallet explicitly rejected the signing request. No transaction was submitted by ReturnTail.',
  );
}

function safeWalletCode(value: string): string {
  // Only retain short, enum-like codes; free-form wallet messages can contain sensitive details.
  const code = value.trim().toUpperCase();
  return /^[A-Z][A-Z0-9_]{1,31}$/.test(code) ? code : 'WALLET_REQUEST_FAILED';
}

export function walletError(error: unknown): string {
  const failure = walletFailure(error);
  const stage = {
    session_readiness: 'Wallet session readiness',
    relay_submission: 'WizardConnect relay submission',
    wallet_response: 'Wallet response',
    wallet_rejection: 'Wallet rejection',
    signed_transaction_validation: 'Returned signature validation',
    signing_timeout: 'Wallet response timeout',
  }[failure.stage];
  return `${failure.message} Diagnostic: ${stage} (${failure.code}).`;
}
