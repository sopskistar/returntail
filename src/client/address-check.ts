import { binToHex } from '@bitauth/libauth';
import { addressScript, deriveAddress, type Network } from '@/core/bch';

export function sameDestination(a: string, b: string, network: Network): boolean {
  return binToHex(addressScript(a.trim(), network)) === binToHex(addressScript(b.trim(), network));
}
/** Local public-key derivation only. Never a wallet-control proof or a network query. */
export async function findReceiveIndex(
  xpub: string, address: string, network: Network, limit = 256, signal?: AbortSignal,
): Promise<number | null> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 10000) throw Error('Search limit is invalid.');
  const target = binToHex(addressScript(address.trim(), network));
  for (let i = 0; i < limit; i++) {
    signal?.throwIfAborted();
    if (binToHex(addressScript(deriveAddress(xpub, i, network), network)) === target) return i;
    if (i % 16 === 15) await new Promise(resolve => setTimeout(resolve, 0));
  }
  return null;
}
