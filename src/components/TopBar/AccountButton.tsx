'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './TopBar.module.css';

export function AccountButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  if (!session?.user) {
    return (
      <Link href="/signin" className={`${styles.accountButton} text-button-label`} aria-label="Sign in">
        Մուտք
      </Link>
    );
  }

  const initial = (session.user.email ?? '?').charAt(0).toUpperCase();

  return (
    <button
      type="button"
      className={styles.accountButton}
      onClick={() => signOut()}
      aria-label={`Sign out (${session.user.email})`}
      title={session.user.email ?? undefined}
    >
      {initial}
    </button>
  );
}
