import { invariant } from '@/core/errors';
import type { Network } from '@/core/bch';
export function network(): Network {
  const n = process.env.BCH_NETWORK ?? 'chipnet';
  invariant(
    n === 'mainnet' || n === 'chipnet',
    'CONFIGURATION',
    'BCH_NETWORK must be mainnet or chipnet.',
    503,
  );
  return n;
}
export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}
export function authSecret(): string {
  const s = process.env.AUTH_SECRET;
  invariant(
    s && s.length >= 32,
    'SETUP_REQUIRED',
    'Configure AUTH_SECRET with at least 32 random characters.',
    503,
  );
  return s;
}
