import type { Metadata, Viewport } from 'next';
import '../styles/global.css';

export const metadata: Metadata = {
  title: 'Luka',
  description: 'Luka AI assistant',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030304',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hy">
      <body>{children}</body>
    </html>
  );
}
