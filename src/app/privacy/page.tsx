import type { Metadata } from 'next';
import { Header, Footer } from '@/components/shell';
export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How ReturnTail handles merchant sessions, public wallet information, refund requests and BCH transaction evidence.',
};
export default function Privacy() {
  return (
    <>
      <Header />
      <main id="main" className="container read-main">
        <h1>
          Your keys stay yours.
          <br />
          Your records need care.
        </h1>
        <p className="lead">ReturnTail privacy policy. Updated November 17, 2026.</p>
        <h2>Information we process</h2>
        <p>
          Merchant email, scrypt password hash, session identifiers, store name, public receive key
          and derived addresses; purchase descriptions and amounts; refund addresses and reasons;
          signed transaction bytes, public transaction identities, observations and audit events.
          Never provide a recovery phrase, WIF or wallet private spending key.
        </p>
        <h2>How records are protected</h2>
        <p>
          Merchant records require an authenticated server-side session. Customer receipt access
          uses an unguessable private link capability. Browser code removes its fragment from the
          address bar and holds it in tab session storage. Share the link only with authorized
          people. Anyone with it may read the purchase and submit refund requests.
        </p>
        <h2>Wallet connection data</h2>
        <p>
          WizardConnect stores encrypted-relay session credentials and public address paths in
          browser tab session storage for reconnection. Relay credentials are transport keys, not
          BCH spending keys. Disconnect the wallet to clear the session. A public xpub reveals
          derived address history and should still be treated as sensitive financial metadata.
        </p>
        <h2>Public blockchain and receipts</h2>
        <p>
          BCH transactions and addresses are public and cannot be deleted from the blockchain.
          Public resolution receipts expose transaction identities, network, amount, verification
          status and purchase reference. They omit customer reasons, login details and receipt
          capabilities. Public indexers can learn which script hashes ReturnTail queries.
        </p>
        <h2>Service providers</h2>
        <p>
          Deployment is prepared for Vercel and Neon PostgreSQL. Public Fulcrum providers supply
          chain data; WizardConnect uses encrypted relays. Their infrastructure receives operational
          data needed to serve requests. No advertising or analytics service is installed, and no
          analytics consent is inferred.
        </p>
        <h2>Cookies and retention</h2>
        <p>
          An essential HttpOnly merchant session cookie lasts up to seven days; signing out revokes
          it. Tab storage supports wallet reconnection and private receipt access. Server purchase
          and refund records are retained for resolution and audit. Before public launch, the
          operator must define a retention schedule and publish their contact information.
        </p>
        <h2>Requests and operator contact</h2>
        <p>
          For account access or deletion requests, contact the merchant or project operator through
          the public repository’s issue channel. Do not include private receipt links, personal
          financial information or secrets in public issues. Operator contact and a private support
          channel must be configured before general availability.
        </p>
        <p className="fine">
          This application does not collect analytics or offer automated legal, tax or financial
          advice. The operator must review this policy for their actual deployment and jurisdiction.
        </p>
      </main>
      <Footer />
    </>
  );
}
