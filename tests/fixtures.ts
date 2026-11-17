// ISOLATED TEST FIXTURES. Deterministic keys below have no real funds and must never be used by the app.
import {
  deriveHdPrivateNodeFromSeed,
  deriveHdPublicNode,
  deriveHdPrivateNodeChild,
  encodeHdPublicKey,
  generateSigningSerializationBCH,
  secp256k1,
  sha256,
  hexToBin,
  binToHex,
  encodeTransactionCommon,
  type Output,
} from '@bitauth/libauth';
import {
  buildPlan,
  deriveAddress,
  parseTransaction,
  txid,
  type Plan,
  type Network,
} from '../src/core/bch';
export const testRoot = deriveHdPrivateNodeFromSeed(Uint8Array.from({ length: 32 }, () => 42));
export function testXpub(n: Network = 'chipnet') {
  return encodeHdPublicKey({
    node: deriveHdPublicNode(testRoot),
    network: n === 'mainnet' ? 'mainnet' : 'testnet',
  }).hdPublicKey;
}
export const xpub = testXpub();
export const address = deriveAddress(xpub, 0, 'chipnet');
export const destination = deriveAddress(xpub, 1, 'chipnet');
export const change = deriveAddress(xpub, 2, 'chipnet');
export function fixturePlan(amount = 10000) {
  return buildPlan(
    [
      {
        txid: 'ab'.repeat(32),
        vout: 0,
        satoshis: 100000,
        lockingBytecode: binToHex(awaitlessScript(address)),
        path: 'receive',
        index: 0,
      },
    ],
    destination,
    amount,
    change,
    'chipnet',
  );
}
import { addressScript } from '../src/core/bch';
const awaitlessScript = (a: string) => addressScript(a, 'chipnet');
export function signFixture(plan: Plan, flag = 0x61): string {
  const transaction = parseTransaction(plan.unsignedHex),
    sourceOutputs: Output[] = plan.sourceOutputs.map((o) => ({
      lockingBytecode: hexToBin(o.lockingBytecode),
      valueSatoshis: BigInt(o.valueSatoshis),
    }));
  transaction.inputs = transaction.inputs.map((input, i) => {
    const key = deriveHdPrivateNodeChild(testRoot, plan.inputPaths[i][2]).privateKey;
    const serialization = generateSigningSerializationBCH(
      { inputIndex: i, transaction, sourceOutputs },
      {
        coveredBytecode: sourceOutputs[i].lockingBytecode,
        signingSerializationType: Uint8Array.of(flag),
      },
    );
    const signature = secp256k1.signMessageHashSchnorr(
        key,
        sha256.hash(sha256.hash(serialization)),
      ),
      pubkey = secp256k1.derivePublicKeyCompressed(key);
    if (typeof signature === 'string' || typeof pubkey === 'string')
      throw Error('Fixture signing failed');
    return {
      ...input,
      unlockingBytecode: Uint8Array.from([65, ...signature, flag, 33, ...pubkey]),
    };
  });
  return binToHex(encodeTransactionCommon(transaction));
}
export function purchaseFixture(recipient = address, amount = 10000) {
  const plan = fixturePlan(amount);
  const tx = parseTransaction(plan.unsignedHex);
  tx.outputs[0].lockingBytecode = addressScript(recipient, 'chipnet');
  plan.unsignedHex = binToHex(encodeTransactionCommon(tx));
  const raw = signFixture(plan);
  return { raw, txid: txid(raw) };
}
