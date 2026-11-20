import tls, { type TLSSocket } from 'node:tls';
import { createHash } from 'node:crypto';
import { binToHex } from '@bitauth/libauth';
import { addressScript, parseTransaction, txid, type Network, type Utxo } from '@/core/bch';
import { AppError, invariant } from '@/core/errors';
export type Observation = {
  network: Network;
  txid: string;
  raw: string;
  confirmations: number;
  blockHeight: number | null;
  blockHash: string | null;
  provider: string;
  witness: string | null;
  checkedAt: string;
  merkleVerified: boolean;
};
export interface Chain {
  observe(id: string, address: string, network: Network): Promise<Observation | null>;
  utxos(address: string, network: Network, path: string, index: number): Promise<Utxo[]>;
  history(address: string, network: Network): Promise<string[]>;
  broadcast(raw: string, network: Network): Promise<string>;
}
const doubleSha = (b: Buffer) =>
  createHash('sha256').update(createHash('sha256').update(b).digest()).digest();
const headerHash = (hex: string) => doubleSha(Buffer.from(hex, 'hex')).reverse().toString('hex');
const checkpoints = {
  mainnet: {
    height: 661648,
    hash: '0000000000000000029e471c41818d24b8b74c911071c4ef0b4a0509f9b5a8ce',
  },
  chipnet: {
    height: 115252,
    hash: '00000000040ba9641ba98a37b2e5ceead38e4e2930ac8f145c8094f94c708727',
  },
};
export class Fulcrum {
  private socket?: TLSSocket;
  private next = 0;
  private buffer = '';
  private pending = new Map<
    number,
    {
      resolve: (r: unknown) => void;
      reject: (e: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  constructor(
    public host: string,
    public port = 50002,
  ) {}
  async connect(n: Network) {
    await new Promise<void>((resolve, reject) => {
      this.socket = tls.connect({
        host: this.host,
        port: this.port,
        servername: this.host,
        rejectUnauthorized: true,
      });
      const timer = setTimeout(() => {
        this.close();
        reject(new AppError('NETWORK_TIMEOUT', 'BCH network connection timed out.', 503));
      }, 8000);
      this.socket.once('secureConnect', () => {
        clearTimeout(timer);
        resolve();
      });
      this.socket.on('data', (chunk: Buffer) => this.receive(chunk));
      this.socket.on('error', (e) => {
        clearTimeout(timer);
        this.fail(e);
        reject(e);
      });
      this.socket.on('close', () =>
        this.fail(new AppError('NETWORK_DISCONNECTED', 'BCH provider disconnected.', 503)),
      );
    });
    await this.request('server.version', ['ReturnTail/0.1', '1.4.1']);
    const header = await this.request<string>('blockchain.block.header', [checkpoints[n].height]);
    invariant(
      headerHash(header) === checkpoints[n].hash,
      'WRONG_NETWORK',
      'BCH provider failed the configured chain checkpoint.',
      503,
    );
  }
  private receive(chunk: Buffer) {
    this.buffer += chunk.toString('utf8');
    if (this.buffer.length > 5_000_000) {
      this.fail(new Error('Provider response too large'));
      this.close();
      return;
    }
    let newline: number;
    while ((newline = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, newline);
      this.buffer = this.buffer.slice(newline + 1);
      try {
        const data = JSON.parse(line);
        const p = this.pending.get(data.id);
        if (!p) continue;
        clearTimeout(p.timer);
        this.pending.delete(data.id);
        if (data.error)
          p.reject(
            new AppError(
              'PROVIDER_ERROR',
              String(data.error.message ?? 'Provider rejected request'),
              503,
            ),
          );
        else p.resolve(data.result);
      } catch {
        this.fail(new Error('Invalid provider response'));
        this.close();
      }
    }
  }
  request<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = ++this.next;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(
          new AppError(
            'NETWORK_TIMEOUT',
            'BCH provider did not answer in time. The transaction outcome may be unknown.',
            503,
          ),
        );
      }, 10000);
      this.pending.set(id, { resolve: (r) => resolve(r as T), reject, timer });
      if (!this.socket?.writable) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(new AppError('NETWORK_DISCONNECTED', 'BCH provider is not connected.', 503));
        return;
      }
      this.socket.write(JSON.stringify({ id, jsonrpc: '2.0', method, params }) + '\n');
    });
  }
  private fail(e: Error) {
    for (const p of this.pending.values()) {
      clearTimeout(p.timer);
      p.reject(e);
    }
    this.pending.clear();
  }
  close() {
    this.socket?.destroy();
    this.fail(new Error('Connection closed'));
  }
}
function providers(n: Network) {
  return {
    host:
      process.env.BCH_ELECTRUM_HOST ||
      (n === 'mainnet' ? 'bch.imaginary.cash' : 'chipnet.imaginary.cash'),
    port: Number(process.env.BCH_ELECTRUM_PORT || 50002),
    witness: process.env.BCH_WITNESS_HOST || (n === 'mainnet' ? 'bch0.kister.net' : null),
    witnessPort: Number(process.env.BCH_WITNESS_PORT || 50002),
  };
}
async function withClient<T>(
  n: Network,
  fn: (c: Fulcrum) => Promise<T>,
  witness = false,
): Promise<T> {
  const p = providers(n);
  invariant(!witness || p.witness, 'NO_WITNESS', 'An independent provider is required.', 503);
  const c = new Fulcrum(witness ? p.witness! : p.host, witness ? p.witnessPort : p.port);
  try {
    await c.connect(n);
    return await fn(c);
  } finally {
    c.close();
  }
}
function scriptHash(address: string, n: Network) {
  return createHash('sha256').update(addressScript(address, n)).digest().reverse().toString('hex');
}
export function verifyMerkle(
  id: string,
  branch: string[],
  position: number,
  header: string,
): boolean {
  if (
    !Number.isSafeInteger(position) ||
    position < 0 ||
    branch.length > 32 ||
    !/^[a-f0-9]{160}$/i.test(header)
  )
    return false;
  let hash = Buffer.from(id, 'hex').reverse();
  let pos = position;
  for (const sibling of branch) {
    if (!/^[a-f0-9]{64}$/i.test(sibling)) return false;
    const other = Buffer.from(sibling, 'hex').reverse();
    hash = doubleSha(pos % 2 ? Buffer.concat([other, hash]) : Buffer.concat([hash, other]));
    pos = Math.floor(pos / 2);
  }
  return pos === 0 && hash.equals(Buffer.from(header, 'hex').subarray(36, 68));
}
// Authenticated operational check: no address queries, signing or broadcasting.
// Uses the exact TLS/checkpoint path used by payment verification in this runtime.
export async function checkNetwork(n: Network) {
  const primary = await withClient(n, async (c) => ({
    provider: c.host,
    tip: await c.request<{ height: number; hex: string }>('blockchain.headers.subscribe'),
  }));
  invariant(
    Number.isSafeInteger(primary.tip.height) && primary.tip.height >= checkpoints[n].height &&
      /^[a-f0-9]{160}$/i.test(primary.tip.hex),
    'STALE_PROVIDER',
    'BCH provider returned an invalid block height.',
    503,
  );
  const p = providers(n);
  let witness: string | null = null;
  if (p.witness) {
    invariant(p.host !== p.witness, 'INVALID_WITNESS', 'Use different BCH providers.', 503);
    witness = await withClient(n, async (c) => {
      const header = await c.request<string>('blockchain.block.header', [primary.tip.height]);
      invariant(
        header === primary.tip.hex,
        'PROVIDER_DISAGREEMENT',
        'Independent BCH providers disagree; readiness is not established.',
        503,
      );
      return c.host;
    }, true);
  }
  return {
    network: n,
    provider: primary.provider,
    witness,
    checkpointVerified: true,
    height: primary.tip.height,
    blockHash: headerHash(primary.tip.hex),
    checkedAt: new Date().toISOString(),
    transfersPerformed: false,
  };
}
export const chain: Chain = {
  async history(address, n) {
    return withClient(n, async (c) =>
      (
        await c.request<{ tx_hash: string }[]>('blockchain.scripthash.get_history', [
          scriptHash(address, n),
        ])
      ).map((t) => t.tx_hash),
    );
  },
  async utxos(address, n, path, index) {
    return withClient(n, async (c) => {
      const entries = await c.request<
        { tx_hash: string; tx_pos: number; value: number; height: number; token_data?: unknown }[]
      >('blockchain.scripthash.listunspent', [scriptHash(address, n)]);
      const result: Utxo[] = [];
      for (const entry of entries.filter((e) => e.height > 0 && !e.token_data).slice(0, 50)) {
        const raw = await c.request<string>('blockchain.transaction.get', [entry.tx_hash, false]);
        invariant(
          txid(raw) === entry.tx_hash,
          'INVALID_UTXO',
          'Provider source transaction identity mismatch.',
          503,
        );
        const output = parseTransaction(raw).outputs[entry.tx_pos];
        invariant(
          output &&
            !output.token &&
            binToHex(output.lockingBytecode) === binToHex(addressScript(address, n)) &&
            output.valueSatoshis === BigInt(entry.value),
          'INVALID_UTXO',
          'Provider UTXO does not match its source transaction.',
          503,
        );
        result.push({
          txid: entry.tx_hash,
          vout: entry.tx_pos,
          satoshis: entry.value,
          lockingBytecode: binToHex(output.lockingBytecode),
          path,
          index,
        });
      }
      return result;
    });
  },
  async observe(id, address, n) {
    return withClient(n, async (c) => {
      const history = await c.request<{ tx_hash: string; height: number }[]>(
        'blockchain.scripthash.get_history',
        [scriptHash(address, n)],
      );
      const entry = history.find((e) => e.tx_hash === id);
      if (!entry) return null;
      const raw = await c.request<string>('blockchain.transaction.get', [id, false]);
      invariant(
        txid(raw) === id,
        'TXID_MISMATCH',
        'BCH provider returned a different transaction.',
        503,
      );
      let confirmations = 0,
        blockHash: string | null = null,
        blockHeight: number | null = null,
        merkleVerified = false;
      const p = providers(n);
      if (entry.height > 0) {
        const proof = await c.request<{ merkle: string[]; pos: number; block_height: number }>(
          'blockchain.transaction.get_merkle',
          [id, entry.height],
        );
        const header = await c.request<string>('blockchain.block.header', [entry.height]);
        invariant(
          proof.block_height === entry.height && verifyMerkle(id, proof.merkle, proof.pos, header),
          'INVALID_MERKLE_PROOF',
          'Transaction inclusion proof did not validate.',
          503,
        );
        if (p.witness) {
          invariant(
            p.host !== p.witness,
            'INVALID_WITNESS',
            'Use different primary and witness providers.',
            503,
          );
          await withClient(
            n,
            async (w) => {
              const witnessHeader = await w.request<string>('blockchain.block.header', [
                entry.height,
              ]);
              const witnessRaw = await w.request<string>('blockchain.transaction.get', [id, false]);
              invariant(
                witnessHeader === header && witnessRaw === raw,
                'PROVIDER_DISAGREEMENT',
                'Independent BCH providers disagree; settlement is paused.',
                503,
              );
            },
            true,
          );
        }
        const tip = await c.request<{ height: number }>('blockchain.headers.subscribe');
        invariant(
          Number.isSafeInteger(tip.height) && tip.height >= entry.height,
          'STALE_PROVIDER',
          'BCH provider has an inconsistent block height.',
          503,
        );
        confirmations = tip.height - entry.height + 1;
        blockHash = headerHash(header);
        blockHeight = entry.height;
        merkleVerified = true;
      }
      return {
        network: n,
        txid: id,
        raw,
        confirmations,
        blockHash,
        blockHeight,
        provider: c.host,
        witness: merkleVerified ? p.witness : null,
        checkedAt: new Date().toISOString(),
        merkleVerified,
      };
    });
  },
  async broadcast(raw, n) {
    return withClient(n, async (c) => {
      const id = await c.request<string>('blockchain.transaction.broadcast', [raw]);
      invariant(
        id === txid(raw),
        'BROADCAST_ID_MISMATCH',
        'Broadcast returned an unexpected identity. Reconcile the saved transaction.',
        503,
      );
      return id;
    });
  },
};
