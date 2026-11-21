import { ArrowUpRight } from 'lucide-react';
import { decodeCashAddress } from '@bitauth/libauth';
export function CompetitionBanner() {
  let widget: string | undefined;
  try {
    const url = new URL(process.env.WIDGET_FACTORY_URL ?? '');
    if (
      url.protocol === 'https:' &&
      url.hostname === 'docs.google.com' &&
      /^\/presentation\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(url.pathname)
    )
      widget = url.href;
  } catch {}
  const configured = process.env.EMBER_DONATION_ADDRESS,
    decoded = configured ? decodeCashAddress(configured) : null;
  const donation =
    decoded &&
    typeof decoded !== 'string' &&
    decoded.prefix === 'bitcoincash' &&
    ['p2pkhWithTokens', 'p2shWithTokens'].includes(decoded.type)
      ? configured
      : undefined;
  return (
    <section className="competition" aria-labelledby="competition-title">
      <div className="container competition-inner">
        <div className="competition-heading">
          <span>BCH BLAZE 2026</span>
          <h2 id="competition-title">Build. Inspect. Resolve.</h2>
        </div>
        <div className="competition-content">
          <nav className="competition-links" aria-label="BCH BLAZE project links">
            {widget ? (
              <a href={widget}>
                Widget Factory Presentation
                <ArrowUpRight size={16} />
              </a>
            ) : (
              <span className="competition-missing" role="status">
                Presentation link not configured
              </span>
            )}
            <a href="https://github.com/sopskistar/ReturnTail">
              GitHub repository
              <ArrowUpRight size={16} />
            </a>
          </nav>
          <div className="competition-donation">
            <span>EMBER2026 donation address</span>
            {donation ? (
              <code className="wrap">{donation}</code>
            ) : (
              <span className="competition-missing" role="status">
                CashTokens address not configured
              </span>
            )}
          </div>
          <p className="competition-disclosure">
            {process.env.PREEXISTING_WORK_DISCLOSURE ||
              'Original application; open-source libraries disclosed in the repository.'}
          </p>
        </div>
      </div>
    </section>
  );
}
