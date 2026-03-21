import type { Metadata } from 'next';
import '../globals.css';

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
    <html lang="de">
      <head />
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
