'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/review', label: 'Review', icon: '✅' },
  { href: '/admin/questions', label: 'Fragen', icon: '📋' },
  { href: '/admin/import', label: 'Import', icon: '📥' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-[var(--dark-card)] border-r border-[var(--dark-border)] flex flex-col">
      <div className="p-5 border-b border-[var(--dark-border)]">
        <Link href="/admin" className="text-lg font-bold text-[var(--gold)]">
          PQP Admin
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--gold)] bg-opacity-15 text-[var(--gold)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--dark-border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-red-400 hover:bg-[var(--background)] transition-colors"
        >
          <span>🚪</span>
          <span>Abmelden</span>
        </button>
      </div>
    </aside>
  );
}
