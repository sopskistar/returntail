import { ArrowUpRight } from 'lucide-react';
import { decodeCashAddress } from '@bitauth/libauth';
export function CompetitionBanner() {
  let widget: string | undefined;
  try {
    const url = new URL(process.env.WIDGET_FACTORY_URL ?? '');
    if (url.protocol === 'https:') widget = url.href;
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
    <section className="competition container" aria-labelledby="competition-title">
      <div>
        <h2 id="competition-title">Built for BCH BLAZE 2026.</h2>
        <p>Follow the build. Inspect the source. Try the real workflow.</p>
      </div>
      <div className="competition-links">
        <a href="https://github.com/sopskistar/returntail">
          Public repository
          <ArrowUpRight size={16} />
        </a>
        {widget ? (
          <a href={widget}>
            Widget Factory presentation
            <ArrowUpRight size={16} />
          </a>
        ) : (
          <a href="/evidence#submission">
            Presentation publishing in progress
            <ArrowUpRight size={16} />
          </a>
        )}
        {donation && (
          <p className="fine">
            EMBER2026 donation address: <code className="wrap">{donation}</code>
          </p>
        )}
        {!donation && <p className="fine">CashTokens donation details are not configured yet.</p>}
        <p className="fine">
          {process.env.PREEXISTING_WORK_DISCLOSURE ||
            'Original application; open-source libraries disclosed in the repository.'}
        </p>
      </div>
    </section>
  );
}
