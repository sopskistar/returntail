'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Play, Wallet, FileCheck2, Radio, Search, CircleCheck, MessageSquare } from 'lucide-react';
const chapters = [
  { title: 'The customer asks.', short: 'Request', actor: 'Customer', icon: MessageSquare,
    story: 'Imagine a parcel with one damaged item. The customer asks for the cost of that item back, rather than returning the whole order.',
    mechanism: 'A private purchase receipt connects the request to a confirmed BCH payment. The customer chooses a refund address they control.',
    boundary: 'A request is not approval. No BCH moves.' },
  { title: 'The merchant decides.', short: 'Decision', actor: 'Merchant', icon: FileCheck2,
    story: 'The merchant checks the purchase and agrees to a partial refund. Both people need to know what happens next.',
    mechanism: 'Approval reserves the eligible amount in an atomic database transaction. Settled plus reserved refunds cannot exceed the purchase.',
    boundary: 'Approval reserves an amount. It does not authorize a wallet transaction.' },
  { title: 'The wallet has the final say.', short: 'Authorize', actor: 'Merchant’s wallet', icon: Wallet,
    story: 'The merchant reviews the customer’s destination, the refund amount, the fee and the original purchase before signing.',
    mechanism: 'The wallet signs a new BCH transaction. ReturnTail validates the signed outputs and saves the bytes and transaction ID before broadcast.',
    boundary: 'A rejected signature moves no funds. ReturnTail cannot sign for the merchant.' },
  { title: 'Sent is not settled.', short: 'Broadcast', actor: 'BCH network', icon: Radio,
    story: 'The signed transaction is sent to the network. A slow response should not cause the merchant to pay again.',
    mechanism: 'An uncertain broadcast retains its reservation and saved transaction identity. Recovery reconciles first and can resend identical bytes.',
    boundary: 'A timeout is an unknown outcome, not proof of failure.' },
  { title: 'Check what the chain sees.', short: 'Observe', actor: 'Independent verification', icon: Search,
    story: 'Both sides need evidence of the exact destination and amount, beyond a message saying “refund sent.”',
    mechanism: 'ReturnTail checks the actual transaction bytes, output and network. Unconfirmed observation remains separate from a block confirmation.',
    boundary: 'Observed in the mempool does not mean confirmed in a block.' },
  { title: 'Close with a shared record.', short: 'Confirm', actor: 'Customer + merchant', icon: CircleCheck,
    story: 'Once the refund is observed in a valid block, both sides can inspect a public-safe resolution receipt.',
    mechanism: 'The receipt connects the purchase and new refund transaction, with network, output, amount and verification status. Private notes stay private.',
    boundary: 'This explanation contains no transaction evidence. Real receipts require real confirmed BCH.' },
];
export function ResolutionPlayer() {
  const [step, setStep] = useState(0), [limit, setLimit] = useState(false);
  const chapter = chapters[step], Icon = chapter.icon;
  const change = (n: number) => { setStep(n); setLimit(false); };
  return <section className="resolution-player" id="play" aria-labelledby="player-title">
    <div className="player-heading"><h2 id="player-title"><Play size={18} /> Play the Resolution</h2><span>{step + 1} / {chapters.length}</span></div>
    <p className="player-disclosure">Interactive explanation · no wallet requests or transactions</p>
    <ol className="player-trail" aria-label="Resolution chapters">
      {chapters.map((c, i) => <li key={c.short}><button type="button" aria-current={i === step ? 'step' : undefined} onClick={() => change(i)}><span>{i + 1}</span>{c.short}</button></li>)}
    </ol>
    <div className="player-chapter" key={step} aria-live="polite" aria-atomic="true">
      <div className="player-actor"><Icon size={20} /><span>{chapter.actor}</span></div>
      <h3>{chapter.title}</h3><p className="player-story">{chapter.story}</p>
      <p className="player-mechanism">{chapter.mechanism}</p>
      <div className="player-boundary">{chapter.boundary}</div>
    </div>
    {step === 1 && <div className="player-question"><button className="text-link" type="button" aria-expanded={limit} onClick={() => setLimit(!limit)}>Why limits apply</button>{limit && <p>Concurrent approvals lock the purchase record and recheck the remaining balance. A second request that exceeds it is rejected. This is an explanation of the invariant; inspect its isolated tests in the <Link href="/lab">Break It Lab</Link>.</p>}</div>}
    <div className="player-controls"><button className="button secondary small" type="button" disabled={step === 0} onClick={() => change(step - 1)}><ArrowLeft size={16} /> Back</button>
      {step < chapters.length - 1 ? <button className="button small" type="button" onClick={() => change(step + 1)}>Next: {chapters[step + 1].short.toLowerCase()} <ArrowRight size={16} /></button> : <button className="button small" type="button" onClick={() => change(0)}><RotateCcw size={16} /> Play again</button>}
    </div>
  </section>;
}
