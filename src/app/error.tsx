'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container not-found">
      <div>
        <h1>A pause in the trail.</h1>
        <p>We couldn’t load this page. Your saved transaction attempts remain recorded.</p>
        <div className="button-row">
          <button className="button" onClick={reset}>
            Try loading again
          </button>
          <Link href="/" className="text-link">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
