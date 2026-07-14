'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { UI_STRINGS, type UILanguage } from '../../../lib/i18n/uiStrings';
import { UI_LANGUAGE_STORAGE_KEY } from '../../../state/AppStateContext';
import styles from './SignIn.module.css';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('hy');

  // This page is mounted outside AppStateProvider (it's a standalone
  // Auth.js route, not part of the main single-page app), so it can't read
  // settings.uiLanguage via context — it reads the same persisted
  // preference from localStorage instead.
  useEffect(() => {
    const saved = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
    if (saved === 'hy' || saved === 'en') {
      setUiLanguage(saved);
    }
  }, []);

  const t = UI_STRINGS[uiLanguage];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await signIn('resend', { email: email.trim(), redirect: false });
      if (result?.error) {
        setError(t.signinError);
      } else {
        setSent(true);
      }
    } catch {
      setError(t.signinError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.brand}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span className="text-app-title">Luka</span>
        </div>

        <div className={styles.card}>
          {sent ? (
            <>
              <h1 className={`${styles.heading} text-app-title`}>{t.signinCheckInbox}</h1>
              <p className={`${styles.sentMessage} text-user-message`}>
                {t.signinLinkSentTo} <strong>{email}</strong>
              </p>
            </>
          ) : (
            <>
              <h1 className={`${styles.heading} text-app-title`}>{t.signinTitle}</h1>
              <p className={`${styles.subheading} text-timestamp`}>{t.signinSubheading}</p>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`${styles.input} text-input`}
                />
                <button type="submit" disabled={submitting} className={`${styles.submitButton} text-button-label`}>
                  {submitting ? t.signinSending : t.signinSendLink}
                </button>
                {error && <p className={`${styles.error} text-timestamp`}>{error}</p>}
              </form>
            </>
          )}
        </div>

        <Link href="/" className={`${styles.backLink} text-timestamp`}>
          {t.signinBackLink}
        </Link>
      </div>
    </div>
  );
}
