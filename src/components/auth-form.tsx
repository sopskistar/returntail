'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { ArrowUpRight, CircleAlert } from 'lucide-react';
import { api, message } from '@/client/api';
const subscribe = () => () => {};
export function AuthForm({ register }: { register: boolean }) {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await api(`auth/${register ? 'register' : 'login'}`, {
        email: f.get('email'),
        password: f.get('password'),
        ...(register ? { storeName: f.get('storeName') } : {}),
      });
      router.push('/workspace');
      router.refresh();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-form">
      <h2>{register ? 'A better way to make it right.' : 'Welcome back.'}</h2>
      <p>
        {register
          ? 'Create your merchant workspace. Your wallet stays yours.'
          : 'Sign in to review purchases and resolve refund requests.'}
      </p>
      {error && (
        <div className="alert error" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}
      <form method="post" action={`/api/auth/${register ? 'register' : 'login'}`} onSubmit={submit}>
        {register && (
          <div className="field">
            <label htmlFor="storeName">Store name</label>
            <input
              id="storeName"
              name="storeName"
              placeholder="Your business name"
              minLength={2}
              maxLength={100}
              autoComplete="organization"
              required
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@yourstore.com"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="At least 12 characters"
            minLength={12}
            maxLength={128}
            autoComplete={register ? 'new-password' : 'current-password'}
            required
          />
          <small>Use a unique password. Password managers and paste are supported.</small>
        </div>
        <button className="button" disabled={busy || !ready} aria-busy={busy || !ready}>
          {busy ? 'Working…' : register ? 'Create merchant account' : 'Sign in'}
          <ArrowUpRight size={17} />
        </button>
      </form>
      {!ready && <p className="fine" role="status">Loading secure sign-in. JavaScript must be enabled.</p>}
      <div className="auth-switch">
        {register ? 'Already have an account?' : 'New to ReturnTail?'}{' '}
        <Link href={register ? '/login' : '/register'}>
          {register ? 'Sign in' : 'Create an account'}
        </Link>
      </div>
      <p className="auth-bottom">
        {register
          ? 'By creating an account, you acknowledge our '
          : 'Your wallet connection is separate from your merchant login. Read our '}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </div>
  );
}
