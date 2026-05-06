'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const TAB_ITEMS = [
  {
    href: '/news',
    label: 'News',
    sublabel: 'セキュリティ情報',
  },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentTab = TAB_ITEMS.find((tab) => pathname.startsWith(tab.href));

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--paper)' }}>
      {/* Header */}
      <header className="h-[52px] border-b flex items-center justify-between px-6" style={{ borderColor: 'var(--rule)' }}>
        {/* Left: Logo + Title + User */}
        <div className="flex items-center gap-3">
          {/* Logo "K" */}
          <div
            className="w-[22px] h-[22px] rounded flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            K
          </div>
          <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            Knowledge Hub
          </div>
          <div className="text-xs ml-6" style={{ color: 'var(--ink-3)' }}>
            Admin User
          </div>
        </div>

        {/* Center: Tabs */}
        <nav className="flex gap-8">
          {TAB_ITEMS.map((tab) => {
            const isActive = currentTab?.href === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center py-2 relative transition-colors"
                style={{ color: isActive ? 'var(--ink)' : 'var(--ink-3)' }}
              >
                <div className="text-xs font-medium">{tab.label}</div>
                <div className="text-[10px]" style={{ color: isActive ? 'var(--ink-2)' : 'var(--ink-4)' }}>
                  {tab.sublabel}
                </div>
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: 'var(--ink)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auto-collect indicator + Pull button */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--ink-2)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--teal)' }} />
            auto-collect: ON
          </div>
          <button
            className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
            style={{ backgroundColor: 'var(--navy)', color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy)')}
          >
            Pull now
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="h-[28px] border-t flex items-center px-6 text-xs" style={{ borderColor: 'var(--rule)', color: 'var(--ink-4)' }}>
        <div>Knowledge Hub v1.0 • Last sync: 2025-05-05 06:32 JST</div>
      </footer>
    </div>
  );
}
