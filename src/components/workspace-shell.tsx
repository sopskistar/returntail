import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header, Footer } from './shell';
import { merchant } from '@/server/auth';
import { SignOut } from './workspace-client';
import { network } from '@/server/config';
export async function WorkspaceShell({
  children,
  active = 'orders',
}: {
  children: React.ReactNode;
  active?: string;
}) {
  let account = null;
  try {
    account = await merchant();
  } catch {
    /* Setup errors are handled on the configuration page. */
  }
  if (!account) redirect('/login');
  return (
    <>
      <Header app />
      <main id="main" className="app-background">
        <div className="container app-main">
          <div className="app-heading">
            <div>
              <span className="network-label">
                {network() === 'mainnet' ? 'Mainnet — real BCH' : 'Chipnet — test coins only'}
              </span>
              <h1>Merchant workspace</h1>
              <p>Every payment problem deserves a clear resolution.</p>
            </div>
            <div className="button-row">
              <SignOut />
              <Link href="/workspace/new" className="button">
                New payment request
              </Link>
            </div>
          </div>
          <nav className="workspace-tabs" aria-label="Workspace navigation">
            <Link href="/workspace" aria-current={active === 'orders' ? 'page' : undefined}>
              Payments
            </Link>
            <Link
              href="/workspace?view=refunds"
              aria-current={active === 'refunds' ? 'page' : undefined}
            >
              Refund inbox
            </Link>
            <Link
              href="/workspace/settings"
              aria-current={active === 'settings' ? 'page' : undefined}
            >
              Store & wallet
            </Link>
          </nav>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
