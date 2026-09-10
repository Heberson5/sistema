'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { ThemePreference, useTheme } from '@/contexts/ThemeContext';

const OPTIONS: { value: ThemePreference; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Claro' },
  { value: 'dark', icon: Moon, label: 'Escuro' },
  { value: 'system', icon: Laptop, label: 'Automático' },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-surface-muted p-0.5">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.label}
            aria-label={opt.label}
            onClick={() => setPreference(opt.value)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
              active
                ? 'bg-surface text-brand-600 shadow-soft dark:text-brand-400'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}
