import type { Metadata } from 'next';
import { Header, Footer } from '@/components/shell';
import { ResolutionClient } from '@/components/resolution-client';
export const metadata: Metadata = {
  title: 'Verifiable resolution receipt',
  description:
    'Inspect original payment and refund transaction evidence in a public-safe BCH resolution receipt.',
  robots: { index: false, follow: false },
};
export default async function Resolution({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Header />
      <main id="main" className="app-background">
        <div className="container read-main">
          <h1>
            A resolution.
            <br />A record you can check.
          </h1>
          <p className="lead">
            Follow the original BCH purchase and the new merchant-authorized refund.
          </p>
          <ResolutionClient id={id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
