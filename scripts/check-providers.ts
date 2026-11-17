import { Fulcrum } from '../src/server/chain';
// Public servers listed in Electron Cash's maintained server registry. No credentials or transfers.
const results = await Promise.all(
  ['bch0.kister.net', 'cashnode.bch.ninja', 'bch.loping.net'].map(async (host) => {
    const c = new Fulcrum(host);
    try {
      await c.connect('mainnet');
      const tip = await c.request<{ height: number }>('blockchain.headers.subscribe');
      return { host, checkpointVerified: true, height: tip.height };
    } catch (e) {
      return {
        host,
        checkpointVerified: false,
        error: e instanceof Error ? e.message : 'connection failed',
      };
    } finally {
      c.close();
    }
  }),
);
console.log(JSON.stringify(results, null, 2));
