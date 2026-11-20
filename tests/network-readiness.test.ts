// Isolated provider fixtures. These do not contact or fund any blockchain.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkNetwork, Fulcrum, chain } from '../src/server/chain';
import { address } from './fixtures';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
function providers(mode: 'ok' | 'disagree' | 'wrong-chain' | 'stale' = 'ok') {
  vi.stubEnv('BCH_ELECTRUM_HOST', 'fixture-primary.invalid');
  vi.stubEnv('BCH_WITNESS_HOST', 'fixture-witness.invalid');
  const connect = vi.spyOn(Fulcrum.prototype, 'connect').mockImplementation(async () => {
    if (mode === 'wrong-chain') throw new Error('Configured chain checkpoint failed');
  });
  const close = vi.spyOn(Fulcrum.prototype, 'close').mockImplementation(() => {});
  const request = vi.spyOn(Fulcrum.prototype, 'request').mockImplementation(async (method) => {
    if (method === 'blockchain.headers.subscribe')
      return { height: mode === 'stale' ? 1 : 1000000, hex: '00'.repeat(80) };
    if (method === 'blockchain.block.header')
      return (mode === 'disagree' ? 'ff' : '00').repeat(80);
    throw new Error('Unexpected request: ' + method);
  });
  return { connect, close, request };
}
describe('authenticated runtime network readiness logic', () => {
  it('checks both providers on the requested chain without a broadcast', async () => {
    const p = providers();
    const result = await checkNetwork('mainnet');
    expect(result).toMatchObject({ network: 'mainnet', checkpointVerified: true,
      witness: 'fixture-witness.invalid', transfersPerformed: false, height: 1000000 });
    expect(p.connect.mock.calls).toEqual([['mainnet'], ['mainnet']]);
    expect(p.close).toHaveBeenCalledTimes(2);
    expect(p.request.mock.calls.map(([method]) => method)).toEqual([
      'blockchain.headers.subscribe', 'blockchain.block.header',
    ]);
  });
  it('rejects provider disagreement and closes both connections', async () => {
    const p = providers('disagree');
    await expect(checkNetwork('mainnet')).rejects.toThrow('disagree');
    expect(p.close).toHaveBeenCalledTimes(2);
  });
  it('propagates checkpoint failure without claiming readiness', async () => {
    const p = providers('wrong-chain');
    await expect(checkNetwork('mainnet')).rejects.toThrow('checkpoint');
    expect(p.close).toHaveBeenCalledTimes(1);
  });
  it('rejects a stale tip before checking the witness', async () => {
    const p = providers('stale');
    await expect(checkNetwork('mainnet')).rejects.toThrow('invalid block height');
    expect(p.connect).toHaveBeenCalledTimes(1);
  });
  it('rejects using the same host as its own witness', async () => {
    providers();
    vi.stubEnv('BCH_WITNESS_HOST', 'fixture-primary.invalid');
    await expect(checkNetwork('mainnet')).rejects.toThrow('different BCH providers');
    await expect(chain.history(address, 'chipnet')).rejects.toThrow('different BCH providers');
  });
  it('includes history visible only to the witness when checking address freshness', async () => {
    const p = providers();
    p.request.mockImplementation(async function(this: Fulcrum, method) {
      if (method !== 'blockchain.scripthash.get_history') throw new Error('Unexpected fixture call');
      return this.host === 'fixture-primary.invalid' ? [] : [{ tx_hash: 'ab'.repeat(32) }];
    });
    expect(await chain.history(address, 'chipnet')).toEqual(['ab'.repeat(32)]);
    expect(p.close).toHaveBeenCalledTimes(2);
  });
});
