'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Card {
  label: string;
  endpoint: string;
  href: string;
}

const cards: Card[] = [
  { label: 'Pessoas cadastradas', endpoint: '/pessoas', href: '/pessoas' },
  { label: 'Contratos de plano', endpoint: '/contratos-plano', href: '/planos/contratos' },
  { label: 'Jazigos', endpoint: '/jazigos', href: '/cemiterios/jazigos' },
  { label: 'Columbários', endpoint: '/columbarios', href: '/cemiterios/columbarios' },
  { label: 'Ossuários', endpoint: '/ossuarios', href: '/cemiterios/ossuarios' },
  { label: 'Vendas', endpoint: '/vendas', href: '/vendas' },
  { label: 'Locações ativas', endpoint: '/locacoes', href: '/locacoes' },
  { label: 'Atendimentos', endpoint: '/atendimentos', href: '/atendimento' },
  { label: 'Guias médicas', endpoint: '/guias-medicas', href: '/guias-medicas' },
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
      <h1 className="mb-4 text-xl font-semibold text-gray-800">Visão Geral</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.endpoint}
            href={card.href}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {totals[card.endpoint] ?? '-'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
