'use client';

import { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { podeEscrever } from '@/lib/auth';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

const VENDA_WRITE_ROLES = ['GERENTE', 'VENDEDOR'];

const TIPOS = [
  { value: 'JAZIGO', label: 'Jazigo' },
  { value: 'COLUMBARIO', label: 'Columbário' },
  { value: 'OSSUARIO', label: 'Ossuário' },
  { value: 'PRODUTO', label: 'Produto' },
  { value: 'SERVICO', label: 'Serviço' },
  { value: 'PLANO', label: 'Plano' },
];

const UNIDADE_ENDPOINT: Record<string, string> = {
  JAZIGO: '/jazigos',
  COLUMBARIO: '/columbarios',
  OSSUARIO: '/ossuarios',
  PRODUTO: '/produtos',
  SERVICO: '/servicos',
};
const UNIDADE_FIELD: Record<string, string> = {
  JAZIGO: 'jazigoId',
  COLUMBARIO: 'columbarioId',
  OSSUARIO: 'ossuarioId',
  PRODUTO: 'produtoId',
  SERVICO: 'servicoId',
};

const statusLabel: Record<string, string> = {
  ORCAMENTO: 'Orçamento',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
};

const statusBadge: Record<string, string> = {
  ORCAMENTO: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  CONFIRMADA: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  CANCELADA: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

interface ItemForm {
  descricao: string;
  unidadeId: string;
  quantidade: number;
  valorUnitario: number;
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tipo, setTipo] = useState('JAZIGO');
  const [clienteId, setClienteId] = useState('');
  const [numeroParcelas, setNumeroParcelas] = useState('1');
  const [opcoesUnidade, setOpcoesUnidade] = useState<any[]>([]);
  const [itens, setItens] = useState<ItemForm[]>([{ descricao: '', unidadeId: '', quantidade: 1, valorUnitario: 0 }]);

  async function load() {
    setLoading(true);
    try {
      const [{ data: vendasData }, { data: pessoasData }] = await Promise.all([
        api.get('/vendas', { params: { pageSize: 50 } }),
        api.get('/pessoas', { params: { pageSize: 200 } }),
      ]);
      setVendas(vendasData.data);
      setPessoas(pessoasData.data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const endpoint = UNIDADE_ENDPOINT[tipo];
    if (!endpoint) {
      setOpcoesUnidade([]);
      return;
    }
    api.get(endpoint, { params: { pageSize: 200 } }).then(({ data }) => {
      const disponiveis = data.data.filter((item: any) => !item.status || item.status === 'DISPONIVEL');
      setOpcoesUnidade(disponiveis);
    });
  }, [tipo, modalOpen]);

  function openCreate() {
    setTipo('JAZIGO');
    setClienteId('');
    setNumeroParcelas('1');
    setItens([{ descricao: '', unidadeId: '', quantidade: 1, valorUnitario: 0 }]);
    setError('');
    setModalOpen(true);
  }

  function addItem() {
    setItens((prev) => [...prev, { descricao: '', unidadeId: '', quantidade: 1, valorUnitario: 0 }]);
  }
  function removeItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateItem(idx: number, patch: Partial<ItemForm>) {
    setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function handleUnidadeChange(idx: number, unidadeId: string) {
    const opcao = opcoesUnidade.find((o) => o.id === unidadeId);
    updateItem(idx, {
      unidadeId,
      descricao: opcao ? describeOpcao(tipo, opcao) : '',
      valorUnitario: opcao ? Number(opcao.valor) : 0,
    });
  }

  function describeOpcao(tipo: string, opcao: any) {
    if (tipo === 'JAZIGO') return `Jazigo ${opcao.numero}`;
    if (tipo === 'COLUMBARIO') return `Columbário ${opcao.numero}`;
    if (tipo === 'OSSUARIO') return `Ossuário ${opcao.numero}`;
    return opcao.nome ?? opcao.numero ?? '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const unidadeField = UNIDADE_FIELD[tipo];
      const payload = {
        tipo,
        clienteId,
        numeroParcelas: Number(numeroParcelas) || 1,
        itens: itens.map((it) => ({
          descricao: it.descricao,
          quantidade: it.quantidade,
          valorUnitario: it.valorUnitario,
          ...(unidadeField && it.unidadeId ? { [unidadeField]: it.unidadeId } : {}),
        })),
      };
      await api.post('/vendas', payload);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function confirmar(id: string) {
    try {
      await api.post(`/vendas/${id}/confirmar`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }
  async function cancelar(id: string) {
    if (!confirm('Cancelar esta venda? Unidades vendidas voltarão a ficar disponíveis.')) return;
    try {
      await api.post(`/vendas/${id}/cancelar`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }
  async function excluir(id: string) {
    if (!confirm('Excluir este orçamento?')) return;
    try {
      await api.delete(`/vendas/${id}`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  const total = itens.reduce((acc, it) => acc + it.quantidade * it.valorUnitario, 0);
  const canWrite = podeEscrever(VENDA_WRITE_ROLES);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Vendas</h1>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98]"
          >
            <Plus size={16} /> Nova Venda
          </button>
        )}
      </div>

      {error && !modalOpen && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Número</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Valor Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-subtle">Carregando...</td></tr>
            )}
            {!loading && vendas.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-subtle">Nenhuma venda encontrada</td></tr>
            )}
            {!loading &&
              vendas.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">{v.numero}</td>
                  <td className="px-4 py-3">{v.tipo}</td>
                  <td className="px-4 py-3">{v.cliente?.nome}</td>
                  <td className="px-4 py-3">R$ {Number(v.valorTotal).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[v.status] ?? ''}`}>
                      {statusLabel[v.status] ?? v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {canWrite && v.status === 'ORCAMENTO' && (
                        <>
                          <button onClick={() => confirmar(v.id)} title="Confirmar" className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => excluir(v.id)} title="Excluir" className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {canWrite && v.status === 'CONFIRMADA' && (
                        <button onClick={() => cancelar(v.id)} title="Cancelar" className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Nova Venda" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Tipo *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Cliente *</label>
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Selecione...</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>{pessoaLabel(p)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-muted">Itens</label>
              <button type="button" onClick={addItem} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                + adicionar item
              </button>
            </div>
            <div className="space-y-2">
              {itens.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2 rounded-xl border border-border bg-surface-muted/50 p-2.5">
                  {UNIDADE_ENDPOINT[tipo] ? (
                    <div className="flex-1">
                      <label className="text-xs text-subtle">Item</label>
                      <select
                        required
                        value={item.unidadeId}
                        onChange={(e) => handleUnidadeChange(idx, e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">Selecione...</option>
                        {opcoesUnidade.map((o) => (
                          <option key={o.id} value={o.id}>
                            {describeOpcao(tipo, o)} - R$ {Number(o.valor).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <label className="text-xs text-subtle">Descrição</label>
                      <input
                        required
                        value={item.descricao}
                        onChange={(e) => updateItem(idx, { descricao: e.target.value })}
                        className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  )}
                  <div className="w-16">
                    <label className="text-xs text-subtle">Qtd</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) => updateItem(idx, { quantidade: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-subtle">Valor Unit.</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => updateItem(idx, { valorUnitario: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  {itens.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="mb-1.5 text-red-500 transition-colors hover:text-red-600 dark:hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="w-40">
              <label className="mb-1.5 block text-sm font-medium text-muted">Nº de Parcelas</label>
              <input
                type="number"
                min={1}
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <p className="text-sm font-semibold text-foreground">Total: R$ {total.toFixed(2)}</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
