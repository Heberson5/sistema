'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { podeEscrever } from '@/lib/auth';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

const ATENDIMENTO_WRITE_ROLES = ['GERENTE', 'ATENDENTE'];

const TIPOS = [
  { value: 'VELORIO_SEPULTAMENTO', label: 'Velório / Sepultamento' },
  { value: 'CREMACAO', label: 'Cremação' },
  { value: 'TRANSLADO', label: 'Translado' },
  { value: 'OUTROS', label: 'Outros' },
];
const statusLabel: Record<string, string> = {
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};
const statusBadge: Record<string, string> = {
  EM_ANDAMENTO: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  CONCLUIDO: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  CANCELADO: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

interface ItemForm {
  descricao: string;
  produtoId?: string;
  servicoId?: string;
  quantidade: number;
  valorUnitario: number;
}

export default function AtendimentosPage() {
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [obitos, setObitos] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [obitoId, setObitoId] = useState('');
  const [clienteResponsavelId, setClienteResponsavelId] = useState('');
  const [tipoAtendimento, setTipoAtendimento] = useState('VELORIO_SEPULTAMENTO');
  const [itens, setItens] = useState<ItemForm[]>([{ descricao: '', quantidade: 1, valorUnitario: 0 }]);

  async function load() {
    setLoading(true);
    try {
      const [{ data: at }, { data: ob }, { data: ps }, { data: pr }, { data: sv }] = await Promise.all([
        api.get('/atendimentos', { params: { pageSize: 50 } }),
        api.get('/obitos', { params: { pageSize: 100 } }),
        api.get('/pessoas', { params: { pageSize: 200 } }),
        api.get('/produtos', { params: { pageSize: 100 } }),
        api.get('/servicos', { params: { pageSize: 100 } }),
      ]);
      setAtendimentos(at.data);
      setObitos(ob.data);
      setPessoas(ps.data);
      setProdutos(pr.data);
      setServicos(sv.data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setObitoId('');
    setClienteResponsavelId('');
    setTipoAtendimento('VELORIO_SEPULTAMENTO');
    setItens([{ descricao: '', quantidade: 1, valorUnitario: 0 }]);
    setError('');
    setModalOpen(true);
  }

  function addItem() {
    setItens((prev) => [...prev, { descricao: '', quantidade: 1, valorUnitario: 0 }]);
  }
  function removeItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateItem(idx: number, patch: Partial<ItemForm>) {
    setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function handleProdutoServico(idx: number, kind: 'produtoId' | 'servicoId', id: string) {
    const lista = kind === 'produtoId' ? produtos : servicos;
    const opcao = lista.find((o) => o.id === id);
    updateItem(idx, {
      [kind]: id,
      [kind === 'produtoId' ? 'servicoId' : 'produtoId']: undefined,
      descricao: opcao?.nome ?? '',
      valorUnitario: opcao ? Number(opcao.valor) : 0,
    } as Partial<ItemForm>);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/atendimentos', {
        obitoId: obitoId || undefined,
        clienteResponsavelId,
        tipoAtendimento,
        itens: itens.filter((it) => it.descricao),
      });
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este atendimento?')) return;
    try {
      await api.delete(`/atendimentos/${id}`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  const total = itens.reduce((acc, it) => acc + it.quantidade * it.valorUnitario, 0);
  const canWrite = podeEscrever(ATENDIMENTO_WRITE_ROLES);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Atendimentos</h1>
        {canWrite && (
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98]">
            <Plus size={16} /> Novo Atendimento
          </button>
        )}
      </div>

      {error && !modalOpen && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Número</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Falecido</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Responsável</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-subtle">Carregando...</td></tr>}
            {!loading && atendimentos.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-subtle">Nenhum atendimento encontrado</td></tr>
            )}
            {!loading &&
              atendimentos.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">{a.numero}</td>
                  <td className="px-4 py-3">{TIPOS.find((t) => t.value === a.tipoAtendimento)?.label}</td>
                  <td className="px-4 py-3">{a.obito?.nomeFalecido ?? '-'}</td>
                  <td className="px-4 py-3">{a.clienteResponsavel?.nome}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[a.status] ?? ''}`}>
                      {statusLabel[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite && (
                      <button onClick={() => excluir(a.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Novo Atendimento" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Óbito (opcional)</label>
              <select value={obitoId} onChange={(e) => setObitoId(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="">Nenhum</option>
                {obitos.map((o) => (
                  <option key={o.id} value={o.id}>{o.nomeFalecido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Tipo</label>
              <select value={tipoAtendimento} onChange={(e) => setTipoAtendimento(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Responsável pelo atendimento *</label>
            <select required value={clienteResponsavelId} onChange={(e) => setClienteResponsavelId(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option value="">Selecione...</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>{pessoaLabel(p)}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-muted">Itens (produtos/serviços)</label>
              <button type="button" onClick={addItem} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">+ adicionar item</button>
            </div>
            <div className="space-y-2">
              {itens.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2 rounded-xl border border-border bg-surface-muted/50 p-2.5">
                  <div className="flex-1">
                    <label className="text-xs text-subtle">Produto</label>
                    <select
                      value={item.produtoId ?? ''}
                      onChange={(e) => e.target.value && handleProdutoServico(idx, 'produtoId', e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="">-</option>
                      {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-subtle">Serviço</label>
                    <select
                      value={item.servicoId ?? ''}
                      onChange={(e) => e.target.value && handleProdutoServico(idx, 'servicoId', e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="">-</option>
                      {servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                  </div>
                  <div className="w-16">
                    <label className="text-xs text-subtle">Qtd</label>
                    <input type="number" min={1} value={item.quantidade} onChange={(e) => updateItem(idx, { quantidade: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-subtle">Valor Unit.</label>
                    <input type="number" step="0.01" value={item.valorUnitario} onChange={(e) => updateItem(idx, { valorUnitario: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
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
          <p className="text-right text-sm font-semibold text-foreground">Total: R$ {total.toFixed(2)}</p>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
