'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { api, message } from '@/client/api';
import { bch } from '@/core/money';
import { explorer, type Network } from '@/core/bch';
import { Status, StateTrail } from './status';
import { Loading, ServiceError } from './workspace-client';
type Receipt = {
  id: string;
  state: string;
  amount: number;
  reference: string;
  network: Network;
  payment_txid: string;
  payment_vout: number;
  payment_amount: number;
  payment_confirmations: number;
  payment_block_hash: string | null;
  payment_evidence: {
    provider: string | null;
    witness: string | null;
    merkleVerified: boolean;
    blockHeight: number | null;
    checkedAt: string | null;
  } | null;
  refund_txid: string;
  refund_amount: number;
  refund_fee: number;
  confirmations: number;
  block_hash: string | null;
  updated_at: string;
  assertion: string;
  evidence: {
    provider: string | null;
    witness: string | null;
    merkleVerified: boolean;
    blockHeight: number | null;
    checkedAt: string | null;
  } | null;
};
export function ResolutionClient({ id }: { id: string }) {
  const [data, setData] = useState<Receipt | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    api<Receipt>(`resolutions/${id}`)
      .then(setData)
      .catch((e) => setError(message(e)));
  }, [id]);
  if (error) return <ServiceError error={error} />;
  if (!data) return <Loading label="Loading public-safe resolution receipt" />;
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{data.reference}</h2>
        <Status state={data.state} />
      </div>
      <div className="panel-body">
        <span className="label">Refund recipient amount</span>
        <div className="purchase-total">
          {bch(data.refund_amount)} <span>BCH</span>
        </div>
        <StateTrail state={data.state} refund />
        <dl className="data-list" style={{ marginTop: 25 }}>
          <div>
            <dt>Network</dt>
            <dd>{data.network}</dd>
          </div>
          <div className="long">
            <dt>
              Original payment — {bch(data.payment_amount)} BCH, output {data.payment_vout}
            </dt>
            <dd>
              <a
                className="wrap"
                href={explorer(data.network, data.payment_txid)}
                target="_blank"
                rel="noreferrer"
              >
                {data.payment_txid}
                <ArrowUpRight size={13} />
              </a>
            </dd>
          </div>
          <div>
            <dt>Purchase confirmations</dt>
            <dd>{data.payment_confirmations}</dd>
          </div>
          {data.payment_evidence?.blockHeight !== null && data.payment_evidence?.blockHeight !== undefined && (
            <div>
              <dt>Purchase block height</dt>
              <dd>{data.payment_evidence.blockHeight}</dd>
            </div>
          )}
          {data.payment_block_hash && (
            <div className="long">
              <dt>Purchase block hash</dt>
              <dd className="wrap">{data.payment_block_hash}</dd>
            </div>
          )}
          <div className="long">
            <dt>New refund transaction</dt>
            <dd>
              <a
                className="wrap"
                href={explorer(data.network, data.refund_txid)}
                target="_blank"
                rel="noreferrer"
              >
                {data.refund_txid}
                <ArrowUpRight size={13} />
              </a>
            </dd>
          </div>
          <div>
            <dt>Refund network fee</dt>
            <dd>{bch(data.refund_fee)} BCH</dd>
          </div>
          <div>
            <dt>Refund confirmations</dt>
            <dd>{data.confirmations}</dd>
          </div>
          {data.evidence?.blockHeight !== null && data.evidence?.blockHeight !== undefined && (
            <div>
              <dt>Refund block height</dt>
              <dd>{data.evidence.blockHeight}</dd>
            </div>
          )}
          {data.block_hash && (
            <div className="long">
              <dt>Refund block hash</dt>
              <dd className="wrap">{data.block_hash}</dd>
            </div>
          )}
          <div>
            <dt>Refund proof check</dt>
            <dd>
              {data.evidence?.checkedAt
                ? new Date(data.evidence.checkedAt).toLocaleString()
                : new Date(data.updated_at).toLocaleString()}
            </dd>
          </div>
        </dl>
        <div className="subtle-divider" />
        <h3>What this record proves</h3>
        <p style={{ marginTop: 15 }}>
          The transaction identities and recipient amount are checked from BCH transaction data.{' '}
          {data.evidence?.merkleVerified
            ? 'The refund has a verified merkle inclusion proof.'
            : 'Block inclusion is not yet verified.'}{' '}
          {data.evidence?.witness
            ? `A second provider (${data.evidence.witness}) agreed on the transaction and block.`
            : ''}
          {data.payment_evidence?.merkleVerified
            ? ' The original payment also has a verified merkle inclusion proof.'
            : ' The original payment inclusion proof is not available in this receipt.'}
        </p>
        <p className="fine" style={{ marginTop: 15 }}>
          {data.assertion}
        </p>
        <p className="fine" style={{ marginTop: 15 }}>
          A refund is a new BCH transaction. This public-safe receipt omits customer reasons,
          private access keys and merchant login details.
        </p>
        <button
          className="button secondary"
          style={{ marginTop: 25 }}
          onClick={() => window.print()}
        >
          Print or save receipt
        </button>
      </div>
    </section>
  );
}
