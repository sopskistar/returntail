import type { Metadata } from 'next';
import '@fontsource-variable/rethink-sans';
import '@fontsource-variable/manrope';
import './globals.css';
import { WalletProvider } from '@/components/wallet-provider';
import { appUrl, network } from '@/server/config';
export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: 'ReturnTail — BCH refunds, resolved with proof', template: '%s | ReturnTail' },
  description:
    'Resolve Bitcoin Cash payment problems with merchant-authorized refunds and verifiable settlement receipts. Your wallet stays in control.',
  openGraph: {
    title: 'ReturnTail — Make it right. Make it verifiable.',
    description: 'Non-custodial Bitcoin Cash refund resolution.',
    images: [{ url: '/brand/social.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <WalletProvider network={network()}>{children}</WalletProvider>
      </body>
    </html>
  );
}
