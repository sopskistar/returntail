import { invariant } from './errors';
export const MAX_SATS = 2_100_000_000_000_000;
export function sats(value: unknown): number {
  invariant(
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 546 && value <= MAX_SATS,
    'INVALID_AMOUNT',
    'Enter a whole satoshi amount of at least 546.',
  );
  return value;
}
export function bch(value: number | string | bigint): string {
  const n = BigInt(value);
  return `${n / 100_000_000n}.${(n % 100_000_000n).toString().padStart(8, '0')}`;
}
export function remaining(paid: number, reserved: number, settled: number): number {
  invariant(
    [paid, reserved, settled].every(Number.isSafeInteger) &&
      reserved >= 0 &&
      settled >= 0 &&
      reserved + settled <= paid,
    'ACCOUNTING_INVARIANT',
    'Refund accounting requires review.',
    409,
  );
  return paid - reserved - settled;
}
