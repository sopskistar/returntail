import Link from 'next/link';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { Brand } from './brand';
import { WalletButton } from './wallet-provider';
export function Header({ app = false }: { app?: boolean }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav aria-label="Main navigation">
          <Link href="/guide">How it works</Link>
          <Link href="/evidence">Evidence</Link>
          {app ? (
            <WalletButton />
          ) : (
            <Link href="/workspace" className="button small" aria-label="Merchant workspace">
              Workspace
              <ArrowUpRight size={16} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Brand />
          <p>Make it right. Leave a trail.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/guide">Judge walkthrough</Link>
          <Link href="/lab">Break It Lab</Link>
          <Link href="/wallet-check">Wallet preflight</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="https://github.com/sopskistar/returntail" target="_blank" rel="noreferrer">
            <Code2 size={16} />
            Source code
          </a>
          <a href="https://bchblaze.com/" target="_blank" rel="noreferrer">
            BCH BLAZE 2026
            <ArrowUpRight size={14} />
          </a>
        </nav>
      </div>
    </footer>
  );
}
