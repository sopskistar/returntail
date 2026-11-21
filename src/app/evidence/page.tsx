import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { publicResolution } from '@/server/service';
import { ResolutionClient } from '@/components/resolution-client';
import { Header, Footer } from '@/components/shell';
export const metadata: Metadata = {
  title: 'Evidence and verification',
  description:
    'Understand what ReturnTail verifies on Bitcoin Cash and what remains an application-level merchant assertion.',
};
export const dynamic = 'force-dynamic';
export default async function Evidence() {
  let proofId: string | undefined;
  const candidate = process.env.PUBLIC_PROOF_REFUND_ID;
  if (candidate && /^[a-f0-9-]{36}$/.test(candidate)) {
    try {
      const receipt = await publicResolution(candidate);
      if (
        receipt.network === 'mainnet' &&
        receipt.state === 'confirmed' &&
        receipt.evidence?.merkleVerified &&
        receipt.evidence?.witness
      )
        proofId = candidate;
    } catch {}
  }
  return (
    <>
      <Header />
      <main id="main" className="container read-main">
        <h1>
          Trust is good.
          <br />
          Evidence is better.
        </h1>
        <p className="lead">
          A merchant decision and a BCH transaction prove different things. ReturnTail keeps them
          distinct.
        </p>
        {proofId ? (
          <ResolutionClient id={proofId} />
        ) : (
          <section className="evidence-empty">
            <h2>Mainnet proof is not yet published.</h2>
            <p>
              A physical-wallet mainnet purchase and partial refund have been reported. The
              independently checked transaction evidence and public receipt are not available here
              yet. See the proof ledger for what is verified and what still needs reconciliation.
            </p>
            <a
              href="https://github.com/sopskistar/returntail/blob/main/docs/MAINNET_PROOF.md"
              className="text-link"
            >
              Read the proof ledger
              <ArrowUpRight size={16} />
            </a>
          </section>
        )}
        <h2>What the chain can prove</h2>
        <ul>
          <li>The transaction identity computed from actual bytes.</li>
          <li>The merchant payment output and exact satoshi amount.</li>
          <li>The new refund output matching the reviewed intent.</li>
          <li>Block inclusion through a merkle branch and the observed confirmation count.</li>
        </ul>
        <p>
          Mainnet confirmation checks compare transaction bytes and the block header with a second
          provider. ReturnTail uses public blockchain infrastructure; it does not run a full
          independently validated proof-of-work node.
        </p>
        <h2>What the application records</h2>
        <p>
          The merchant’s approval, the customer’s reason, the relationship between purchase and
          refund, and the reservation of refundable amounts. Those assertions are recorded in
          PostgreSQL, not made into blockchain facts by a receipt.
        </p>
        <h2>What an uncertain state means</h2>
        <p>
          A signature is not a broadcast. A broadcast response is not independent observation. An
          unconfirmed transaction is not final. If a broadcast times out, ReturnTail retains the
          attempt and reservation, and checks that same transaction before allowing any further
          action.
        </p>
        <h2 id="submission">Competition submission status</h2>
        <p>
          The presentation link, registration, workshop roll-call and Telegram verification must be
          checked before submission. The proof ledger distinguishes reported workflow events from
          independently verified BCH transaction data.
        </p>
        <h2>The honest limits</h2>
        <p>
          App-level refund accounting cannot prevent a merchant sending additional BCH outside
          ReturnTail. A connected wallet and a supplied public key do not prove ownership. A private
          receipt link authorizes its holder; it does not establish a legal identity.
        </p>
        <div className="button-row">
          <Link href="/guide" className="button">
            Follow the judge journey
            <ArrowUpRight size={16} />
          </Link>
          <a className="text-link" href="https://github.com/sopskistar/returntail">
            Inspect the implementation
            <ArrowUpRight size={16} />
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
