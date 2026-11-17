import Link from 'next/link';
import { Header, Footer } from '@/components/shell';
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="container not-found">
        <div>
          <h1>This trail ends here.</h1>
          <p>The page may have moved, or the purchase link is incomplete.</p>
          <div className="button-row">
            <Link href="/" className="button">
              Back to ReturnTail
            </Link>
            <Link href="/workspace" className="text-link">
              Open merchant workspace
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
