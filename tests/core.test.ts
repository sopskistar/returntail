import { describe, expect, it } from 'vitest';
import { binToHex, encodeTransactionCommon } from '@bitauth/libauth';
import {
  addressScript,
  deriveAddress,
  parseTransaction,
  txid,
  validateSigned,
  verifyPayment,
  buildPlan,
  explorer,
} from '../src/core/bch';
import { bch, sats, remaining } from '../src/core/money';
import { walletError, walletFailure, WalletSigningError } from '../src/core/errors';
import { signPlan } from '../src/client/wallet-adapter';
import { assertOrigin } from '../src/server/security';
import { verifyMerkle } from '../src/server/chain';
import { RelayMsgAction } from '@wizardconnect/core';
import { xpub, address, destination, fixturePlan, signFixture, purchaseFixture } from './fixtures';
describe('real BCH byte parsing and authorization (isolated fixtures)', () => {
  it('links receipts to the explicit explorer network rather than the removed root tx route', () => {
    const id = 'ab'.repeat(32);
    expect(new URL(explorer('mainnet', id)).pathname).toBe(`/mainnet/tx/${id}`);
    expect(new URL(explorer('chipnet', id)).pathname).toBe(`/chipnet/tx/${id}`);
  });
  it('validates actual P2PKH signatures with 0x61 using the BCH VM', () => {
    const p = fixturePlan(),
      raw = signFixture(p);
    expect(validateSigned(raw, p)).toBe(txid(raw));
  });
  it('rejects malformed purchase transaction data', () =>
    expect(() => parseTransaction('not-a-transaction')).toThrow());
  it('rejects a syntactically valid txid without matching bytes', () => {
    const t = purchaseFixture();
    expect(() => verifyPayment(t.raw, '00'.repeat(32), address, 10000, 'chipnet')).toThrow(
      'identity',
    );
  });
  it('rejects wrong recipient', () => {
    const t = purchaseFixture(destination);
    expect(() => verifyPayment(t.raw, t.txid, address, 10000, 'chipnet')).toThrow('output');
  });
  it('rejects underpayment', () => {
    const t = purchaseFixture(address, 9999);
    expect(() => verifyPayment(t.raw, t.txid, address, 10000, 'chipnet')).toThrow('exactly');
  });
  it('rejects overpayment instead of silently changing eligibility', () => {
    const t = purchaseFixture(address, 10001);
    expect(() => verifyPayment(t.raw, t.txid, address, 10000, 'chipnet')).toThrow();
  });
  it('allocates the exact recipient output index', () => {
    const t = purchaseFixture();
    expect(verifyPayment(t.raw, t.txid, address, 10000, 'chipnet')).toEqual({
      vout: 0,
      satoshis: 10000,
    });
  });
  it('rejects invalid refund address', () =>
    expect(() => addressScript('bchtest:madeup', 'chipnet')).toThrow());
  it('rejects the wrong address network', () =>
    expect(() => addressScript(address, 'mainnet')).toThrow('mainnet'));
  it('rejects public-key network confusion', () =>
    expect(() => deriveAddress(xpub, 0, 'mainnet')).toThrow('different network'));
  it('rejects unsafe sighash flags even with valid signature bytes', () => {
    const p = fixturePlan();
    expect(() => validateSigned(signFixture(p, 0x41), p)).toThrow('SIGHASH');
  });
  it('rejects changed recipient outputs after wallet signing', () => {
    const p = fixturePlan(),
      tx = parseTransaction(signFixture(p));
    tx.outputs[0].valueSatoshis--;
    expect(() => validateSigned(binToHex(encodeTransactionCommon(tx)), p)).toThrow('differs');
  });
  it('rejects invalid signature against correct source output', () => {
    const p = fixturePlan(),
      tx = parseTransaction(signFixture(p));
    tx.inputs[0].unlockingBytecode[10] ^= 1;
    expect(() => validateSigned(binToHex(encodeTransactionCommon(tx)), p)).toThrow('signatures');
  });
  it('keeps change and recipient values within exact funding total', () => {
    const p = fixturePlan();
    const total = parseTransaction(p.unsignedHex).outputs.reduce((n, o) => n + o.valueSatoshis, 0n);
    expect(total + BigInt(p.fee)).toBe(100000n);
    expect(p.debit).toBe(p.amount + p.fee);
  });
  it('rejects insufficient confirmed BCH', () =>
    expect(() => buildPlan([], destination, 1000, address, 'chipnet')).toThrow('Not enough'));
  it('rejects duplicate matching merchant outputs', () => {
    const t = purchaseFixture(),
      tx = parseTransaction(t.raw);
    tx.outputs.push({ ...tx.outputs[0] });
    const raw = binToHex(encodeTransactionCommon(tx));
    expect(() => verifyPayment(raw, txid(raw), address, 10000, 'chipnet')).toThrow('exactly one');
  });
  it('accepts a structurally matching single-leaf merkle root (not a PoW check)', () =>
    expect(verifyMerkle('00'.repeat(32), [], 0, '00'.repeat(80))).toBe(true));
  it('rejects incorrect merkle root', () =>
    expect(verifyMerkle('11'.repeat(32), [], 0, '00'.repeat(80))).toBe(false));
  it('rejects malformed merkle positions and branch elements', () => {
    expect(verifyMerkle('00'.repeat(32), ['z'], 0, '00'.repeat(80))).toBe(false);
    expect(verifyMerkle('00'.repeat(32), [], 1, '00'.repeat(80))).toBe(false);
  });
});
describe('wallet refusal and disconnection', () => {
  it('does not request signing from a disconnected wallet', async () => {
    let called = false;
    await expect(
      signPlan(
        {
          isWalletDiscovered: () => false,
          signTransaction: async () => {
            called = true;
            throw Error();
          },
        },
        false,
        fixturePlan(),
      ),
    ).rejects.toThrow('Connect');
    expect(called).toBe(false);
  });
  it('treats a promise rejection without a protocol response as a submission failure', async () => {
    await expect(
      signPlan(
        {
          isWalletDiscovered: () => true,
          signTransaction: async () => {
            throw Error('User rejected');
          },
        },
        true,
        fixturePlan(),
      ),
    ).rejects.toMatchObject({ stage: 'relay_submission', code: 'WALLET_REQUEST_FAILED' });
  });
  it('passes broadcast:false and explicit source-output data', async () => {
    const p = fixturePlan();
    let requested = false;
    const raw = await signPlan(
      {
        isWalletDiscovered: () => true,
        signTransaction: async (req) => {
          requested = true;
          expect(req.transaction.broadcast).toBe(false);
          expect(req.transaction.sourceOutputs[0].valueSatoshis).toBe(100000n);
          expect(req.inputPaths).toEqual(p.inputPaths);
          return {
            action: RelayMsgAction.SignTransactionResponse,
            sequence: 1,
            time: 1,
            signedTransaction: signFixture(p),
          };
        },
      },
      true,
      p,
    );
    expect(requested).toBe(true);
    expect(txid(raw)).toHaveLength(64);
  });
  it('reports sanitized signing failure stage and safe code without wallet text', () => {
    const error = walletFailure(new DOMException('private relay detail', 'AbortError'));
    expect(error.stage).toBe('signing_timeout');
    expect(error.code).toBe('WALLET_RESPONSE_TIMEOUT');
    expect(walletError(new DOMException('private relay detail', 'AbortError'))).not.toContain(
      'private relay detail',
    );
    expect(walletError(new WalletSigningError('wallet_rejection', 'USER_REJECTED', 'safe'))).toContain(
      'Wallet rejection (USER_REJECTED)',
    );
  });
  it('distinguishes a wallet rejection from invalid returned transaction bytes', async () => {
    const rejected = {
      isWalletDiscovered: () => true,
      signTransaction: async () => ({
        action: RelayMsgAction.SignTransactionResponse as const,
        sequence: 1,
        time: 1,
        signedTransaction: '',
        error: 'USER_REJECTED',
      }),
    };
    await expect(signPlan(rejected, true, fixturePlan())).rejects.toMatchObject({
      stage: 'wallet_rejection',
      code: 'USER_REJECTED',
    });

    const invalid = {
      isWalletDiscovered: () => true,
      signTransaction: async () => ({
        action: RelayMsgAction.SignTransactionResponse as const,
        sequence: 1,
        time: 1,
        signedTransaction: '00'.repeat(12),
      }),
    };
    await expect(signPlan(invalid, true, fixturePlan())).rejects.toMatchObject({
      stage: 'signed_transaction_validation',
      code: 'INVALID_TRANSACTION',
    });
  });
});
describe('integer accounting and CSRF', () => {
  it('uses exact eight-decimal BCH formatting', () => expect(bch(1)).toBe('0.00000001'));
  it('rejects fractional, nonfinite and subdust satoshis', () => {
    for (const value of [1.1, Infinity, NaN, 545, '10000']) expect(() => sats(value)).toThrow();
  });
  it('preserves the cumulative refund invariant', () => {
    expect(remaining(10000, 2500, 5000)).toBe(2500);
    expect(() => remaining(10000, 5001, 5000)).toThrow();
  });
  it('rejects cross-origin and missing-origin mutations', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    for (const origin of ['https://evil.test', null])
      expect(() =>
        assertOrigin(
          new Request('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(origin ? { origin } : {}) },
          }),
        ),
      ).toThrow('ReturnTail');
  });
  it('permits same-origin JSON and rejects other content types', () => {
    expect(() =>
      assertOrigin(
        new Request('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: { origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
        }),
      ),
    ).not.toThrow();
    expect(() =>
      assertOrigin(
        new Request('http://localhost:3000/api/orders', {
          method: 'POST',
          headers: { origin: 'http://localhost:3000', 'Content-Type': 'text/plain' },
        }),
      ),
    ).toThrow('JSON');
  });
});

describe('native address comparison (public isolated fixtures)', () => {
  it('finds the native positive receive index without a wallet or network request', async () => {
    const { findReceiveIndex } = await import('../src/client/address-check');
    expect(await findReceiveIndex(xpub, deriveAddress(xpub, 3, 'chipnet'), 'chipnet', 8)).toBe(3);
    expect(await findReceiveIndex(xpub, deriveAddress(xpub, 9, 'chipnet'), 'chipnet', 8)).toBeNull();
  });
  it('normalizes standard and token-aware encodings by locking script', async () => {
    const { lockingBytecodeToCashAddress } = await import('@bitauth/libauth');
    const { sameDestination } = await import('../src/client/address-check');
    const encoded = lockingBytecodeToCashAddress({ bytecode: addressScript(address, 'chipnet'), prefix: 'bchtest', tokenSupport: true });
    expect(typeof encoded).not.toBe('string');
    if (typeof encoded === 'string') throw Error(encoded);
    expect(encoded.address).not.toBe(address);
    expect(sameDestination(address, encoded.address, 'chipnet')).toBe(true);
    expect(sameDestination(address, destination, 'chipnet')).toBe(false);
    expect(() => sameDestination(address, address, 'mainnet')).toThrow('mainnet');
  });
  it('aborts local scanning on disconnect and rejects malformed addresses', async () => {
    const { findReceiveIndex } = await import('../src/client/address-check');
    const controller = new AbortController(); controller.abort();
    await expect(findReceiveIndex(xpub, address, 'chipnet', 8, controller.signal)).rejects.toThrow();
    await expect(findReceiveIndex(xpub, 'invalid', 'chipnet')).rejects.toThrow();
  });
});
