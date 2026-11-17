import { writeFile, mkdir } from 'node:fs/promises';
import { chain, Fulcrum } from '../src/server/chain';
import { network } from '../src/server/config';
import { parseTransaction, type Network } from '../src/core/bch';
import { lockingBytecodeToCashAddress } from '@bitauth/libauth';
const requested = process.argv[2];
if (requested && requested !== 'mainnet' && requested !== 'chipnet')
  throw Error('Network must be mainnet or chipnet.');
const n: Network =
  requested === 'mainnet' ? 'mainnet' : requested === 'chipnet' ? 'chipnet' : network();
const host =
  process.env.BCH_ELECTRUM_HOST ||
  (n === 'mainnet' ? 'bch.imaginary.cash' : 'chipnet.imaginary.cash');
const c = new Fulcrum(host, Number(process.env.BCH_ELECTRUM_PORT || 50002));
try {
  await c.connect(n);
  const tip = await c.request<{ height: number; hex: string }>('blockchain.headers.subscribe'),
    features = await c.request('server.features');
  const evidence = {
    kind: 'read-only network connectivity; no transfer performed',
    network: n,
    host,
    checkedAt: new Date().toISOString(),
    checkpointVerified: true,
    tip,
    features,
  };
  await mkdir('artifacts/evidence', { recursive: true });
  await writeFile(`artifacts/evidence/${n}-network.json`, JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
  if (process.argv.includes('--probe')) {
    const height = tip.height - 6,
      id = await c.request<string>('blockchain.transaction.id_from_pos', [height, 0, false]),
      raw = await c.request<string>('blockchain.transaction.get', [id, false]);
    const output = parseTransaction(raw).outputs.find(
      (o) => o.lockingBytecode.length === 25 && o.lockingBytecode[0] === 0x76,
    );
    if (!output)
      throw Error(
        'Selected external coinbase has no supported P2PKH output; no transaction probe performed.',
      );
    const addr = lockingBytecodeToCashAddress({
      bytecode: output.lockingBytecode,
      prefix: n === 'mainnet' ? 'bitcoincash' : 'bchtest',
    });
    if (typeof addr === 'string') throw Error('Cannot decode external probe output.');
    const observed = await chain.observe(id, addr.address, n);
    if (!observed?.merkleVerified) throw Error('External transaction inclusion was not verified.');
    const summary = {
      kind: 'UNRELATED PUBLIC TRANSACTION — read-only infrastructure probe, NOT a ReturnTail payment/refund',
      network: n,
      txid: observed.txid,
      blockHeight: observed.blockHeight,
      blockHash: observed.blockHash,
      confirmations: observed.confirmations,
      provider: observed.provider,
      witness: observed.witness,
      merkleVerified: observed.merkleVerified,
      checkedAt: observed.checkedAt,
    };
    await writeFile(
      `artifacts/evidence/${n}-external-probe.json`,
      JSON.stringify(summary, null, 2),
    );
    console.log(JSON.stringify(summary, null, 2));
  }
} finally {
  c.close();
}
