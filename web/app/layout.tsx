import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GR2022 - Gemeenteraadsverkiezingen Nederland',
  description: 'Interactieve kaart met resultaten gemeenteraadsverkiezingen 2022',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
