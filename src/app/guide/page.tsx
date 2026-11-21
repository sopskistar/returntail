import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Header, Footer } from '@/components/shell';
export const metadata: Metadata = {
  title: 'The payment-to-refund walkthrough',
  description:
    'A two-minute guide to real BCH payment verification, merchant refund approval, wallet signing, and settlement receipts.',
};
export default function Guide() {
  return (
    <>
      <Header />
      <main id="main" className="container read-main">
        <h1>
          From “what happened?”
          <br />
          to “here’s the proof.”
        </h1>
        <p className="lead">
          Imagine a delivery with one damaged item. The customer wants a partial refund.
          The merchant wants to make it right without paying twice.
        </p>
        <div className="alert warning">
          Follow this journey with a real purchase and two separate wallets. Mainnet uses real BCH;
          each transfer needs an explicit wallet signature. This guide contains no transaction proof.
        </div>
        <p className="fine">
          Before funding the journey, follow the{' '}
          <a className="text-link" href="/wallet-check">
            Paytaca and Selene wallet preflight
          </a>. Check wallet versions and the merchant’s receiving address first.
        </p>
        <div className="button-row"><Link className="button secondary" href="/#play">Play the Resolution</Link><Link className="text-link" href="/lab">Inspect the read-only Break It Lab</Link></div>
        <ol className="guide-list">
          <li>
            <span className="guide-num">01</span>
            <div>
              <h2>The merchant creates a request.</h2>
              <p>
                Create a merchant account, connect a WizardConnect-enabled BCH wallet, save its
                public receive key, then create a payment request. Before sharing the private link,
                compare its exact destination in the native wallet. Index-zero requests must stay unfunded: Paytaca 0.27.3 hides that index.
              </p>
            </div>
          </li>
          <li>
            <span className="guide-num">02</span>
            <div>
              <h2>The customer pays directly.</h2>
              <p>
                Open the private link in a separate customer browser profile. Connect the customer
                wallet, prepare the payment, review recipient and fee, and authorize in the wallet.
                BCH goes directly to the merchant.
              </p>
            </div>
          </li>
          <li>
            <span className="guide-num">03</span>
            <div>
              <h2>The network is checked.</h2>
              <p>
                ReturnTail checks actual transaction bytes, recipient output and amount. An
                unconfirmed observation remains distinct from a confirmed payment. Only a confirmed
                purchase can request a refund.
              </p>
            </div>
          </li>
          <li>
            <span className="guide-num">04</span>
            <div>
              <h2>One item needs making right.</h2>
              <p>
                After the payment confirms, the customer describes the damaged item and requests a
                partial refund to their own receiving address. The merchant reviews the amount,
                destination and remaining balance. Approval reserves the amount; it moves no BCH.
                Further approvals above the remaining balance are rejected.
              </p>
            </div>
          </li>
          <li>
            <span className="guide-num">05</span>
            <div>
              <h2>The merchant signs a new transaction.</h2>
              <p>
                Review the refund intent, network fee, change and
                total debit, then explicitly authorize in the merchant wallet. The server checks the
                signed transaction before broadcast.
              </p>
            </div>
          </li>
          <li>
            <span className="guide-num">06</span>
            <div>
              <h2>Both sides get a verifiable resolution.</h2>
              <p>
                Track the refund through independent observation and block confirmation. Share a
                public-safe resolution receipt linking the original payment to the new refund,
                without exposing the private customer link.
              </p>
            </div>
          </li>
        </ol>
        <div className="button-row">
          <Link href="/workspace" className="button">
            Start the real workflow
            <ArrowUpRight size={17} />
          </Link>
          <Link href="/evidence" className="text-link">
            Inspect the evidence standard
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <p className="fine">
          For a judge walkthrough without funds, inspect the application, source code and test
          documentation. A guide, fixture or screenshot is not mainnet transaction proof.
        </p>
      </main>
      <Footer />
    </>
  );
}
