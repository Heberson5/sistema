'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/config/navigation';

export function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <span className="text-sm font-bold text-gray-800">Gestão Funerária</span>
      </div>
      <nav className="p-3">
        {navigation.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-2 py-1.5 text-sm ${
                    active
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
