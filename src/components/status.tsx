import { Check, Clock3, CircleAlert, PenLine, Ban, Radio } from 'lucide-react';
const names: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  requested: 'Refund requested',
  approved: 'Approved',
  rejected: 'Rejected',
  awaiting_signature: 'Awaiting wallet signature',
  signed: 'Signed',
  broadcast_unknown: 'Broadcast outcome unknown',
  broadcast: 'Broadcast submitted',
  unconfirmed: 'Observed, unconfirmed',
  confirmed: 'Confirmed',
  review_required: 'Review required',
  cancelled: 'Cancelled',
  expired: 'Expired',
};
export function Status({ state }: { state: string }) {
  const Icon =
    state === 'confirmed'
      ? Check
      : state === 'review_required' || state === 'broadcast_unknown'
        ? CircleAlert
        : state === 'awaiting_signature'
          ? PenLine
          : state === 'rejected' || state === 'cancelled'
            ? Ban
            : state === 'unconfirmed' || state === 'broadcast'
              ? Radio
              : Clock3;
  return (
    <span className={`status status-${state}`}>
      <Icon size={14} aria-hidden="true" />
      {names[state] ?? state}
    </span>
  );
}
export function StateTrail({ state, refund = false }: { state: string; refund?: boolean }) {
  const stages = refund
    ? ['Requested', 'Approved', 'Wallet signed', 'Observed', 'Confirmed']
    : ['Payment request', 'Wallet signed', 'Observed', 'Confirmed'];
  const current = refund
    ? ((
        {
          requested: 0,
          approved: 1,
          awaiting_signature: 1,
          signed: 2,
          broadcast: 2,
          broadcast_unknown: 2,
          unconfirmed: 3,
          confirmed: 4,
        } as Record<string, number>
      )[state] ?? 0)
    : ((
        {
          awaiting_payment: 0,
          signed: 1,
          broadcast: 1,
          broadcast_unknown: 1,
          unconfirmed: 2,
          confirmed: 3,
        } as Record<string, number>
      )[state] ?? 0);
  return (
    <ol className="state-trail" aria-label={refund ? 'Refund progress' : 'Payment progress'}>
      {stages.map((s, i) => (
        <li
          key={s}
          className={i < current ? 'complete' : i === current ? 'current' : ''}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className="step-node">{i < current ? <Check size={14} /> : i + 1}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}
