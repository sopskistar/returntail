import type { Network, Plan } from '@/core/bch';
export type OrderSummary = {
  id: string;
  title: string;
  reference: string;
  network: Network;
  address: string;
  addressIndex: number;
  amount: number;
  reserved: number;
  settled: number;
  remaining: number;
  state: string;
  expiresAt: string;
  createdAt: string;
};
export type Workspace = {
  store: {
    id: string;
    name: string;
    network: Network;
    walletConfigured: boolean;
    ownership: string;
    ownershipProofs: { address: string; txid: string }[];
  };
  orders: OrderSummary[];
};
export type AttemptView = {
  id: string;
  kind: string;
  refundId: string | null;
  state: string;
  txid: string | null;
  confirmations: number;
  plan: Plan;
  expiresAt: string;
};
export type RefundView = {
  id: string;
  order_id: string;
  amount: number;
  address: string;
  reason: string;
  state: string;
  decision_note: string | null;
  created_at: string;
};
export type OrderDetail = OrderSummary & {
  storeName: string;
  payment: {
    txid: string;
    vout: number;
    amount: string;
    confirmations: number;
    state: string;
    block_hash: string | null;
    block_height: number | null;
    evidence: { provider: string; witness: string | null; merkleVerified: boolean };
    checked_at: string;
  } | null;
  refunds: RefundView[];
  attempts: AttemptView[];
  events: { id: string; action: string; created_at: string; detail: Record<string, unknown> }[];
};
