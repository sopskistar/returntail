import type { Metadata } from 'next';
import { Header, Footer } from '@/components/shell';
import { AuthForm } from '@/components/auth-form';
import { StateTrail } from '@/components/status';
export const metadata: Metadata = {
  title: 'Merchant sign in',
  description: 'Securely sign in to your ReturnTail merchant refund workspace.',
};
export default function Login() {
  return (
    <>
      <Header />
      <main id="main" className="auth-layout">
        <div className="auth-story">
          <h1>
            Good merchants
            <br />
            make it right.
          </h1>
          <p>A clear decision. A wallet-signed refund. A trail your customer can trust.</p>
          <div className="auth-trail">
            <StateTrail state="requested" refund />
          </div>
        </div>
        <div className="auth-form-region">
          <AuthForm register={false} />
        </div>
      </main>
      <Footer />
    </>
  );
}
