'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  HeartHandshake,
  KeyRound,
  Landmark,
  ShoppingCart,
  Stethoscope,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Card {
  label: string;
  endpoint: string;
  href: string;
  icon: typeof Users;
  color: string;
}

const cards: Card[] = [
  { label: 'Pessoas cadastradas', endpoint: '/pessoas', href: '/pessoas', icon: Users, color: 'from-sky-500 to-blue-600' },
  { label: 'Contratos de plano', endpoint: '/contratos-plano', href: '/planos/contratos', icon: HeartHandshake, color: 'from-rose-500 to-pink-600' },
  { label: 'Jazigos', endpoint: '/jazigos', href: '/cemiterios/jazigos', icon: Landmark, color: 'from-emerald-500 to-teal-600' },
  { label: 'Columbários', endpoint: '/columbarios', href: '/cemiterios/columbarios', icon: Landmark, color: 'from-teal-500 to-cyan-600' },
  { label: 'Ossuários', endpoint: '/ossuarios', href: '/cemiterios/ossuarios', icon: Landmark, color: 'from-cyan-500 to-sky-600' },
  { label: 'Vendas', endpoint: '/vendas', href: '/vendas', icon: ShoppingCart, color: 'from-amber-500 to-orange-600' },
  { label: 'Locações ativas', endpoint: '/locacoes', href: '/locacoes', icon: KeyRound, color: 'from-violet-500 to-purple-600' },
  { label: 'Atendimentos', endpoint: '/atendimentos', href: '/atendimento', icon: Building2, color: 'from-slate-500 to-slate-700' },
  { label: 'Atendimentos clínicos', endpoint: '/atendimentos-clinicos', href: '/atendimento-clinico', icon: Stethoscope, color: 'from-indigo-500 to-blue-700' },
];

export default function DashboardPage() {
  const [totals, setTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    cards.forEach(async (card) => {
      try {
        const { data } = await api.get(card.endpoint, { params: { pageSize: 1 } });
        setTotals((prev) => ({ ...prev, [card.endpoint]: data.total }));
      } catch {
        // ignora indisponibilidade pontual de um card
      }
    });
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold tracking-tight text-foreground">Visão Geral</h1>
      <p className="mb-5 text-sm text-subtle">Resumo dos módulos do sistema</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.endpoint}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated sm:p-5"
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-soft transition-transform group-hover:scale-105`}
              >
                <Icon size={18} />
              </div>
              <p className="text-xs text-subtle sm:text-sm">{card.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">
                {totals[card.endpoint] ?? <span className="text-subtle">–</span>}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
