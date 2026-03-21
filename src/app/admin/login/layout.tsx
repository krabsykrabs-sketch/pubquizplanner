import type { Metadata } from 'next';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'PQP Admin Login',
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="antialiased min-h-screen flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
