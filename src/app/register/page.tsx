import type { Metadata } from 'next';
import { Header, Footer } from '@/components/shell';
import { AuthForm } from '@/components/auth-form';
export const metadata: Metadata = {
  title: 'Create a merchant account',
  description: 'Create a non-custodial BCH merchant workspace for payments and refund resolution.',
};
export default function Register() {
  return (
    <>
      <Header />
      <main id="main" className="auth-layout">
        <div className="auth-story">
          <h1>
            Start with
            <br />a little trust.
          </h1>
          <p>
            Create your store. Connect your wallet. Give every payment problem a clear path to
            resolution.
          </p>
          <p className="auth-trail">
            ReturnTail never asks for your seed phrase or wallet spending keys.
          </p>
        </div>
        <div className="auth-form-region">
          <AuthForm register />
        </div>
      </main>
      <Footer />
    </>
  );
}
