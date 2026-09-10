'use client';

import { Menu, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { logout, obterUsuario, UsuarioLogado } from '@/lib/auth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeiras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return primeiras.join('') || '?';
}

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  useEffect(() => {
    setUsuario(obterUsuario());
  }, []);

  return (
    <header className="safe-top sticky top-0 z-30 flex h-16 items-center justify-between gap-3 rounded-b-3xl border-b border-border bg-surface/85 px-4 shadow-depth backdrop-blur-lg dark:shadow-depth-dark sm:px-6">
      <button
        onClick={onToggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-muted hover:text-foreground lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {usuario && (
          <div className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 sm:border sm:border-border sm:pr-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-700 text-xs font-bold text-white shadow-soft">
              {iniciais(usuario.nome)}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-foreground">{usuario.nome}</p>
              <p className="text-[11px] text-subtle">{usuario.papel}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Sair"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
