'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await signIn('resend', { email: email.trim(), redirect: false });
      if (result?.error) {
        setError('Մուտքի հղումն ուղարկել չհաջողվեց։ Փորձիր նորից։');
      } else {
        setSent(true);
      }
    } catch {
      setError('Մուտքի հղումն ուղարկել չհաջողվեց։ Փորձիր նորից։');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
        background: 'var(--void)',
        color: 'var(--text-primary)',
        textAlign: 'center',
      }}
    >
      <h1 className="text-app-title">Luka</h1>
      {sent ? (
        <p className="text-user-message">
          Ստուգիր քո էլ. փոստը՝ {email} — մուտքի հղումն ուղարկվել է։
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
          <p className="text-user-message">Մուտք գործիր՝ էլ. փոստով</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="text-input"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(3,3,4,0.6)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            className="text-button-label"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--on-accent)',
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Ուղարկվում է…' : 'Ուղարկել մուտքի հղումը'}
          </button>
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
