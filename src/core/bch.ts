import {
  binToHex,
  cashAddressToLockingBytecode,
  decodeHdPublicKey,
  deriveHdPublicNodeChild,
  lockingBytecodeToCashAddress,
  ripemd160,
  sha256,
  decodeTransactionCommon,
  hashTransactionUiOrder,
  hexToBin,
  encodeTransactionCommon,
  createVirtualMachineBCH,
  type TransactionCommon,
  type Output,
} from '@bitauth/libauth';
import { invariant } from './errors';
export type Network = 'mainnet' | 'chipnet';
export type Utxo = {
  txid: string;
  vout: number;
  satoshis: number;
  lockingBytecode: string;
  path: string;
  index: number;
};
export type Plan = {
  unsignedHex: string;
  sourceOutputs: { lockingBytecode: string; valueSatoshis: string }[];
  inputPaths: [number, string, number][];
  fee: number;
  debit: number;
  destination: string;
  amount: number;
  changeAddress: string;
  network: Network;
};
export function addressScript(address: string, network: Network): Uint8Array {
  const decoded = cashAddressToLockingBytecode(address);
  invariant(
    typeof decoded !== 'string',
    'INVALID_ADDRESS',
    'Enter a valid, prefixed BCH CashAddress.',
  );
  invariant(
    decoded.prefix === (network === 'mainnet' ? 'bitcoincash' : 'bchtest'),
    'WRONG_NETWORK',
    `Use a ${network} address.`,
  );
  invariant(
    decoded.bytecode.length === 25 && decoded.bytecode[0] === 0x76 && decoded.bytecode[1] === 0xa9,
    'UNSUPPORTED_ADDRESS',
    'This release supports standard P2PKH BCH addresses only.',
  );
  return decoded.bytecode;
}
export function pubkeyAddress(pubkey: Uint8Array, network: Network): string {
  const hash = ripemd160.hash(sha256.hash(pubkey));
  const result = lockingBytecodeToCashAddress({
    bytecode: Uint8Array.from([0x76, 0xa9, 20, ...hash, 0x88, 0xac]),
    prefix: network === 'mainnet' ? 'bitcoincash' : 'bchtest',
  });
  invariant(typeof result !== 'string', 'INVALID_PUBKEY', 'Cannot derive a receiving address.');
  return result.address;
}
export function deriveAddress(xpub: string, index: number, network: Network): string {
  invariant(
    Number.isInteger(index) && index >= 0 && index < 0x80000000,
    'INVALID_INDEX',
    'Address index is invalid.',
  );
  const decoded = decodeHdPublicKey(xpub);
  invariant(
    typeof decoded !== 'string',
    'INVALID_XPUB',
    'The wallet did not supply a valid public receive key.',
  );
  invariant(
    decoded.network === (network === 'mainnet' ? 'mainnet' : 'testnet'),
    'WRONG_NETWORK',
    'The wallet public key belongs to a different network.',
  );
  return pubkeyAddress(deriveHdPublicNodeChild(decoded.node, index).publicKey, network);
}
export function parseTransaction(raw: string): TransactionCommon {
  invariant(
    /^(?:[0-9a-fA-F]{2}){10,100000}$/.test(raw),
    'INVALID_TRANSACTION',
    'Transaction data is invalid.',
  );
  const tx = decodeTransactionCommon(hexToBin(raw));
  invariant(typeof tx !== 'string', 'INVALID_TRANSACTION', 'Transaction cannot be decoded.');
  return tx;
}
export function txid(raw: string): string {
  parseTransaction(raw);
  return binToHex(hashTransactionUiOrder(hexToBin(raw)));
}
export function verifyPayment(
  raw: string,
  expectedTxid: string,
  destination: string,
  amount: number,
  network: Network,
): { vout: number; satoshis: number } {
  invariant(
    txid(raw) === expectedTxid.toLowerCase(),
    'TXID_MISMATCH',
    'Network data does not match the transaction identity.',
  );
  const script = binToHex(addressScript(destination, network));
  const matches = parseTransaction(raw)
    .outputs.map((o, i) => ({ o, i }))
    .filter(({ o }) => !o.token && binToHex(o.lockingBytecode) === script);
  invariant(
    matches.length === 1,
    'WRONG_RECIPIENT',
    'The transaction must contain exactly one BCH output to this order address.',
  );
  invariant(
    matches[0].o.valueSatoshis === BigInt(amount),
    'WRONG_AMOUNT',
    'The recipient amount must exactly match the payment request.',
  );
  return { vout: matches[0].i, satoshis: amount };
}
export function buildPlan(
  utxos: Utxo[],
  destination: string,
  amount: number,
  changeAddress: string,
  network: Network,
): Plan {
  const recipientScript = addressScript(destination, network),
    changeScript = addressScript(changeAddress, network);
  invariant(
    Number.isSafeInteger(amount) && amount >= 546,
    'INVALID_AMOUNT',
    'Amount must be at least 546 satoshis.',
  );
  const selected: Utxo[] = [];
  let total = 0,
    fee = 0;
  // 149 bytes conservatively budgets each P2PKH input, at 2 sat/byte.
  for (const utxo of utxos.slice().sort((a, b) => b.satoshis - a.satoshis)) {
    invariant(
      Number.isSafeInteger(utxo.satoshis) && utxo.satoshis > 0,
      'INVALID_UTXO',
      'Invalid source value.',
    );
    addressScript(pubkeyScriptAddress(utxo.lockingBytecode, network), network);
    selected.push(utxo);
    total += utxo.satoshis;
    fee = 2 * (10 + 149 * selected.length + 34 * 2);
    if (total >= amount + fee) break;
  }
  invariant(
    selected.length > 0 && selected.length <= 50 && total >= amount + fee,
    'INSUFFICIENT_FUNDS',
    'Not enough confirmed, token-free BCH in the connected wallet addresses.',
  );
  const outputs: Output[] = [{ lockingBytecode: recipientScript, valueSatoshis: BigInt(amount) }];
  const change = total - amount - fee;
  if (change >= 546) outputs.push({ lockingBytecode: changeScript, valueSatoshis: BigInt(change) });
  else fee += change;
  const tx: TransactionCommon = {
    version: 2,
    locktime: 0,
    inputs: selected.map((u) => ({
      outpointTransactionHash: hexToBin(u.txid),
      outpointIndex: u.vout,
      sequenceNumber: 0xffffffff,
      unlockingBytecode: new Uint8Array(),
    })),
    outputs,
  };
  return {
    unsignedHex: binToHex(encodeTransactionCommon(tx)),
    sourceOutputs: selected.map((u) => ({
      lockingBytecode: u.lockingBytecode,
      valueSatoshis: String(u.satoshis),
    })),
    inputPaths: selected.map((u, i) => [i, u.path, u.index]),
    fee,
    debit: amount + fee,
    destination,
    amount,
    changeAddress,
    network,
  };
}
function pubkeyScriptAddress(bytecode: string, network: Network): string {
  const r = lockingBytecodeToCashAddress({
    bytecode: hexToBin(bytecode),
    prefix: network === 'mainnet' ? 'bitcoincash' : 'bchtest',
  });
  invariant(typeof r !== 'string', 'INVALID_UTXO', 'Only P2PKH BCH sources are supported.');
  return r.address;
}
export function validateSigned(raw: string, plan: Plan): string {
  const signed = parseTransaction(raw),
    unsigned = parseTransaction(plan.unsignedHex);
  invariant(
    signed.inputs.length === unsigned.inputs.length,
    'INTENT_MISMATCH',
    'Wallet changed the transaction inputs.',
  );
  const stripped = {
    ...signed,
    inputs: signed.inputs.map((i) => ({ ...i, unlockingBytecode: new Uint8Array() })),
  };
  invariant(
    binToHex(encodeTransactionCommon(stripped)) === plan.unsignedHex,
    'INTENT_MISMATCH',
    'Wallet transaction differs from the reviewed recipient, fee, inputs, or change.',
  );
  for (const input of signed.inputs) {
    const b = input.unlockingBytecode;
    const len = b[0];
    invariant(
      (len === 65 || (len >= 9 && len <= 73)) && b[len] === 0x61,
      'UNSAFE_SIGHASH',
      'Wallet must use SIGHASH_ALL | FORKID | UTXOS (0x61).',
    );
  }
  const sourceOutputs = plan.sourceOutputs.map((o) => ({
    lockingBytecode: hexToBin(o.lockingBytecode),
    valueSatoshis: BigInt(o.valueSatoshis),
  }));
  const valid = createVirtualMachineBCH().verify({ transaction: signed, sourceOutputs });
  invariant(
    valid === true,
    'INVALID_SIGNATURE',
    'The wallet signatures did not validate against the independently retrieved source outputs.',
  );
  return txid(raw);
}
export function walletRequest(plan: Plan) {
  const unsigned = parseTransaction(plan.unsignedHex);
  return {
    transaction: plan.unsignedHex,
    sourceOutputs: plan.sourceOutputs.map((o, i) => ({
      ...unsigned.inputs[i],
      lockingBytecode: hexToBin(o.lockingBytecode),
      valueSatoshis: BigInt(o.valueSatoshis),
    })),
    broadcast: false,
    userPrompt: `ReturnTail ${plan.network}: send ${plan.amount} satoshis to ${plan.destination}. Network fee ${plan.fee} satoshis. Refunds are new transactions.`,
  };
}
export function explorer(network: Network, id: string): string {
  return `https://blockexplorer.cash/${network === 'mainnet' ? '' : 'chipnet/'}tx/${id}`;
}
