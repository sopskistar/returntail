import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/shell';
import { AddressChecker } from '@/components/address-checker';
export const metadata: Metadata = { title: 'Unfunded wallet preflight', description: 'Compare native BCH receiving addresses safely before funding a ReturnTail journey.' };
export default function WalletCheck() {
  return <><Header /><main id="main" className="container read-main">
    <h1>Check the destination.<br />Then consider funding.</h1>
    <p className="lead">Start with an unfunded comparison. A connected wallet and a derived address are not proof of control.</p>
    <div className="alert warning">Paytaca v0.27.3 on Android reserves receive index 0/0 for message encryption. Its normal Receive screen uses index 1 or later. Existing index-zero requests are preserved with new funding paused.</div>
    <AddressChecker />
    <section className="preflight-notes"><h2>Paytaca: your merchant wallet</h2>
      <ol><li>Keep the same wallet selected in Paytaca. Open Receive, select BCH, and set “Receive for” to Personal if that selector appears.</li><li>Copy the public Receive address. Connect that same Paytaca wallet above and compare it locally. A match reports the index actually displayed.</li><li>Open your existing request in the merchant workspace. Its embedded comparison also checks that the connected public chain derives the stored destination at the stored index.</li><li>If your request uses index zero, stop here. There is no supported arbitrary-address display or ownership-proof request in this wallet’s WizardConnect integration. Do not fund it, replace it, export keys or sign a dummy transaction.</li></ol>
      <p>Standard and CashToken-aware encodings can identify the same destination. The checker compares locking scripts rather than address text. A different positive index is a different destination.</p>
      <h2>Selene: your customer wallet</h2>
      <ol><li>Use a separate customer browser profile, so pairing does not replace the merchant’s connection. Record your installed Selene version and select the intended BCH wallet.</li><li>Open its native Receive screen and copy its BCH address. Connect Selene here in that customer profile and compare the address. Use the returned index when checking the checkout’s funding range.</li><li>The checkout searches five consecutive receive indices starting at the number you enter. It does not search change-only balances. An unfunded wallet should report no eligible confirmed BCH, without requesting a signature.</li><li>A refund destination must be copied from Selene’s own Receive screen. Never infer it from a payment input. Payment change is derived from Selene’s advertised change chain at index zero; this local derivation is not independent ownership proof. At eventual signing, stop if Selene does not recognize the change or if any output differs.</li></ol>
      <p>No funded journey is ready while the merchant destination is unverified. Selene’s released integration has been reviewed in source; physical pairing, rejection, change recognition and signing still require checks on your installed release.</p>
      <Link className="text-link" href="/guide">Return to the resolution guide</Link>
    </section>
  </main><Footer /></>;
}
