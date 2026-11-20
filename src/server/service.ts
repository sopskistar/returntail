import { randomUUID } from 'node:crypto';
import { binToHex } from '@bitauth/libauth';
import {
  addressScript,
  buildPlan,
  deriveAddress,
  validateSigned,
  verifyPayment,
  type Utxo,
} from '@/core/bch';
import { invariant, AppError } from '@/core/errors';
import { sats, remaining } from '@/core/money';
import { pool, transaction, type Sql } from './db';
import { chain, type Chain, type Observation } from './chain';
import { capabilityHash, idempotent, token } from './security';
import { network } from './config';
import type { Attempt, Order, Refund, Store } from './models';

export async function audit(
  db: Sql,
  storeId: string,
  orderId: string | null,
  action: string,
  actor: string,
  detail: unknown = {},
) {
  await db.query(
    'INSERT INTO audit_events(store_id,order_id,action,actor,detail) VALUES($1,$2,$3,$4,$5)',
    [storeId, orderId, action, actor, JSON.stringify(detail)],
  );
}
async function orderFor(
  db: Sql,
  id: string,
  actor: { merchantId: string } | { capability: string },
  lock = false,
): Promise<Order> {
  const r = await db.query<Order>(
    `SELECT o.* FROM orders o JOIN stores s ON o.store_id=s.id WHERE o.id=$1 ${lock ? 'FOR UPDATE OF o' : ''}`,
    [id],
  );
  const o = r.rows[0];
  invariant(o, 'NOT_FOUND', 'Purchase not found.', 404);
  if ('merchantId' in actor) {
    const s = await db.query('SELECT id FROM stores WHERE id=$1 AND merchant_id=$2', [
      o.store_id,
      actor.merchantId,
    ]);
    invariant(s.rows.length, 'NOT_FOUND', 'Purchase not found.', 404);
  } else
    invariant(
      actor.capability.length >= 40 && capabilityHash(actor.capability) === o.capability_hash,
      'NOT_FOUND',
      'This private purchase link is invalid or incomplete.',
      404,
    );
  invariant(
    o.network === network(),
    'WRONG_NETWORK',
    'This record belongs to another configured network.',
    409,
  );
  return o;
}
async function storeFor(db: Sql, merchantId: string, lock = false): Promise<Store> {
  const r = await db.query<Store>(
    `SELECT * FROM stores WHERE merchant_id=$1 ${lock ? 'FOR UPDATE' : ''}`,
    [merchantId],
  );
  invariant(r.rows[0], 'NOT_FOUND', 'Store not found.', 404);
  invariant(
    r.rows[0].network === network(),
    'WRONG_NETWORK',
    'This store belongs to another network.',
    409,
  );
  return r.rows[0];
}
async function requireFreshAllocation(id: string) {
  const checked = await pool().query(
    "SELECT 1 FROM audit_events WHERE order_id=$1 AND action='order.created' AND detail->>'receivingHistoryChecked'='true' LIMIT 1",
    [id],
  );
  invariant(checked.rows.length, 'RECEIVE_REVIEW_REQUIRED',
    'This request predates receiving-address checks. Ask the merchant for a new payment request before paying. Any existing transfer needs manual review.', 409);
}
function viewOrder(o: Order) {
  return {
    id: o.id,
    title: o.title,
    reference: o.reference,
    network: o.network,
    address: o.address,
    addressIndex: o.address_index,
    amount: Number(o.amount),
    reserved: Number(o.reserved),
    settled: Number(o.settled),
    remaining:
      o.state === 'confirmed'
        ? remaining(Number(o.amount), Number(o.reserved), Number(o.settled))
        : 0,
    state:
      o.state === 'awaiting_payment' && new Date(o.expires_at).getTime() < Date.now()
        ? 'expired'
        : o.state,
    expiresAt: o.expires_at,
    createdAt: o.created_at,
  };
}
function viewAttempt(a: Attempt) {
  return {
    id: a.id,
    kind: a.kind,
    refundId: a.refund_id,
    state: a.state,
    txid: a.txid,
    confirmations: a.confirmations,
    plan: a.plan,
    expiresAt: a.expires_at,
  };
}
export async function workspace(merchantId: string) {
  const s = await storeFor(pool(), merchantId);
  const orders = await pool().query<Order>(
    'SELECT * FROM orders WHERE store_id=$1 ORDER BY created_at DESC LIMIT 100',
    [s.id],
  );
  const proofs = await pool().query<{ address: string; txid: string }>(
    "SELECT address,proof_txid AS txid FROM wallet_addresses WHERE store_id=$1 AND ownership_status='spend_proven' ORDER BY address_index LIMIT 50",
    [s.id],
  );
  return {
    store: {
      id: s.id,
      name: s.name,
      network: s.network,
      walletConfigured: !!s.receive_xpub,
      ownership: proofs.rows.length ? 'specific_sources_proven' : 'unverified',
      ownershipProofs: proofs.rows,
    },
    orders: orders.rows.map(viewOrder),
  };
}
export async function configureStore(merchantId: string, name: string, xpub?: string) {
  return transaction(async (db) => {
    const s = await storeFor(db, merchantId, true);
    invariant(
      name.trim().length >= 2 && name.length <= 100,
      'INVALID_STORE',
      'Store name must contain 2–100 characters.',
    );
    if (xpub) {
      deriveAddress(xpub, 0, s.network);
      await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [
        `${s.network}:${xpub}`,
      ]);
      const other = await db.query(
        'SELECT id FROM stores WHERE network=$1 AND receive_xpub=$2 AND id<>$3',
        [s.network, xpub, s.id],
      );
      invariant(
        !other.rows.length,
        'WALLET_ALREADY_REGISTERED',
        'This receiving key is already assigned to another store. Sign in to that store or connect a different wallet.',
        409,
      );
      const count = await db.query('SELECT id FROM orders WHERE store_id=$1 LIMIT 1', [s.id]);
      invariant(
        !count.rows.length || s.receive_xpub === xpub,
        'WALLET_LOCKED',
        'The receive public key cannot change after an order is created. Create another merchant account for a different wallet.',
        409,
      );
    }
    await db.query('UPDATE stores SET name=$1,receive_xpub=COALESCE($2,receive_xpub) WHERE id=$3', [
      name.trim(),
      xpub ?? null,
      s.id,
    ]);
    await audit(db, s.id, null, 'store.configured', merchantId, { walletConfigured: !!xpub });
    return { configured: true, ownership: 'unverified' };
  });
}
export async function createOrder(
  merchantId: string,
  input: { title: string; amount: number },
  key: string,
  provider: Chain = chain,
) {
  return transaction(async (db) =>
    idempotent(db, `order:${merchantId}`, key, input, async () => {
      const s = await storeFor(db, merchantId, true);
      invariant(
        s.receive_xpub,
        'WALLET_REQUIRED',
        'Connect your BCH wallet and save its receive public key before creating an order.',
        409,
      );
      const amount = sats(input.amount),
        id = randomUUID(),
        cap = token(),
        firstIndex = s.address_index;
      invariant(
        firstIndex < 10000,
        'ADDRESS_LIMIT',
        'This release supports receive indices below 10,000; contact support before creating more requests.',
        409,
      );
      // A chain-level xpub may belong to an already-used wallet. Never allocate
      // an address with old payment history to a new purchase. The store lock
      // serializes allocation; bounded parallel reads avoid unbounded discovery.
      const candidates = Array.from({ length: Math.min(5, 10000 - firstIndex) }, (_, offset) => ({
        index: firstIndex + offset,
        address: deriveAddress(s.receive_xpub!, firstIndex + offset, s.network),
      }));
      const checked = await Promise.all(candidates.map(async (candidate) => ({
        ...candidate,
        used: (await provider.history(candidate.address, s.network)).length > 0,
      })));
      const fresh = checked.find(candidate => !candidate.used);
      invariant(fresh, 'RECEIVE_RANGE_USED',
        'The next five receive addresses already have history. Use a fresh merchant wallet for a new store or contact support to advance the receive range.', 409);
      const { address, index } = fresh,
        reference = `RT-${id.slice(0, 8).toUpperCase()}`;
      await db.query('UPDATE stores SET address_index=$2 WHERE id=$1', [s.id, index + 1]);
      await db.query(
        'INSERT INTO wallet_addresses(id,store_id,network,address,address_index) VALUES($1,$2,$3,$4,$5)',
        [randomUUID(), s.id, s.network, address, index],
      );
      await db.query(
        "INSERT INTO orders(id,store_id,capability_hash,title,reference,network,address,address_index,amount,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now()+interval '24 hours')",
        [id, s.id, capabilityHash(cap), input.title, reference, s.network, address, index, amount],
      );
      await audit(db, s.id, id, 'order.created', merchantId, {
        amount, reference, receivingHistoryChecked: true, receiveIndex: index,
      });
      return { id, capability: cap, reference };
    }),
  );
}
export async function orderDetail(
  id: string,
  actor: { merchantId: string } | { capability: string },
) {
  const o = await orderFor(pool(), id, actor);
  const payment = await pool().query(
    'SELECT txid,vout,amount,confirmations,state,block_hash,block_height,evidence,checked_at FROM payments WHERE order_id=$1',
    [id],
  );
  const refunds = await pool().query<Refund>(
    'SELECT * FROM refunds WHERE order_id=$1 ORDER BY created_at DESC',
    [id],
  );
  const attempts = await pool().query<Attempt>(
    'SELECT * FROM attempts WHERE order_id=$1 ORDER BY created_at DESC',
    [id],
  );
  const events = await pool().query(
    'SELECT id,action,detail,created_at FROM audit_events WHERE order_id=$1 ORDER BY id',
    [id],
  );
  const store = await pool().query('SELECT name FROM stores WHERE id=$1', [o.store_id]);
  return {
    ...viewOrder(o),
    storeName: store.rows[0].name,
    payment: payment.rows[0] ?? null,
    refunds: refunds.rows.map((r) => ({ ...r, amount: Number(r.amount) })),
    attempts: attempts.rows.map(viewAttempt),
    events: events.rows,
  };
}
export async function verifyPurchase(
  id: string,
  actor: { merchantId: string } | { capability: string },
  providedTxid?: string,
  provider: Chain = chain,
) {
  const original = await orderFor(pool(), id, actor);
  await requireFreshAllocation(original.id);
  const old = await pool().query('SELECT txid FROM payments WHERE order_id=$1', [id]);
  const ids = providedTxid
    ? [providedTxid]
    : old.rows.length
      ? [old.rows[0].txid]
      : await provider.history(original.address, original.network);
  let observation: Observation | null = null;
  for (const candidate of ids.slice(0, 20)) {
    const observed = await provider.observe(candidate, original.address, original.network);
    if (!observed) continue;
    invariant(
      observed.network === original.network,
      'WRONG_NETWORK',
      'Payment was observed on another network.',
    );
    try {
      verifyPayment(
        observed.raw,
        candidate,
        original.address,
        Number(original.amount),
        original.network,
      );
      observation = observed;
      break;
    } catch (e) {
      if (providedTxid || old.rows.length) throw e;
    }
  }
  if (!observation) {
    if (old.rows.length) {
      await transaction(async (db) => {
        const o = await orderFor(db, id, actor, true);
        await db.query(
          "UPDATE payments SET state='review_required',confirmations=0,checked_at=now() WHERE order_id=$1",
          [id],
        );
        await db.query("UPDATE orders SET state='review_required' WHERE id=$1", [id]);
        await audit(db, o.store_id, id, 'payment.observation_lost', 'network');
      });
      return {
        state: 'review_required',
        message: 'Previously observed payment is missing. Refunds are paused.',
      };
    }
    throw new AppError(
      'PAYMENT_NOT_FOUND',
      'No matching payment is visible yet. Wait for the indexer, then check again.',
      409,
    );
  }
  const observed = observation,
    result = verifyPayment(
      observed.raw,
      observed.txid,
      original.address,
      Number(original.amount),
      original.network,
    );
  return transaction(async (db) => {
    const o = await orderFor(db, id, actor, true),
      existing = await db.query('SELECT txid,state,block_hash FROM payments WHERE order_id=$1', [
        id,
      ]);
    invariant(
      o.state !== 'cancelled',
      'ORDER_CANCELLED',
      'This order was cancelled; manual merchant review is required.',
      409,
    );
    invariant(
      existing.rows.length || new Date(o.expires_at).getTime() > Date.now(),
      'ORDER_EXPIRED',
      'This order expired. A late payment needs manual merchant review.',
      409,
    );
    invariant(
      !existing.rows.length || existing.rows[0].txid === observed.txid,
      'DUPLICATE_PAYMENT',
      'Another transaction is already allocated to this order.',
      409,
    );
    const reorg =
      existing.rows[0]?.state === 'confirmed' &&
      (observed.confirmations === 0 || existing.rows[0].block_hash !== observed.blockHash);
    const state = reorg
      ? 'review_required'
      : observed.confirmations > 0
        ? 'confirmed'
        : 'unconfirmed';
    await db.query(
      `INSERT INTO payments(id,order_id,network,txid,vout,amount,confirmations,block_hash,block_height,state,evidence)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(order_id) DO UPDATE SET confirmations=EXCLUDED.confirmations,block_hash=EXCLUDED.block_hash,block_height=EXCLUDED.block_height,state=EXCLUDED.state,evidence=EXCLUDED.evidence,checked_at=now()`,
      [
        randomUUID(),
        id,
        o.network,
        observed.txid,
        result.vout,
        result.satoshis,
        observed.confirmations,
        observed.blockHash,
        observed.blockHeight,
        state,
        JSON.stringify({ ...observed, raw: undefined }),
      ],
    );
    await db.query('UPDATE orders SET state=$1 WHERE id=$2', [state, id]);
    if (existing.rows[0]?.state !== state)
      await audit(db, o.store_id, id, `payment.${state}`, 'network', {
        txid: observed.txid,
        vout: result.vout,
        confirmations: observed.confirmations,
      });
    return { state, txid: observed.txid, confirmations: observed.confirmations };
  });
}
export async function requestRefund(
  id: string,
  capability: string,
  input: { amount: number; address: string; reason: string },
  key: string,
) {
  return transaction(async (db) =>
    idempotent(db, `refund-request:${id}:${capabilityHash(capability)}`, key, input, async () => {
      const o = await orderFor(db, id, { capability }, true);
      invariant(
        o.state === 'confirmed',
        'PAYMENT_NOT_CONFIRMED',
        'A confirmed purchase is required before requesting a refund.',
        409,
      );
      const amount = sats(input.amount);
      addressScript(input.address, o.network);
      invariant(
        amount <= remaining(Number(o.amount), Number(o.reserved), Number(o.settled)),
        'REFUND_LIMIT',
        'The refund exceeds the remaining purchase balance.',
        409,
      );
      const rid = randomUUID();
      await db.query(
        'INSERT INTO refunds(id,order_id,amount,address,reason) VALUES($1,$2,$3,$4,$5)',
        [rid, id, amount, input.address, input.reason],
      );
      await audit(db, o.store_id, id, 'refund.requested', 'customer', { refundId: rid, amount });
      return { id: rid, state: 'requested' };
    }),
  );
}
export async function decideRefund(
  merchantId: string,
  refundId: string,
  decision: 'approve' | 'reject',
  note: string,
  key: string,
) {
  return transaction(async (db) =>
    idempotent(db, `decision:${merchantId}`, key, { refundId, decision, note }, async () => {
      const r = await db.query<Refund>('SELECT * FROM refunds WHERE id=$1', [refundId]);
      invariant(r.rows[0], 'NOT_FOUND', 'Refund request not found.', 404);
      const o = await orderFor(db, r.rows[0].order_id, { merchantId }, true);
      const locked = await db.query<Refund>('SELECT * FROM refunds WHERE id=$1 FOR UPDATE', [
          refundId,
        ]),
        refund = locked.rows[0];
      invariant(
        refund.state === 'requested',
        'INVALID_STATE',
        'This request has already been decided.',
        409,
      );
      if (decision === 'approve') {
        invariant(
          o.state === 'confirmed',
          'PAYMENT_NOT_CONFIRMED',
          'Payment must remain confirmed before approval.',
          409,
        );
        remaining(Number(o.amount), Number(o.reserved), Number(o.settled));
        const updated = await db.query(
          'UPDATE orders SET reserved=reserved+$1 WHERE id=$2 AND reserved+settled+$1<=amount RETURNING id',
          [refund.amount, o.id],
        );
        invariant(
          updated.rows.length,
          'REFUND_LIMIT',
          'Other approved refunds already reserve this purchase balance.',
          409,
        );
      }
      const state = decision === 'approve' ? 'approved' : 'rejected';
      await db.query('UPDATE refunds SET state=$1,decision_note=$2,decided_at=now() WHERE id=$3', [
        state,
        note,
        refundId,
      ]);
      await audit(db, o.store_id, o.id, `refund.${state}`, merchantId, {
        refundId,
        amount: Number(refund.amount),
      });
      return { state };
    }),
  );
}
export type WalletSource = {
  xpub: string;
  changeXpub: string;
  changeIndex: number;
  indices: number[];
};
export async function prepareAttempt(
  id: string,
  actor: { merchantId: string } | { capability: string },
  source: WalletSource,
  key: string,
  refundId?: string,
  provider: Chain = chain,
) {
  const o = await orderFor(pool(), id, actor);
  invariant(
    !refundId || 'merchantId' in actor,
    'UNAUTHORIZED',
    'Merchant authentication is required.',
    403,
  );
  const purpose = refundId ? 'refund' : 'payment';
  if (!refundId) await requireFreshAllocation(id);
  if (refundId) {
    const s = await storeFor(pool(), 'merchantId' in actor ? actor.merchantId : '');
    invariant(
      s.receive_xpub === source.xpub,
      'WALLET_MISMATCH',
      'Connect the merchant wallet registered for this store.',
    );
    await verifyPurchase(id, actor, undefined, provider);
  }
  // Xpub proves derivation, not ownership; signed and observed spends establish source control.
  const sourceAddresses = source.indices.map((i) => ({
    address: deriveAddress(source.xpub, i, o.network),
    index: i,
  }));
  const changeAddress = deriveAddress(source.changeXpub, source.changeIndex, o.network);
  const known = await pool().query<Attempt>(
    `SELECT * FROM attempts WHERE order_id=$1 AND ${refundId ? 'refund_id=$2' : "kind='payment'"} AND state<>'cancelled' LIMIT 1`,
    refundId ? [id, refundId] : [id],
  );
  if (known.rows.length) return viewAttempt(known.rows[0]);
  const utxos: Utxo[] = [];
  for (const a of sourceAddresses)
    utxos.push(...(await provider.utxos(a.address, o.network, 'receive', a.index)));
  return transaction(async (db) =>
    idempotent(
      db,
      `prepare:${id}:${refundId ?? 'payment'}`,
      key,
      { source, refundId },
      async () => {
        const locked = await orderFor(db, id, actor, true);
        const existing = await db.query<Attempt>(
          `SELECT * FROM attempts WHERE order_id=$1 AND ${refundId ? 'refund_id=$2' : "kind='payment'"} AND state<>'cancelled' LIMIT 1`,
          refundId ? [id, refundId] : [id],
        );
        if (existing.rows[0]) return viewAttempt(existing.rows[0]);
        let amount = Number(locked.amount),
          destination = locked.address;
        if (refundId) {
          const r = await db.query<Refund>(
            'SELECT * FROM refunds WHERE id=$1 AND order_id=$2 FOR UPDATE',
            [refundId, id],
          );
          invariant(
            r.rows[0]?.state === 'approved',
            'INVALID_STATE',
            'Approve the refund before preparing a transaction.',
            409,
          );
          invariant(
            locked.state === 'confirmed',
            'PAYMENT_NOT_CONFIRMED',
            'The original payment requires review.',
            409,
          );
          amount = Number(r.rows[0].amount);
          destination = r.rows[0].address;
        } else
          invariant(
            locked.state === 'awaiting_payment' &&
              new Date(locked.expires_at).getTime() > Date.now(),
            'ORDER_CLOSED',
            'This order has already been paid or expired.',
            409,
          );
        const available: Utxo[] = [];
        for (const u of utxos) {
          const r = await db.query(
            'SELECT attempt_id FROM input_reservations WHERE network=$1 AND txid=$2 AND vout=$3',
            [locked.network, u.txid, u.vout],
          );
          if (!r.rows.length) available.push(u);
        }
        const plan = buildPlan(available, destination, amount, changeAddress, locked.network);
        const aid = randomUUID();
        await db.query(
          "INSERT INTO attempts(id,order_id,refund_id,kind,network,plan,expires_at) VALUES($1,$2,$3,$4,$5,$6,now()+interval '15 minutes')",
          [aid, id, refundId ?? null, purpose, locked.network, JSON.stringify(plan)],
        );
        const decoded = (await import('@/core/bch')).parseTransaction(plan.unsignedHex);
        for (const input of decoded.inputs)
          await db.query(
            'INSERT INTO input_reservations(network,txid,vout,attempt_id) VALUES($1,$2,$3,$4)',
            [locked.network, binToHex(input.outpointTransactionHash), input.outpointIndex, aid],
          );
        if (refundId)
          await db.query("UPDATE refunds SET state='awaiting_signature' WHERE id=$1", [refundId]);
        await audit(
          db,
          locked.store_id,
          id,
          `${purpose}.prepared`,
          'merchantId' in actor ? actor.merchantId : 'customer',
          { attemptId: aid, fee: plan.fee, amount },
        );
        return {
          id: aid,
          kind: purpose,
          refundId: refundId ?? null,
          state: 'awaiting_signature',
          txid: null,
          confirmations: 0,
          plan,
          expiresAt: new Date(Date.now() + 900000),
        };
      },
    ),
  );
}
export async function submitSigned(
  attemptId: string,
  actor: { merchantId: string } | { capability: string },
  raw: string,
  provider: Chain = chain,
) {
  const found = await pool().query<Attempt>('SELECT * FROM attempts WHERE id=$1', [attemptId]);
  invariant(found.rows[0], 'NOT_FOUND', 'Transaction attempt not found.', 404);
  const attempt = found.rows[0];
  await orderFor(pool(), attempt.order_id, actor);
  invariant(
    attempt.kind !== 'refund' || 'merchantId' in actor,
    'UNAUTHORIZED',
    'Only the merchant can settle refunds.',
    403,
  );
  const computed = validateSigned(raw, attempt.plan);
  await transaction(async (db) => {
    const o = await orderFor(db, attempt.order_id, actor, true);
    const locked = (
      await db.query<Attempt>('SELECT * FROM attempts WHERE id=$1 FOR UPDATE', [attemptId])
    ).rows[0];
    if (locked.raw_tx) {
      invariant(
        locked.raw_tx === raw,
        'ATTEMPT_CONFLICT',
        'This attempt already has a different signed transaction.',
        409,
      );
      return;
    }
    invariant(
      locked.state === 'awaiting_signature' && new Date(locked.expires_at).getTime() > Date.now(),
      'ATTEMPT_EXPIRED',
      'This signing intent expired. Cancel it before preparing another.',
      409,
    );
    invariant(
      o.state === (attempt.kind === 'refund' ? 'confirmed' : 'awaiting_payment'),
      'INVALID_STATE',
      'Purchase state changed. Do not broadcast this transaction.',
      409,
    );
    await db.query(
      "UPDATE attempts SET raw_tx=$1,txid=$2,state='signed',updated_at=now() WHERE id=$3",
      [raw, computed, attemptId],
    );
    if (attempt.refund_id)
      await db.query("UPDATE refunds SET state='signed' WHERE id=$1", [attempt.refund_id]);
    await audit(
      db,
      o.store_id,
      o.id,
      `${attempt.kind}.signed`,
      'merchantId' in actor ? actor.merchantId : 'customer',
      { attemptId, txid: computed },
    );
  });
  // The signed bytes and deterministic txid are durable BEFORE any broadcast.
  const status = await pool().query<Attempt>('SELECT * FROM attempts WHERE id=$1', [attemptId]);
  if (['confirmed', 'unconfirmed', 'review_required'].includes(status.rows[0].state))
    return viewAttempt(status.rows[0]);
  await setBroadcastState(attemptId, 'broadcast_unknown');
  try {
    await provider.broadcast(raw, attempt.network);
    await setBroadcastState(attemptId, 'broadcast');
  } catch {
    // Rejection and timeout both retain reservations. A node may have relayed bytes already.
    await setBroadcastState(attemptId, 'broadcast_unknown');
  }
  try {
    await reconcileAttempt(attemptId, provider);
  } catch {
    /* Durable uncertain state remains visible. */
  }
  return viewAttempt(
    (await pool().query<Attempt>('SELECT * FROM attempts WHERE id=$1', [attemptId])).rows[0],
  );
}
async function setBroadcastState(id: string, state: 'broadcast' | 'broadcast_unknown') {
  await transaction(async (db) => {
    const a = (await db.query<Attempt>('SELECT * FROM attempts WHERE id=$1 FOR UPDATE', [id]))
      .rows[0];
    if (!['signed', 'broadcast', 'broadcast_unknown'].includes(a.state)) return;
    await db.query('UPDATE attempts SET state=$1,updated_at=now() WHERE id=$2', [state, id]);
    if (a.refund_id)
      await db.query('UPDATE refunds SET state=$1 WHERE id=$2', [state, a.refund_id]);
  });
}
export async function cancelUnsigned(
  attemptId: string,
  actor: { merchantId: string } | { capability: string },
) {
  return transaction(async (db) => {
    const a = (await db.query<Attempt>('SELECT * FROM attempts WHERE id=$1', [attemptId])).rows[0];
    invariant(a, 'NOT_FOUND', 'Attempt not found.', 404);
    const o = await orderFor(db, a.order_id, actor, true);
    invariant(
      a.kind !== 'refund' || 'merchantId' in actor,
      'UNAUTHORIZED',
      'Merchant access required.',
      403,
    );
    const locked = (
      await db.query<Attempt>('SELECT * FROM attempts WHERE id=$1 FOR UPDATE', [attemptId])
    ).rows[0];
    invariant(
      locked.state === 'awaiting_signature' && !locked.raw_tx,
      'OUTCOME_UNKNOWN',
      'A signed attempt cannot be cancelled or replaced. Reconcile its transaction instead.',
      409,
    );
    await db.query("UPDATE attempts SET state='cancelled',updated_at=now() WHERE id=$1", [
      attemptId,
    ]);
    await db.query('DELETE FROM input_reservations WHERE attempt_id=$1', [attemptId]);
    if (a.refund_id)
      await db.query("UPDATE refunds SET state='approved' WHERE id=$1", [a.refund_id]);
    await audit(
      db,
      o.store_id,
      o.id,
      `${a.kind}.signing_cancelled`,
      'merchantId' in actor ? actor.merchantId : 'customer',
      { attemptId },
    );
    return { state: 'cancelled' };
  });
}
export async function rebroadcastSaved(
  attemptId: string,
  actor: { merchantId: string } | { capability: string },
  provider: Chain = chain,
) {
  const a = (await pool().query<Attempt>('SELECT * FROM attempts WHERE id=$1', [attemptId]))
    .rows[0];
  invariant(a?.raw_tx, 'NOT_SIGNED', 'No signed transaction is saved.', 409);
  await orderFor(pool(), a.order_id, actor);
  invariant(
    a.kind !== 'refund' || 'merchantId' in actor,
    'UNAUTHORIZED',
    'Merchant access is required.',
    403,
  );
  invariant(
    ['signed', 'broadcast_unknown', 'broadcast'].includes(a.state),
    'INVALID_STATE',
    'This transaction needs reconciliation rather than rebroadcast.',
    409,
  );
  // A failed provider query aborts this action. Only a successful absence check permits identical-byte rebroadcast.
  await reconcileAttempt(attemptId, provider);
  const checked = (await pool().query<Attempt>('SELECT * FROM attempts WHERE id=$1', [attemptId]))
    .rows[0];
  if (['confirmed', 'unconfirmed', 'review_required'].includes(checked.state))
    return viewAttempt(checked);
  return submitSigned(attemptId, actor, a.raw_tx, provider);
}
export async function reconcileAttempt(id: string, provider: Chain = chain) {
  const a = (await pool().query<Attempt>('SELECT * FROM attempts WHERE id=$1', [id])).rows[0];
  invariant(a?.txid && a.raw_tx, 'NOT_SIGNED', 'No signed transaction exists to reconcile.', 409);
  const observed = await provider.observe(a.txid, a.plan.destination, a.network);
  if (!observed) {
    if (['unconfirmed', 'confirmed'].includes(a.state))
      await transaction(async (db) => {
        const o = (
          await db.query<Order>('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [a.order_id])
        ).rows[0];
        await db.query(
          "UPDATE attempts SET state='review_required',confirmations=0,updated_at=now() WHERE id=$1",
          [id],
        );
        if (a.refund_id)
          await db.query("UPDATE refunds SET state='review_required' WHERE id=$1", [a.refund_id]);
        await audit(db, o.store_id, o.id, `${a.kind}.observation_lost`, 'network', {
          attemptId: id,
        });
      });
    return { state: 'broadcast_unknown' };
  }
  invariant(
    observed.network === a.network && observed.raw === a.raw_tx,
    'NETWORK_MISMATCH',
    'Observed transaction does not match the signed intent.',
    503,
  );
  validateSigned(observed.raw, a.plan);
  if (a.kind === 'payment') {
    const merchant = (
      await pool().query(
        'SELECT s.merchant_id FROM stores s JOIN orders o ON o.store_id=s.id WHERE o.id=$1',
        [a.order_id],
      )
    ).rows[0].merchant_id;
    await verifyPurchase(a.order_id, { merchantId: merchant }, a.txid, provider);
  }
  return transaction(async (db) => {
    const o = (await db.query<Order>('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [a.order_id]))
      .rows[0];
    const locked = (await db.query<Attempt>('SELECT * FROM attempts WHERE id=$1 FOR UPDATE', [id]))
      .rows[0];
    const reorg =
      locked.state === 'confirmed' &&
      (observed.confirmations === 0 || locked.block_hash !== observed.blockHash);
    const state = reorg
      ? 'review_required'
      : observed.confirmations > 0
        ? 'confirmed'
        : 'unconfirmed';
    const settled = a.refund_id
      ? await db.query('SELECT refund_id FROM refund_settlements WHERE refund_id=$1', [a.refund_id])
      : null;
    if (a.refund_id && state === 'confirmed' && !settled?.rows.length) {
      const r = (
        await db.query<Refund>('SELECT * FROM refunds WHERE id=$1 FOR UPDATE', [a.refund_id])
      ).rows[0];
      const updated = await db.query(
        'UPDATE orders SET reserved=reserved-$1,settled=settled+$1 WHERE id=$2 AND reserved>=$1 RETURNING id',
        [r.amount, o.id],
      );
      invariant(
        updated.rows.length,
        'ACCOUNTING_INVARIANT',
        'Refund reservation could not settle.',
        409,
      );
      await db.query(
        'INSERT INTO refund_settlements(refund_id,attempt_id,amount,txid) VALUES($1,$2,$3,$4)',
        [a.refund_id, a.id, r.amount, a.txid],
      );
      for (const source of a.plan.sourceOutputs) {
        const addresses = await db.query<{ address: string }>(
          'SELECT address FROM wallet_addresses WHERE store_id=$1',
          [o.store_id],
        );
        for (const addr of addresses.rows)
          if (binToHex(addressScript(addr.address, a.network)) === source.lockingBytecode)
            await db.query(
              "UPDATE wallet_addresses SET ownership_status='spend_proven',proof_txid=$1 WHERE store_id=$2 AND address=$3",
              [a.txid, o.store_id, addr.address],
            );
      }
    }
    // Reorganizations never release money; settled value is retained conservatively.
    await db.query(
      'UPDATE attempts SET state=$1,confirmations=$2,block_hash=$3,evidence=$4,updated_at=now() WHERE id=$5',
      [
        state,
        observed.confirmations,
        observed.blockHash,
        JSON.stringify({ ...observed, raw: undefined }),
        id,
      ],
    );
    if (a.refund_id)
      await db.query('UPDATE refunds SET state=$1 WHERE id=$2', [state, a.refund_id]);
    if (locked.state !== state)
      await audit(db, o.store_id, o.id, `${a.kind}.${state}`, 'network', {
        attemptId: id,
        txid: a.txid,
        confirmations: observed.confirmations,
      });
    return { state, confirmations: observed.confirmations };
  });
}
export async function reconcileOrder(
  id: string,
  actor: { merchantId: string } | { capability: string },
  provider: Chain = chain,
) {
  await orderFor(pool(), id, actor);
  const attempts = await pool().query<Attempt>(
    'SELECT * FROM attempts WHERE order_id=$1 AND raw_tx IS NOT NULL ORDER BY created_at',
    [id],
  );
  for (const a of attempts.rows) await reconcileAttempt(a.id, provider);
  const p = await pool().query('SELECT id FROM payments WHERE order_id=$1', [id]);
  if (p.rows.length) await verifyPurchase(id, actor, undefined, provider);
  return orderDetail(id, actor);
}
export async function publicResolution(refundId: string) {
  const r = await pool().query(
    `SELECT r.id,r.state,r.amount,o.reference,o.network,p.txid AS payment_txid,p.vout AS payment_vout,a.txid AS refund_txid,a.confirmations,a.block_hash,a.evidence,a.updated_at FROM refunds r JOIN orders o ON o.id=r.order_id JOIN payments p ON p.order_id=o.id JOIN attempts a ON a.refund_id=r.id WHERE r.id=$1 AND a.txid IS NOT NULL`,
    [refundId],
  );
  invariant(r.rows[0], 'NOT_FOUND', 'Resolution receipt not found.', 404);
  return {
    ...r.rows[0],
    amount: Number(r.rows[0].amount),
    assertion:
      'Merchant approval and purchase association are application records. Transaction outputs and inclusion are independently checked network evidence.',
  };
}
export async function reconcileAll() {
  const attempts = await pool().query<Attempt>(
    'SELECT * FROM attempts WHERE raw_tx IS NOT NULL ORDER BY updated_at LIMIT 50',
  );
  const results = [];
  for (const a of attempts.rows) {
    try {
      results.push({ id: a.id, ...(await reconcileAttempt(a.id)) });
    } catch {
      results.push({ id: a.id, state: 'provider_unavailable' });
    }
  }
  const payments = await pool().query<{ order_id: string; merchant_id: string }>(
    'SELECT p.order_id,s.merchant_id FROM payments p JOIN orders o ON o.id=p.order_id JOIN stores s ON s.id=o.store_id ORDER BY p.checked_at LIMIT 20',
  );
  for (const p of payments.rows) {
    try {
      results.push({
        id: p.order_id,
        ...(await verifyPurchase(p.order_id, { merchantId: p.merchant_id })),
      });
    } catch {
      results.push({ id: p.order_id, state: 'provider_unavailable' });
    }
  }
  return results;
}
export { orderFor };
