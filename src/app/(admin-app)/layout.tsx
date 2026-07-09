import type { Metadata } from 'next';
import '../globals.css';
import { fontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'PQP Admin',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={fontVariables}>
      <head />
      <body className="antialiased min-h-screen admin-legacy">{children}</body>
    </html>
  );
}
