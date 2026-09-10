'use client';

import { Menu, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { logout, obterUsuario, UsuarioLogado } from '@/lib/auth';

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  useEffect(() => {
    setUsuario(obterUsuario());
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <button onClick={onToggleSidebar} className="rounded p-1 text-gray-600 hover:bg-gray-100 lg:hidden">
        <Menu size={20} />
      </button>
      <div className="ml-auto flex items-center gap-3">
        {usuario && (
          <span className="text-sm text-gray-600">
            {usuario.nome} <span className="text-gray-400">({usuario.papel})</span>
          </span>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </header>
  );
}
