import type { Metadata } from 'next';
import '../globals.css';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'PQP Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="antialiased min-h-screen">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
