'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  mode: 'login' | 'register';
  next: string;
  demo?: boolean;
};

export default function AuthForm({ mode, next, demo = false }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';
  const switchHref = `${isRegister ? '/login' : '/register'}?next=${encodeURIComponent(next)}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.');
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-head">
        <span className="eyebrow">{isRegister ? 'Create account' : 'Welcome back'}</span>
        <h1>{isRegister ? 'Start writing on Codomax' : 'Log in to Codomax'}</h1>
        <p>
          {isRegister
            ? 'Your credentials are hashed with bcrypt and never stored as plain text.'
            : 'Use your email and password to access your dashboard and posts.'}
        </p>
      </div>

      {demo && (
        <div className="demo-hint">
          <strong>Demo account</strong>
          <span>
            Email: <code>demo@codomax.dev</code> · Password: <code>DemoPass123!</code>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        {isRegister && (
          <label className="field">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={60}
            />
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <div className="password-row">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 8 : 1}
              maxLength={128}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className="auth-switch">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Link href={switchHref}>{isRegister ? 'Log in' : 'Create one'}</Link>
      </p>
    </div>
  );
}
