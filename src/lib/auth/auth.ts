import NextAuth, { type DefaultSession } from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '../db/client';
import { users, accounts, sessions, verificationTokens } from '../db/schema';

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],
  // SessionProvider is mounted app-wide (for the TopBar account button), so
  // /api/auth/session is hit on every page load even for anonymous users —
  // that means a secret is required for ANY use of the app, not just
  // sign-in. Fall back to a fixed dev-only value so anonymous local dev
  // stays zero-config as intended; production still requires a real
  // NEXTAUTH_SECRET (Auth.js throws MissingSecret if this were ever
  // undefined, so this fallback must never reach a real deployment).
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV !== 'production' ? 'dev-only-insecure-secret-do-not-use-in-production' : undefined),
  session: { strategy: 'database' },
  pages: {
    signIn: '/signin',
    verifyRequest: '/signin',
  },
  callbacks: {
    session({ session, user }) {
      // Database session strategy passes the full adapter user object —
      // attach its id so server routes can key gating/persistence off
      // session.user.id without a second lookup.
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
