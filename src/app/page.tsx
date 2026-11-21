import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Fingerprint,
} from 'lucide-react';
import { Header, Footer } from '@/components/shell';
import { ResolutionPlayer } from '@/components/resolution-player';
import { CompetitionBanner } from '@/components/competition-banner';
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1>
                Make it right.
                <br />
                Make it verifiable.
              </h1>
              <p>A customer paid. Something went wrong. Resolve their BCH refund with your wallet and a verifiable paper trail.</p>
              <div className="button-row">
                <Link className="button" href="/workspace">
                  Open your workspace
                  <ArrowUpRight size={18} />
                </Link>
                <Link className="text-link" href="/guide">
                  Explore the workflow
                  <ArrowRight size={17} />
                </Link>
              </div>
              <div className="hero-note">
                <Fingerprint size={18} />
                <span>Your wallet signs. Your customer can inspect the result.</span>
              </div>
              <Link className="text-link hero-preflight" href="/wallet-check">Before funding: check your wallet <ArrowRight size={16} /></Link>
            </div>
            <ResolutionPlayer />
          </div>
        </section>
        <div className="funding-notice container"><strong>Before moving BCH</strong><span>Paytaca v0.27.3 hides receive index zero. Keep existing zero-index requests unfunded.</span><Link href="/wallet-check" className="text-link">Check your wallet <ArrowRight size={16} /></Link></div>
        <div className="trust-strip">
          <div className="container">
            <span>
              <Check size={17} />
              Non-custodial by design
            </span>
            <span>
              <Check size={17} />
              Full and partial refunds
            </span>
            <span>
              <Check size={17} />
              Independent BCH transaction checks
            </span>
          </div>
        </div>
        <section className="resolution-section container">
          <div className="section-intro">
            <h2>
              A payment problem shouldn’t
              <br />
              become a trust problem.
            </h2>
            <p>
              The parcel is damaged. An item is unavailable. A customer needs help after checkout.
              Give both sides a resolution they can follow.
            </p>
          </div>
          <div className="resolution-rows">
            <div>
              <span className="row-number">01</span>
              <h3>A purchase, verified.</h3>
              <p>
                A unique payment address connects the correct recipient output and amount to the
                order.
              </p>
              <span className="row-detail">The starting point</span>
            </div>
            <div>
              <span className="row-number">02</span>
              <h3>A decision, yours.</h3>
              <p>
                Review the request and remaining balance. Approve or reject. Your wallet authorizes
                the BCH transfer.
              </p>
              <span className="row-detail">Human control</span>
            </div>
            <div>
              <span className="row-number">03</span>
              <h3>A resolution, on record.</h3>
              <p>
                Track the new refund transaction from broadcast through confirmation. Share a
                receipt with chain evidence.
              </p>
              <span className="row-detail">Proof for both sides</span>
            </div>
          </div>
        </section>
        <section className="control-section">
          <div className="container control-grid">
            <div>
              <h2>
                Keep control.
                <br />
                Close the loop.
              </h2>
              <Link href="/workspace" className="button light">
                Create a payment request
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="control-copy">
              <p>
                BCH payments are irreversible.
                <br />A refund is a new transaction.
              </p>
              <p>
                ReturnTail checks the refundable balance and prevents duplicate processing inside
                the app. It never holds your funds or signs on your behalf.
              </p>
              <Link href="/evidence" className="text-link">
                See how verification works
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
        <section className="inspection-section container"><div><h2>Don’t take a status label on trust.</h2><p>Inspect the running application’s access boundaries and the tests behind the refund ledger. No wallet or funds required.</p></div><Link className="button secondary" href="/lab">Open Break It Lab <ArrowRight size={18} /></Link></section>
        <CompetitionBanner />
      </main>
      <Footer />
    </>
  );
}
