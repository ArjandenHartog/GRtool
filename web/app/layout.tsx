import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/react";
import './globals.css';

export const metadata: Metadata = {
  title: 'GR2022 - Gemeenteraadsverkiezingen Nederland',
  description: 'Interactieve kaart met resultaten gemeenteraadsverkiezingen 2022',
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
