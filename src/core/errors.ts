export class AppError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
export function invariant(condition: unknown, code: string, message: string, status = 400): asserts condition {
  if (!condition) throw new AppError(code, message, status);
}
export function walletError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  if (/abort|cancel|reject|denied/i.test(text)) return 'Signing was cancelled. No new transaction was submitted.';
  if (/disconnect|ready|session/i.test(text)) return 'Your wallet is disconnected. Reconnect before signing.';
  if (/timeout|expired/i.test(text)) return 'The wallet request expired. Check the saved attempt before continuing.';
  return 'The wallet could not complete this request. Check your connection and try again.';
}
