import type { Metadata } from 'next';
import { Header, Footer } from '@/components/shell';
import { OrderClient } from '@/components/order-client';
export const metadata: Metadata = {
  title: 'Your purchase and refund',
  description:
    'Pay a merchant directly with BCH and track your private purchase and refund request.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default async function Pay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Header app />
      <main id="main" className="app-background">
        <div className="container app-main checkout">
          <OrderClient id={id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
