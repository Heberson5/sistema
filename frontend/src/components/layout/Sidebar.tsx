'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { navigation } from '@/config/navigation';

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const group of navigation) {
        if (next[group.label] === undefined) next[group.label] = true;
      }
      return next;
    });
  }, []);

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-border bg-surface shadow-depth transition-transform duration-200 ease-out dark:shadow-depth-dark lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="safe-top flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 text-white shadow-soft">
          <span className="text-base">🕯️</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-foreground">
            Gestão Funerária
          </p>
          <p className="truncate text-[11px] text-subtle">Painel administrativo</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navigation.map((group) => {
          const GroupIcon = group.icon;
          const groupActive = group.items.some((item) => pathname === item.href);
          const isOpen = openGroups[group.label] ?? true;

          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                  groupActive ? 'text-brand-600 dark:text-brand-400' : 'text-muted hover:text-foreground'
                }`}
              >
                <GroupIcon size={17} strokeWidth={2} />
                <span className="flex-1 truncate text-[13px] font-semibold uppercase tracking-wide">
                  {group.label}
                </span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className={`grid overflow-hidden transition-all duration-200 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0">
                  <div className="ml-[1.15rem] space-y-0.5 border-l border-border py-1 pl-4">
                    {group.items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? 'bg-brand-600 font-medium text-white shadow-soft'
                              : 'text-muted hover:bg-surface-muted hover:text-foreground'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
