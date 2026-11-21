// Genuine PostgreSQL integration tests in a dedicated schema. Chain data is explicitly isolated fixture data.
import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Pool } from 'pg';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { binToHex } from '@bitauth/libauth';
import { addressScript, buildPlan, deriveAddress, txid } from '../../src/core/bch';
import { pool, transaction } from '../../src/server/db';
import {
  capabilityHash,
  idempotent,
  rateLimit,
  passwordHash,
  passwordMatches,
} from '../../src/server/security';
import * as service from '../../src/server/service';
import type { Chain, Observation } from '../../src/server/chain';
import { xpub, address, destination, purchaseFixture, signFixture } from '../fixtures';
const orderAddress = deriveAddress(xpub, 1, 'chipnet');
const schema = 'returntail_security_test';
let admin: Pool;
let merchantId: string, otherId: string, storeId: string, orderId: string, cap: string;
const local = 'postgresql://returntail:returntail-local-test-only@127.0.0.1:55432/returntail';
beforeAll(async () => {
  const url = process.env.RETURNTAIL_TEST_DATABASE_URL ?? local;
  if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname))
    throw Error('Integration fixtures are restricted to an isolated localhost database.');
  admin = new Pool({ connectionString: url });
  await admin.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
  const c = await admin.connect();
  try {
    await c.query(`SET search_path TO ${schema}`);
    const tables = await c.query("SELECT to_regclass('merchants') AS existing");
    if (!tables.rows[0].existing)
      await c.query(await readFile('migrations/0001_returntail.sql', 'utf8'));
    if (!(await c.query("SELECT to_regclass('order_cancellations') AS existing")).rows[0].existing)
      await c.query(await readFile('migrations/0002_payment_request_cancellation.sql', 'utf8'));
  } finally {
    c.release();
  }
  const target = new URL(url);
  target.searchParams.set('options', `-csearch_path=${schema}`);
  process.env.DATABASE_URL = target.toString();
  process.env.AUTH_SECRET = 'isolated-test-secret-no-real-data-123456789';
  process.env.BCH_NETWORK = 'chipnet';
});
beforeEach(async () => {
  await pool().query(
    'TRUNCATE merchants,sessions,stores,wallet_addresses,orders,payments,refunds,attempts,input_reservations,refund_settlements,idempotency,audit_events,rate_limits RESTART IDENTITY CASCADE',
  );
  merchantId = randomUUID();
  otherId = randomUUID();
  storeId = randomUUID();
  orderId = randomUUID();
  cap = 'fixture-capability-'.padEnd(48, 'x');
  await pool().query(
    "INSERT INTO merchants(id,email,password_hash) VALUES($1,'merchant@test.invalid','fixture'),($2,'other@test.invalid','fixture')",
    [merchantId, otherId],
  );
  await pool().query(
    "INSERT INTO stores(id,merchant_id,name,network,receive_xpub,address_index) VALUES($1,$2,'Isolated test store','chipnet',$3,2)",
    [storeId, merchantId, xpub],
  );
  await pool().query(
    "INSERT INTO orders(id,store_id,capability_hash,title,reference,network,address,address_index,amount,expires_at) VALUES($1,$2,$3,'Fixture purchase','RT-TEST','chipnet',$4,1,10000,now()+interval '1 hour')",
    [orderId, storeId, capabilityHash(cap), orderAddress],
  );
  await service.audit(pool(), storeId, orderId, 'order.created', 'ISOLATED_FIXTURE', {
    receivingHistoryChecked: true,
  });
});
afterAll(async () => {
  await pool().end();
  await admin.end();
});
function fixtureChain(
  options: {
    amount?: number;
    recipient?: string;
    confirmations?: number;
    missing?: boolean;
    wrongNetwork?: boolean;
    broadcast?: 'fail' | 'timeout';
    blockHash?: string;
  } = {},
): Chain {
  const purchase = purchaseFixture(options.recipient ?? orderAddress, options.amount ?? 10000);
  const observed: Observation = {
    network: options.wrongNetwork ? 'mainnet' : 'chipnet',
    ...purchase,
    confirmations: options.confirmations ?? 1,
    blockHeight: 100,
    blockHash: options.blockHash ?? 'bb'.repeat(32),
    provider: 'ISOLATED_FIXTURE',
    witness: null,
    checkedAt: new Date().toISOString(),
    merkleVerified: true,
  };
  return {
    history: async () => (options.missing ? [] : [purchase.txid]),
    observe: async (id) => (options.missing ? null : { ...observed, txid: id }),
    utxos: async (a, n, path, index) =>
      a === address
        ? [
            {
              txid: 'ab'.repeat(32),
              vout: 0,
              satoshis: 100000,
              lockingBytecode: binToHex(addressScript(a, n)),
              path,
              index,
            },
          ]
        : [],
    broadcast: async () => {
      if (options.broadcast) throw Error(options.broadcast);
      return purchase.txid;
    },
  };
}
async function confirm() {
  const p = fixtureChain();
  await service.verifyPurchase(orderId, { capability: cap }, undefined, p);
  return p;
}
async function request(amount = 10000) {
  return service.requestRefund(
    orderId,
    cap,
    { amount, address: destination, reason: 'Isolated test damaged parcel' },
    randomUUID(),
  );
}
async function approved(amount = 10000) {
  await confirm();
  const r = await request(amount);
  await service.decideRefund(merchantId, r.id, 'approve', 'Fixture approval', randomUUID());
  return r;
}
const balance = async () =>
  (await pool().query('SELECT reserved,settled FROM orders WHERE id=$1', [orderId])).rows[0];
describe('purchase and private capability boundaries', () => {
  it('verifies a real parsed recipient output and stores exact evidence', async () => {
    await confirm();
    const r = await service.orderDetail(orderId, { capability: cap });
    expect(r.state).toBe('confirmed');
    expect(r.payment.vout).toBe(0);
    expect(r.payment.evidence.provider).toBe('ISOLATED_FIXTURE');
  });
  it('rejects missing transaction without marking purchase paid', async () => {
    await expect(
      service.verifyPurchase(
        orderId,
        { capability: cap },
        undefined,
        fixtureChain({ missing: true }),
      ),
    ).rejects.toThrow('No matching');
    expect((await service.orderDetail(orderId, { capability: cap })).state).toBe(
      'awaiting_payment',
    );
  });
  it('rejects wrong recipient evidence', async () => {
    const p = fixtureChain({ recipient: address });
    const ids = await p.history(address, 'chipnet');
    await expect(service.verifyPurchase(orderId, { capability: cap }, ids[0], p)).rejects.toThrow(
      'output',
    );
  });
  it('rejects underpayment evidence', async () => {
    const p = fixtureChain({ amount: 9999 });
    await expect(
      service.verifyPurchase(
        orderId,
        { capability: cap },
        (await p.history(address, 'chipnet'))[0],
        p,
      ),
    ).rejects.toThrow('exactly');
  });
  it('rejects wrong-network chain evidence', async () => {
    await expect(
      service.verifyPurchase(
        orderId,
        { capability: cap },
        undefined,
        fixtureChain({ wrongNetwork: true }),
      ),
    ).rejects.toThrow('another network');
  });
  it('rejects receipt access from another customer capability', async () => {
    await expect(
      service.orderDetail(orderId, { capability: 'wrong-capability'.padEnd(48, 'x') }),
    ).rejects.toThrow('invalid or incomplete');
  });
  it('rejects another merchant accessing the purchase', async () => {
    await expect(service.orderDetail(orderId, { merchantId: otherId })).rejects.toThrow(
      'not found',
    );
  });
  it('rejects tampered purchase reference IDs', async () => {
    await expect(service.orderDetail(randomUUID(), { capability: cap })).rejects.toThrow(
      'not found',
    );
  });
  it('does not allow a refund against an unconfirmed payment', async () => {
    await service.verifyPurchase(
      orderId,
      { capability: cap },
      undefined,
      fixtureChain({ confirmations: 0 }),
    );
    await expect(request()).rejects.toThrow('confirmed purchase');
  });
  it('deduplicates repeated network notifications', async () => {
    await confirm();
    await confirm();
    expect((await pool().query('SELECT * FROM payments')).rows).toHaveLength(1);
    expect(
      (await pool().query("SELECT * FROM audit_events WHERE action='payment.confirmed'")).rows,
    ).toHaveLength(1);
  });
  it('enforces unique allocation of the same network txid/vout in SQL', async () => {
    await confirm();
    const payment = (await pool().query('SELECT * FROM payments')).rows[0],
      second = randomUUID();
    await pool().query(
      "INSERT INTO orders(id,store_id,capability_hash,title,reference,network,address,address_index,amount,expires_at) VALUES($1,$2,$3,'Other fixture','RT-OTHER','chipnet',$4,5,10000,now()+interval '1 hour')",
      [second, storeId, capabilityHash('second-fixture'), deriveAddress(xpub, 5, 'chipnet')],
    );
    await expect(
      pool().query(
        'INSERT INTO payments(id,order_id,network,txid,vout,amount,state,evidence) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
        [randomUUID(), second, 'chipnet', payment.txid, payment.vout, 10000, 'confirmed', '{}'],
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect((await pool().query('SELECT * FROM payments')).rows).toHaveLength(1);
  });
  it('pauses refunds after a confirmed payment loses observation', async () => {
    await confirm();
    await service.verifyPurchase(
      orderId,
      { capability: cap },
      undefined,
      fixtureChain({ missing: true }),
    );
    expect((await service.orderDetail(orderId, { capability: cap })).state).toBe('review_required');
    await expect(request()).rejects.toThrow();
  });
  it('tracks confirmation rollback conservatively', async () => {
    await confirm();
    await service.verifyPurchase(
      orderId,
      { capability: cap },
      undefined,
      fixtureChain({ confirmations: 0 }),
    );
    expect((await service.orderDetail(orderId, { capability: cap })).state).toBe('review_required');
  });
  it('does not accept a late payment automatically', async () => {
    await pool().query("UPDATE orders SET expires_at=now()-interval '1 second' WHERE id=$1", [
      orderId,
    ]);
    await expect(confirm()).rejects.toThrow('expired');
  });
});
describe('refund accounting, concurrency and idempotency', () => {
  it('rejects invalid refund address', async () => {
    await confirm();
    await expect(
      service.requestRefund(
        orderId,
        cap,
        { amount: 1000, address: 'bchtest:bad', reason: 'Wrong destination' },
        randomUUID(),
      ),
    ).rejects.toThrow('valid');
  });
  it('rejects above-original refund requests', async () => {
    await confirm();
    await expect(request(10001)).rejects.toThrow('exceeds');
  });
  it('rejects unauthorized merchant approval without reserving funds', async () => {
    await confirm();
    const r = await request();
    await expect(service.decideRefund(otherId, r.id, 'approve', '', randomUUID())).rejects.toThrow(
      'not found',
    );
    expect(await balance()).toMatchObject({ reserved: '0', settled: '0' });
  });
  it('records rejection and leaves balance available', async () => {
    await confirm();
    const r = await request();
    await service.decideRefund(merchantId, r.id, 'reject', 'Item was delivered', randomUUID());
    expect(await balance()).toMatchObject({ reserved: '0' });
    expect(
      (await pool().query('SELECT state FROM refunds WHERE id=$1', [r.id])).rows[0].state,
    ).toBe('rejected');
  });
  it('enforces the cumulative partial refund limit', async () => {
    await confirm();
    const a = await request(6000),
      b = await request(5000);
    await service.decideRefund(merchantId, a.id, 'approve', '', randomUUID());
    await expect(
      service.decideRefund(merchantId, b.id, 'approve', '', randomUUID()),
    ).rejects.toThrow('already reserve');
    expect(await balance()).toMatchObject({ reserved: '6000' });
  });
  it('serializes two simultaneous approvals that would over-refund', async () => {
    await confirm();
    const a = await request(7000),
      b = await request(7000);
    const results = await Promise.allSettled([
      service.decideRefund(merchantId, a.id, 'approve', '', randomUUID()),
      service.decideRefund(merchantId, b.id, 'approve', '', randomUUID()),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await balance()).toMatchObject({ reserved: '7000', settled: '0' });
  });
  it('handles two simultaneous approvals for the same request exactly once', async () => {
    await confirm();
    const r = await request(),
      key = randomUUID();
    await Promise.all([
      service.decideRefund(merchantId, r.id, 'approve', '', key),
      service.decideRefund(merchantId, r.id, 'approve', '', key),
    ]);
    expect(await balance()).toMatchObject({ reserved: '10000' });
    expect(
      (await pool().query("SELECT * FROM audit_events WHERE action='refund.approved'")).rows,
    ).toHaveLength(1);
  });
  it('deduplicates API-style refund submissions with identical keys', async () => {
    await confirm();
    const input = { amount: 1000, address: destination, reason: 'Duplicate submission fixture' },
      k = randomUUID();
    const a = await service.requestRefund(orderId, cap, input, k),
      b = await service.requestRefund(orderId, cap, input, k);
    expect(a).toEqual(b);
    expect((await pool().query('SELECT * FROM refunds')).rows).toHaveLength(1);
  });
  it('rejects replaying a key with modified amount or destination', async () => {
    await confirm();
    const k = randomUUID();
    await service.requestRefund(
      orderId,
      cap,
      { amount: 1000, address: destination, reason: 'Replay fixture' },
      k,
    );
    await expect(
      service.requestRefund(
        orderId,
        cap,
        { amount: 2000, address: destination, reason: 'Replay fixture' },
        k,
      ),
    ).rejects.toThrow('different request');
  });
  it('rolls back mutation, idempotency and audit on transaction failure', async () => {
    await expect(
      transaction(async (db) =>
        idempotent(db, 'rollback', randomUUID(), {}, async () => {
          await db.query('UPDATE orders SET reserved=5000 WHERE id=$1', [orderId]);
          await service.audit(db, storeId, orderId, 'fixture.changed', 'fixture');
          throw Error('forced rollback');
        }),
      ),
    ).rejects.toThrow('forced rollback');
    expect(await balance()).toMatchObject({ reserved: '0' });
    expect((await pool().query('SELECT * FROM idempotency')).rows).toHaveLength(0);
    expect(
      (await pool().query("SELECT * FROM audit_events WHERE action='fixture.changed'")).rows,
    ).toHaveLength(0);
  });
  it('uses database constraints as a second line of defense', async () => {
    await expect(
      pool().query('UPDATE orders SET reserved=10001 WHERE id=$1', [orderId]),
    ).rejects.toThrow();
    expect(await balance()).toMatchObject({ reserved: '0' });
  });
  it('enforces persistent rate limits', async () => {
    await rateLimit(pool(), 'fixture-bucket', 2);
    await rateLimit(pool(), 'fixture-bucket', 2);
    await expect(rateLimit(pool(), 'fixture-bucket', 2)).rejects.toThrow('Too many');
  });
  it('hashes and checks passwords using scrypt', async () => {
    const h = await passwordHash('isolated long password');
    expect(h).not.toContain('isolated');
    expect(await passwordMatches('isolated long password', h)).toBe(true);
    expect(await passwordMatches('different password', h)).toBe(false);
  });
});
describe('durable transaction settlement state machine', () => {
  async function prepared() {
    const r = await approved();
    const p = fixtureChain();
    const a = await service.prepareAttempt(
      orderId,
      { merchantId },
      { xpub, changeXpub: xpub, changeIndex: 2, indices: [0] },
      randomUUID(),
      r.id,
      p,
    );
    return { r, a, p };
  }
  it('prepares a real unsigned transaction and reserves its input', async () => {
    const { a } = await prepared();
    expect(a.state).toBe('awaiting_signature');
    expect(a.plan.fee).toBeGreaterThan(0);
    expect((await pool().query('SELECT * FROM input_reservations')).rows).toHaveLength(1);
  });
  it('cancels only an unsigned intent and retains approved refund reservation', async () => {
    const { a } = await prepared();
    await service.cancelUnsigned(a.id, { merchantId });
    expect((await pool().query('SELECT state FROM attempts')).rows[0].state).toBe('cancelled');
    expect((await pool().query('SELECT * FROM input_reservations')).rows).toHaveLength(0);
    expect(await balance()).toMatchObject({ reserved: '10000' });
  });
  it('does not release reservation on broadcast failure', async () => {
    const { a } = await prepared(),
      raw = signFixture(a.plan);
    const provider = fixtureChain({ missing: true, broadcast: 'fail' });
    const r = await service.submitSigned(a.id, { merchantId }, raw, provider);
    expect(r.state).toBe('broadcast_unknown');
    expect(r.txid).toHaveLength(64);
    expect(await balance()).toMatchObject({ reserved: '10000', settled: '0' });
    expect((await pool().query('SELECT raw_tx FROM attempts')).rows[0].raw_tx).toBe(raw);
  });
  it('persists and reconciles uncertain broadcast after a restart boundary', async () => {
    const { a } = await prepared(),
      raw = signFixture(a.plan);
    await service.submitSigned(
      a.id,
      { merchantId },
      raw,
      fixtureChain({ missing: true, broadcast: 'timeout' }),
    );
    await expect(service.cancelUnsigned(a.id, { merchantId })).rejects.toThrow(
      'cannot be cancelled',
    );
    const saved = (await pool().query('SELECT txid,raw_tx FROM attempts')).rows[0];
    const provider: Chain = {
      ...fixtureChain(),
      observe: async () => ({
        network: 'chipnet',
        txid: saved.txid,
        raw: saved.raw_tx,
        confirmations: 0,
        blockHeight: null,
        blockHash: null,
        provider: 'ISOLATED_FIXTURE',
        witness: null,
        checkedAt: new Date().toISOString(),
        merkleVerified: false,
      }),
    };
    await service.reconcileAttempt(a.id, provider);
    expect((await pool().query('SELECT state FROM attempts')).rows[0].state).toBe('unconfirmed');
    expect(await balance()).toMatchObject({ reserved: '10000', settled: '0' });
  });
  it('settles confirmed refunds once, preserves balance through reorg, and rejects duplicates', async () => {
    const { a, r } = await prepared(),
      raw = signFixture(a.plan);
    await service.submitSigned(
      a.id,
      { merchantId },
      raw,
      fixtureChain({ missing: true, broadcast: 'timeout' }),
    );
    const saved = (await pool().query('SELECT txid FROM attempts')).rows[0];
    let confirmations = 1;
    const provider: Chain = {
      ...fixtureChain(),
      observe: async () => ({
        network: 'chipnet',
        txid: saved.txid,
        raw,
        confirmations,
        blockHeight: confirmations ? 200 : null,
        blockHash: confirmations ? 'cc'.repeat(32) : null,
        provider: 'ISOLATED_FIXTURE',
        witness: null,
        checkedAt: new Date().toISOString(),
        merkleVerified: confirmations > 0,
      }),
    };
    await service.reconcileAttempt(a.id, provider);
    await service.reconcileAttempt(a.id, provider);
    expect(await balance()).toMatchObject({ reserved: '0', settled: '10000' });
    expect((await pool().query('SELECT * FROM refund_settlements')).rows).toHaveLength(1);
    confirmations = 0;
    await service.reconcileAttempt(a.id, provider);
    expect(
      (await pool().query('SELECT state FROM refunds WHERE id=$1', [r.id])).rows[0].state,
    ).toBe('review_required');
    expect(await balance()).toMatchObject({ reserved: '0', settled: '10000' });
    confirmations = 2;
    await service.reconcileAttempt(a.id, provider);
    expect(await balance()).toMatchObject({ settled: '10000' });
    await expect(request(546)).rejects.toThrow('exceeds');
  });
  it('publishes a receipt with whitelisted evidence and no raw transaction or customer fields', async () => {
    const { r, a } = await prepared(),
      raw = signFixture(a.plan),
      checkedAt = new Date().toISOString(),
      provider: Chain = {
        ...fixtureChain(),
        broadcast: async () => txid(raw),
        observe: async (id) => ({
          network: 'chipnet',
          txid: id,
          raw,
          confirmations: 3,
          blockHeight: 200,
          blockHash: 'dd'.repeat(32),
          provider: 'ISOLATED_FIXTURE',
          witness: 'ISOLATED_WITNESS',
          checkedAt,
          merkleVerified: true,
        }),
      };
    await service.submitSigned(a.id, { merchantId }, raw, provider);
    const receipt = await service.publicResolution(r.id),
      encoded = JSON.stringify(receipt);
    expect(receipt).toMatchObject({
      state: 'confirmed',
      payment_amount: 10000,
      amount: 10000,
      refund_amount: 10000,
      refund_fee: a.plan.fee,
      evidence: {
        provider: 'ISOLATED_FIXTURE',
        witness: 'ISOLATED_WITNESS',
        merkleVerified: true,
        blockHeight: 200,
        checkedAt,
      },
    });
    expect(encoded).not.toContain(raw);
    expect(encoded).not.toContain(destination);
    expect(encoded).not.toContain('Isolated test damaged parcel');
    expect(encoded).not.toContain('evidence\\":{\\"raw');
  });
  it('cannot prepare a replacement after an uncertain signed broadcast', async () => {
    const { a, r } = await prepared();
    await service.submitSigned(
      a.id,
      { merchantId },
      signFixture(a.plan),
      fixtureChain({ missing: true, broadcast: 'timeout' }),
    );
    const next = await service.prepareAttempt(
      orderId,
      { merchantId },
      { xpub, changeXpub: xpub, changeIndex: 2, indices: [0] },
      randomUUID(),
      r.id,
      fixtureChain(),
    );
    expect(next.id).toBe(a.id);
    expect((await pool().query('SELECT * FROM attempts')).rows).toHaveLength(1);
  });
  it('rechecks absence before rebroadcasting only identical signed bytes', async () => {
    const { a } = await prepared(),
      raw = signFixture(a.plan);
    await service.submitSigned(
      a.id,
      { merchantId },
      raw,
      fixtureChain({ missing: true, broadcast: 'timeout' }),
    );
    let queried = false,
      broadcast = false;
    const p: Chain = {
      ...fixtureChain({ missing: true }),
      observe: async () => {
        queried = true;
        return null;
      },
      broadcast: async (bytes) => {
        expect(queried).toBe(true);
        expect(bytes).toBe(raw);
        broadcast = true;
        throw Error('isolated timeout');
      },
    };
    await service.rebroadcastSaved(a.id, { merchantId }, p);
    expect(broadcast).toBe(true);
    expect((await pool().query('SELECT * FROM attempts')).rows).toHaveLength(1);
    expect(await balance()).toMatchObject({ reserved: '10000', settled: '0' });
  });
  it('retains malicious text as data without executing SQL', async () => {
    await confirm();
    const malicious = "<img src=x onerror=alert(1)>'); DROP TABLE merchants;--";
    const r = await service.requestRefund(
      orderId,
      cap,
      { amount: 1000, address: destination, reason: malicious },
      randomUUID(),
    );
    expect(
      (await pool().query('SELECT reason FROM refunds WHERE id=$1', [r.id])).rows[0].reason,
    ).toBe(malicious);
    expect((await pool().query('SELECT count(*) FROM merchants')).rows[0].count).toBe('2');
  });
  it('requires customer capability even when an idempotency key is known', async () => {
    await confirm();
    const k = randomUUID(),
      input = { amount: 1000, address: destination, reason: 'Capability replay fixture' };
    await service.requestRefund(orderId, cap, input, k);
    await expect(
      service.requestRefund(orderId, 'invalid'.padEnd(48, 'x'), input, k),
    ).rejects.toThrow();
  });
});

describe('payment signing preflight', () => {
  const source = { xpub, changeXpub: xpub, changeIndex: 2, indices: [0] };
  async function preparedPayment(provider = fixtureChain({ missing: true })) {
    return service.prepareAttempt(orderId, { capability: cap }, source, randomUUID(), undefined, provider);
  }

  it('permits the same saved unsigned attempt only after an empty destination-history check', async () => {
    const attempt = await preparedPayment(),
      before = (await pool().query('SELECT raw_tx,state FROM attempts WHERE id=$1', [attempt.id]))
        .rows[0];
    const result = await service.signingPreflight(
      attempt.id,
      { capability: cap },
      fixtureChain({ missing: true }),
    );
    expect(result).toEqual({ canRequestSignature: true, historyChecked: true });
    expect((await pool().query('SELECT raw_tx,state FROM attempts WHERE id=$1', [attempt.id])).rows[0])
      .toEqual(before);
  });

  it('verifies and blocks a payment already visible at the destination', async () => {
    const attempt = await preparedPayment();
    await expect(
      service.signingPreflight(attempt.id, { capability: cap }, fixtureChain()),
    ).rejects.toMatchObject({ code: 'PAYMENT_ALREADY_FOUND' });
    expect((await pool().query('SELECT state FROM orders WHERE id=$1', [orderId])).rows[0].state).toBe(
      'confirmed',
    );
    expect((await pool().query('SELECT raw_tx FROM attempts WHERE id=$1', [attempt.id])).rows[0].raw_tx)
      .toBeNull();
  });

  it('blocks unrelated receiving-address history for manual review', async () => {
    const attempt = await preparedPayment();
    await expect(
      service.signingPreflight(
        attempt.id,
        { capability: cap },
        fixtureChain({ recipient: address }),
      ),
    ).rejects.toMatchObject({ code: 'PAYMENT_ACTIVITY_REVIEW' });
    expect((await pool().query('SELECT state FROM attempts WHERE id=$1', [attempt.id])).rows[0].state)
      .toBe('awaiting_signature');
  });

  it('reconciles saved signed bytes and blocks a second wallet signature', async () => {
    const attempt = await preparedPayment(),
      raw = signFixture(attempt.plan);
    await pool().query(
      "UPDATE attempts SET raw_tx=$1,txid=$2,state='broadcast_unknown' WHERE id=$3",
      [raw, txid(raw), attempt.id],
    );
    await expect(
      service.signingPreflight(attempt.id, { capability: cap }, fixtureChain({ missing: true })),
    ).rejects.toMatchObject({ code: 'SAVED_TRANSACTION_EXISTS' });
    expect((await pool().query('SELECT raw_tx,state FROM attempts WHERE id=$1', [attempt.id])).rows[0])
      .toEqual({ raw_tx: raw, state: 'broadcast_unknown' });
  });
});

describe('new order address freshness (isolated provider history)', () => {
  const input = { title: 'Isolated address allocation fixture', amount: 10000 };
  it('refuses legacy requests without a freshness record even with a valid-looking payment', async () => {
    await pool().query('DELETE FROM audit_events WHERE order_id=$1', [orderId]);
    await expect(
      service.verifyPurchase(orderId, { capability: cap }, undefined, fixtureChain()),
    ).rejects.toThrow('predates receiving-address checks');
    expect((await pool().query('SELECT count(*) FROM payments')).rows[0].count).toBe('0');
  });
  it('skips an address with old history and exposes the allocated receive index', async () => {
    const p = fixtureChain();
    p.history = async (a) => (a === deriveAddress(xpub, 2, 'chipnet') ? ['ab'.repeat(32)] : []);
    const result = await service.createOrder(merchantId, input, randomUUID(), p);
    const order = await service.orderDetail(result.id, { merchantId });
    expect(order.addressIndex).toBe(3);
    expect(order.address).toBe(deriveAddress(xpub, 3, 'chipnet'));
    expect(
      (await pool().query('SELECT address_index FROM stores WHERE id=$1', [storeId])).rows[0]
        .address_index,
    ).toBe(4);
  });
  it('refuses an exhausted receive range without advancing the counter or creating an order', async () => {
    const p = fixtureChain();
    p.history = async () => ['ab'.repeat(32)];
    await expect(service.createOrder(merchantId, input, randomUUID(), p)).rejects.toThrow(
      'already have history',
    );
    expect(
      (await pool().query('SELECT address_index FROM stores WHERE id=$1', [storeId])).rows[0]
        .address_index,
    ).toBe(2);
    expect((await pool().query('SELECT count(*) FROM orders')).rows[0].count).toBe('1');
  });
  it('fails closed and rolls back when freshness cannot be checked', async () => {
    const p = fixtureChain();
    p.history = async () => {
      throw new Error('ISOLATED provider unavailable');
    };
    await expect(service.createOrder(merchantId, input, randomUUID(), p)).rejects.toThrow(
      'unavailable',
    );
    expect((await pool().query('SELECT count(*) FROM orders')).rows[0].count).toBe('1');
    expect(
      (await pool().query('SELECT address_index FROM stores WHERE id=$1', [storeId])).rows[0]
        .address_index,
    ).toBe(2);
  });
  it('returns the same capability on an idempotent retry without allocating or querying again', async () => {
    const p = fixtureChain();
    p.history = vi.fn(async () => []);
    const key = randomUUID();
    const first = await service.createOrder(merchantId, input, key, p);
    expect(await service.createOrder(merchantId, input, key, p)).toEqual(first);
    expect(p.history).toHaveBeenCalledTimes(5);
    expect((await pool().query('SELECT count(*) FROM orders')).rows[0].count).toBe('2');
  });
  it('serializes concurrent allocations to distinct fresh addresses', async () => {
    const p = fixtureChain();
    p.history = async () => [];
    const results = await Promise.all([
      service.createOrder(merchantId, input, randomUUID(), p),
      service.createOrder(merchantId, input, randomUUID(), p),
    ]);
    const orders = await Promise.all(results.map((r) => service.orderDetail(r.id, { merchantId })));
    expect(new Set(orders.map((o) => o.address)).size).toBe(2);
    expect(orders.map((o) => o.addressIndex).sort()).toEqual([2, 3]);
  });
});

describe('Paytaca index-zero funding gate (isolated PostgreSQL)', () => {
  const source = { xpub, changeXpub: xpub, changeIndex: 2, indices: [0] };
  async function legacy() {
    await pool().query('UPDATE orders SET address=$2,address_index=0 WHERE id=$1', [
      orderId,
      address,
    ]);
  }
  it('never allocates zero even when an existing store counter is zero', async () => {
    await legacy();
    await pool().query('UPDATE stores SET address_index=0 WHERE id=$1', [storeId]);
    const p = fixtureChain();
    p.history = async () => [];
    const created = await service.createOrder(
      merchantId,
      { title: 'Isolated positive receive', amount: 10000 },
      randomUUID(),
      p,
    );
    expect((await service.orderDetail(created.id, { merchantId })).addressIndex).toBe(1);
  });
  it('blocks preparation without modifying the preserved request or contacting funding providers', async () => {
    await legacy();
    const before = (await pool().query('SELECT * FROM orders WHERE id=$1', [orderId])).rows[0];
    const p = fixtureChain();
    p.utxos = vi.fn(p.utxos);
    await expect(
      service.prepareAttempt(orderId, { capability: cap }, source, randomUUID(), undefined, p),
    ).rejects.toThrow('Funding paused');
    expect(p.utxos).not.toHaveBeenCalled();
    expect((await pool().query('SELECT * FROM orders WHERE id=$1', [orderId])).rows[0]).toEqual(
      before,
    );
    expect((await pool().query('SELECT * FROM attempts')).rows).toHaveLength(0);
  });
  it('blocks new signed submission but permits recovery of identical durably saved bytes', async () => {
    await legacy();
    const p = fixtureChain({ missing: true });
    const inputs = await p.utxos(address, 'chipnet', 'receive', 0);
    const plan = buildPlan(inputs, address, 10000, deriveAddress(xpub, 2, 'chipnet'), 'chipnet');
    const raw = signFixture(plan);
    const id = randomUUID();
    await pool().query(
      "INSERT INTO attempts(id,order_id,kind,network,state,plan,expires_at) VALUES($1,$2,'payment','chipnet','awaiting_signature',$3,now()+interval '1 hour')",
      [id, orderId, plan],
    );
    p.broadcast = vi.fn(p.broadcast);
    await expect(service.submitSigned(id, { capability: cap }, raw, p)).rejects.toThrow(
      'Funding paused',
    );
    expect(p.broadcast).not.toHaveBeenCalled();
    expect(
      (await pool().query('SELECT raw_tx FROM attempts WHERE id=$1', [id])).rows[0].raw_tx,
    ).toBeNull();
    const { txid } = await import('../../src/core/bch');
    await pool().query(
      "UPDATE attempts SET raw_tx=$2,txid=$3,state='broadcast_unknown' WHERE id=$1",
      [id, raw, txid(raw)],
    );
    const recovered = await service.submitSigned(id, { capability: cap }, raw, p);
    expect(p.broadcast).toHaveBeenCalledWith(raw, 'chipnet');
    expect(recovered.txid).toBe(txid(raw));
    expect((await service.orderDetail(orderId, { capability: cap })).addressIndex).toBe(0);
  });
});

describe('merchant payment-request cancellation and corrections (isolated chain)', () => {
  const actor = () => ({ merchantId });
  const source = { xpub, changeXpub: xpub, changeIndex: 2, indices: [0] };
  const fresh = () => fixtureChain({ missing: true });
  const cancel = (p = fresh(), key = randomUUID()) => service.cancelOrder(orderId, actor(), key, p);
  const correction = { title: 'Corrected isolated request', amount: 10000 };
  it('safely cancels a legacy index-zero unpaid request without changing its destination or amount', async () => {
    await pool().query('UPDATE orders SET address=$2,address_index=0,amount=100000 WHERE id=$1', [
      orderId,
      address,
    ]);
    await pool().query('DELETE FROM audit_events WHERE order_id=$1', [orderId]);
    expect(await cancel()).toEqual({ state: 'cancelled', cancelled: true });
    const detail = await service.orderDetail(orderId, actor());
    expect(detail).toMatchObject({
      state: 'cancelled',
      address,
      addressIndex: 0,
      amount: 100000,
      canCancel: false,
    });
    expect(detail.events.filter((e) => e.action === 'order.cancelled')).toHaveLength(1);
    expect((await service.workspace(merchantId)).orders.map((o) => o.id)).toContain(orderId);
  });
  it('rejects a customer capability and another merchant, including replay attempts', async () => {
    const p = fresh();
    p.history = vi.fn(p.history);
    const key = randomUUID();
    await expect(service.cancelOrder(orderId, { capability: cap }, key, p)).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      service.cancelOrder(orderId, { merchantId: otherId }, key, p),
    ).rejects.toMatchObject({ status: 404 });
    expect(p.history).not.toHaveBeenCalled();
    await cancel(p, key);
    await expect(
      service.cancelOrder(orderId, { merchantId: otherId }, key, p),
    ).rejects.toMatchObject({ status: 404 });
  });
  it('serializes duplicate cancellations and logs the transition exactly once', async () => {
    const p = fresh();
    p.history = vi.fn(p.history);
    const key = randomUUID();
    const results = await Promise.all([cancel(p, key), cancel(p, key), cancel(p)]);
    expect(results.every((r) => r.cancelled)).toBe(true);
    expect(p.history).toHaveBeenCalledTimes(1);
    expect(
      (await pool().query("SELECT 1 FROM audit_events WHERE action='order.cancelled'")).rows,
    ).toHaveLength(1);
  });
  it('fails closed on provider outage and leaves the original request unchanged', async () => {
    const before = await service.orderDetail(orderId, actor());
    const p = fresh();
    p.history = async () => {
      throw Error('isolated outage');
    };
    await expect(cancel(p)).rejects.toThrow('outage');
    expect(await service.orderDetail(orderId, actor())).toEqual(before);
    expect((await pool().query('SELECT * FROM order_cancellations')).rows).toHaveLength(0);
  });
  it('blocks and records any existing address activity, even an underpayment', async () => {
    const p = fixtureChain({ amount: 546 });
    expect(await cancel(p)).toEqual({ state: 'review_required', cancelled: false });
    const detail = await service.orderDetail(orderId, actor());
    expect(detail.state).toBe('review_required');
    expect(
      detail.events.find((e) => e.action === 'order.cancellation_blocked')?.detail.txids,
    ).toHaveLength(1);
    expect((await pool().query('SELECT * FROM order_cancellations')).rows).toHaveLength(0);
  });
  it('refuses recorded payment evidence, even if the order status is stale', async () => {
    await confirm();
    await pool().query("UPDATE orders SET state='awaiting_payment' WHERE id=$1", [orderId]);
    const before = (await pool().query('SELECT * FROM payments')).rows;
    await expect(cancel()).rejects.toThrow('payment, signing or settlement');
    expect((await pool().query('SELECT * FROM payments')).rows).toEqual(before);
  });
  it.each([
    'awaiting_signature',
    'cancelled',
    'signed',
    'broadcast',
    'broadcast_unknown',
    'unconfirmed',
    'confirmed',
    'review_required',
  ])(
    'refuses %s attempt evidence without changing bytes, inputs or audit records',
    async (state) => {
      const p = fresh();
      const attempt = await service.prepareAttempt(
        orderId,
        { capability: cap },
        source,
        randomUUID(),
        undefined,
        p,
      );
      const raw = signFixture(attempt.plan);
      const { txid } = await import('../../src/core/bch');
      await pool().query('UPDATE attempts SET state=$2,raw_tx=$3,txid=$4 WHERE id=$1', [
        attempt.id,
        state,
        ['awaiting_signature', 'cancelled'].includes(state) ? null : raw,
        ['awaiting_signature', 'cancelled'].includes(state) ? null : txid(raw),
      ]);
      const before = (await pool().query('SELECT * FROM attempts')).rows;
      const inputs = (await pool().query('SELECT * FROM input_reservations')).rows;
      await expect(cancel()).rejects.toThrow('payment, signing or settlement');
      expect((await pool().query('SELECT * FROM attempts')).rows).toEqual(before);
      expect((await pool().query('SELECT * FROM input_reservations')).rows).toEqual(inputs);
    },
  );
  it.each(['unconfirmed', 'confirmed', 'review_required'])(
    'refuses %s order state',
    async (state) => {
      await pool().query('UPDATE orders SET state=$2 WHERE id=$1', [orderId, state]);
      await expect(cancel()).rejects.toThrow('requires review');
    },
  );
  it('allows unpaid expired requests to be cancelled', async () => {
    await pool().query("UPDATE orders SET expires_at=now()-interval '1 hour' WHERE id=$1", [
      orderId,
    ]);
    expect((await cancel()).cancelled).toBe(true);
  });
  it('blocks new payment preparation and provider input lookup after cancellation', async () => {
    await cancel();
    const p = fresh();
    p.utxos = vi.fn(p.utxos);
    await expect(
      service.prepareAttempt(orderId, { capability: cap }, source, randomUUID(), undefined, p),
    ).rejects.toThrow('closed');
    expect(p.utxos).not.toHaveBeenCalled();
    expect((await pool().query('SELECT * FROM attempts')).rows).toHaveLength(0);
  });
  it('cancellation winning the lock prevents a concurrent preparation', async () => {
    let release!: () => void, entered!: () => void;
    const waiting = new Promise<void>((r) => {
      release = r;
    });
    const started = new Promise<void>((r) => {
      entered = r;
    });
    const p = fresh();
    p.history = async () => {
      entered();
      await waiting;
      return [];
    };
    const cancellation = cancel(p);
    await started;
    const preparation = service.prepareAttempt(
      orderId,
      { capability: cap },
      source,
      randomUUID(),
      undefined,
      fresh(),
    );
    // Attach the rejection handler before releasing the competing transaction.
    const result = Promise.allSettled([preparation]);
    release();
    await cancellation;
    expect((await result)[0].status).toBe('rejected');
    expect((await pool().query('SELECT * FROM attempts')).rows).toHaveLength(0);
  });
  it('preparation winning the lock prevents cancellation', async () => {
    await service.prepareAttempt(
      orderId,
      { capability: cap },
      source,
      randomUUID(),
      undefined,
      fresh(),
    );
    await expect(cancel()).rejects.toThrow('signing');
  });
  it('preserves late history on a legacy cancelled address and never revives or refunds it', async () => {
    await pool().query('DELETE FROM audit_events WHERE order_id=$1', [orderId]);
    await cancel();
    const p = fixtureChain({ amount: 1000 });
    await service.verifyPurchase(orderId, { capability: cap }, undefined, p);
    await service.reconcileOrder(orderId, actor(), p);
    const detail = await service.orderDetail(orderId, actor());
    expect(detail.state).toBe('cancelled');
    expect(detail.remaining).toBe(0);
    expect(detail.cancellation.review_required).toBe(true);
    expect(detail.events.filter((e) => e.action === 'payment.after_cancellation')).toHaveLength(1);
    expect(
      detail.events.find((e) => e.action === 'payment.after_cancellation')?.detail.txid,
    ).toMatch(/^[a-f0-9]{64}$/);
    expect((await pool().query('SELECT * FROM payments')).rows).toHaveLength(0);
    await service.verifyPurchase(orderId, actor(), undefined, fresh());
    expect((await service.orderDetail(orderId, actor())).cancellation.review_required).toBe(true);
    await expect(
      service.requestRefund(
        orderId,
        cap,
        { amount: 1000, address: destination, reason: 'late fixture' },
        randomUUID(),
      ),
    ).rejects.toThrow('confirmed');
  });
  it('verification that races behind cancellation retains its exact observation for review', async () => {
    let release!: () => void, entered!: () => void;
    const waiting = new Promise<void>((r) => {
      release = r;
    });
    const started = new Promise<void>((r) => {
      entered = r;
    });
    const p = fixtureChain();
    const observe = p.observe;
    p.observe = async (...args) => {
      entered();
      await waiting;
      return observe(...args);
    };
    const checking = service.verifyPurchase(orderId, { capability: cap }, undefined, p);
    await started;
    await cancel();
    release();
    await checking;
    const detail = await service.orderDetail(orderId, actor());
    expect(detail.state).toBe('cancelled');
    expect(detail.cancellation.review_required).toBe(true);
    expect(
      detail.events.find((e) => e.action === 'payment.after_cancellation')?.detail.evidence,
    ).toMatchObject({ raw: expect.any(String), provider: 'ISOLATED_FIXTURE' });
  });
  it('creates an associated correction with a fresh positive index and idempotent private capability', async () => {
    await cancel();
    const input = { ...correction, correctedFrom: orderId };
    const key = randomUUID();
    const created = await service.createOrder(merchantId, input, key, fresh());
    expect(created).toMatchObject({
      amount: 10000,
      addressIndex: 2,
      address: deriveAddress(xpub, 2, 'chipnet'),
      capability: expect.any(String),
    });
    expect(await service.createOrder(merchantId, input, key, fresh())).toEqual(created);
    const original = await service.orderDetail(orderId, actor());
    expect(original).toMatchObject({ state: 'cancelled', address: orderAddress });
    expect((await service.orderDetail(created.id, actor())).events[0].detail.correctedFrom).toBe(
      orderId,
    );
    const encrypted = (
      await pool().query('SELECT response FROM idempotency WHERE scope=$1', [`order:${merchantId}`])
    ).rows;
    expect(JSON.stringify(encrypted)).not.toContain(created.capability);
    expect(JSON.stringify(await service.workspace(merchantId))).not.toContain(created.capability);
  });
  it('requires safe cancellation and merchant authorization before a correction', async () => {
    const input = { ...correction, correctedFrom: orderId };
    await expect(service.createOrder(merchantId, input, randomUUID(), fresh())).rejects.toThrow(
      'Safely cancel',
    );
    await cancel();
    await expect(service.createOrder(otherId, input, randomUUID(), fresh())).rejects.toMatchObject({
      status: 404,
    });
    await service.verifyPurchase(orderId, actor(), undefined, fixtureChain());
    await expect(service.createOrder(merchantId, input, randomUUID(), fresh())).rejects.toThrow(
      'Late activity',
    );
  });
  it('keeps cancelled addresses retired even if the allocation counter is stale', async () => {
    await cancel();
    await pool().query('UPDATE stores SET address_index=1 WHERE id=$1', [storeId]);
    expect(
      (await service.createOrder(merchantId, correction, randomUUID(), fresh())).addressIndex,
    ).toBe(2);
    await expect(
      service.createOrder(
        merchantId,
        { ...correction, receiving: { xpub, index: 1 } },
        randomUUID(),
        fresh(),
      ),
    ).rejects.toThrow('cannot be recycled');
  });
  it('previews without allocating and rechecks history at creation', async () => {
    const receiving = { xpub, index: 18 };
    const p = fresh();
    expect(await service.previewReceiving(merchantId, receiving, p)).toMatchObject({
      addressIndex: 18,
      address: deriveAddress(xpub, 18, 'chipnet'),
    });
    expect((await pool().query('SELECT * FROM wallet_addresses')).rows).toHaveLength(0);
    p.history = async () => ['ee'.repeat(32)];
    await expect(
      service.createOrder(merchantId, { ...correction, receiving }, randomUUID(), p),
    ).rejects.toThrow('history');
  });
  it('supports fresh positive selection below the high-water mark without lowering it', async () => {
    await pool().query('UPDATE stores SET address_index=20 WHERE id=$1', [storeId]);
    const created = await service.createOrder(
      merchantId,
      { ...correction, receiving: { xpub, index: 7 } },
      randomUUID(),
      fresh(),
    );
    expect(created.addressIndex).toBe(7);
    expect(
      (await pool().query('SELECT address_index FROM stores WHERE id=$1', [storeId])).rows[0]
        .address_index,
    ).toBe(20);
  });
  it('serializes concurrent manual selection and never assigns one address twice', async () => {
    const input = { ...correction, receiving: { xpub, index: 15 } };
    const results = await Promise.allSettled([
      service.createOrder(merchantId, input, randomUUID(), fresh()),
      service.createOrder(merchantId, input, randomUUID(), fresh()),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
  });
  it.each([0, -1, 10000, 1.5])('rejects unsafe selected index %s', async (index) => {
    await expect(service.previewReceiving(merchantId, { xpub, index }, fresh())).rejects.toThrow(
      'positive receive index',
    );
  });
  it('rejects an unregistered receiving chain and refuses a changed automatic preview', async () => {
    const { testXpub } = await import('../fixtures');
    await expect(
      service.previewReceiving(merchantId, { xpub: testXpub('mainnet'), index: 7 }, fresh()),
    ).rejects.toThrow('differs');
    await expect(
      service.createOrder(
        merchantId,
        { ...correction, expectedReceiveIndex: 9 },
        randomUUID(),
        fresh(),
      ),
    ).rejects.toThrow('changed');
    expect((await pool().query('SELECT * FROM wallet_addresses')).rows).toHaveLength(0);
  });
});

describe('cancellation review safeguards (isolated chain)', () => {
  it('keeps the same receiving index retired even if a legacy address has equivalent uppercase encoding', async () => {
    await pool().query('UPDATE orders SET address=$2 WHERE id=$1', [
      orderId,
      orderAddress.toUpperCase(),
    ]);
    await service.cancelOrder(
      orderId,
      { merchantId },
      randomUUID(),
      fixtureChain({ missing: true }),
    );
    await expect(
      service.previewReceiving(merchantId, { xpub, index: 1 }, fixtureChain({ missing: true })),
    ).rejects.toMatchObject({ code: 'RECEIVE_RANGE_USED' });
  });
  it.each(['reserved', 'settled'])(
    'preserves a nonzero %s balance and refuses cancellation',
    async (column) => {
      await pool().query(`UPDATE orders SET ${column}=1000 WHERE id=$1`, [orderId]);
      const p = fixtureChain({ missing: true });
      p.history = vi.fn(p.history);
      await expect(
        service.cancelOrder(orderId, { merchantId }, randomUUID(), p),
      ).rejects.toMatchObject({ code: 'CANCELLATION_BLOCKED' });
      expect(p.history).not.toHaveBeenCalled();
      expect((await balance())[column]).toBe('1000');
    },
  );
  it('scheduled reconciliation flags late activity without broadcasting or replacing the request', async () => {
    await service.cancelOrder(
      orderId,
      { merchantId },
      randomUUID(),
      fixtureChain({ missing: true }),
    );
    const p = fixtureChain({ amount: 546 });
    p.broadcast = vi.fn(p.broadcast);
    const results = await service.reconcileAll(p);
    expect(results).toContainEqual({ id: orderId, state: 'cancelled', reviewRequired: true });
    expect(p.broadcast).not.toHaveBeenCalled();
    const view = await service.workspace(merchantId);
    expect(view.orders[0]).toMatchObject({
      id: orderId,
      state: 'cancelled',
      cancellationReviewRequired: true,
    });
  });
  it('retains a racing full observation even when late history was recorded first', async () => {
    let release!: () => void, entered!: () => void;
    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const p = fixtureChain();
    const observe = p.observe;
    p.observe = async (...args) => {
      entered();
      await waiting;
      return observe(...args);
    };
    const checking = service.verifyPurchase(orderId, { capability: cap }, undefined, p);
    await started;
    await service.cancelOrder(
      orderId,
      { merchantId },
      randomUUID(),
      fixtureChain({ missing: true }),
    );
    await service.verifyPurchase(orderId, { capability: cap }, undefined, fixtureChain());
    release();
    await checking;
    const detail = await service.orderDetail(orderId, { merchantId });
    expect(
      detail.events.find((e) => e.action === 'payment.after_cancellation_observed')?.detail
        .evidence,
    ).toMatchObject({ raw: expect.any(String) });
    expect(detail.cancellationReviewRequired).toBe(true);
    expect(detail.state).toBe('cancelled');
  });
  it('rejects cross-network cancellation before checking the chain', async () => {
    await pool().query("UPDATE orders SET network='mainnet' WHERE id=$1", [orderId]);
    const p = fixtureChain({ missing: true });
    p.history = vi.fn(p.history);
    await expect(
      service.cancelOrder(orderId, { merchantId }, randomUUID(), p),
    ).rejects.toMatchObject({ code: 'WRONG_NETWORK' });
    expect(p.history).not.toHaveBeenCalled();
  });
});
