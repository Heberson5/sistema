'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

const statusLabel: Record<string, string> = {
  EMITIDA: 'Emitida',
  UTILIZADA: 'Utilizada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
};
const statusBadge: Record<string, string> = {
  EMITIDA: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  UTILIZADA: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  CANCELADA: 'bg-red-500/10 text-red-700 dark:text-red-400',
  EXPIRADA: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
};

interface ItemForm {
  procedimentoMedicoId: string;
  quantidade: number;
  valorUnitario: number;
}

export default function GuiasMedicasPage() {
  const [guias, setGuias] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [beneficiarioId, setBeneficiarioId] = useState('');
  const [prestadorId, setPrestadorId] = useState('');
  const [tipoGuia, setTipoGuia] = useState('EXAME');
  const [medicoSolicitante, setMedicoSolicitante] = useState('');
  const [itens, setItens] = useState<ItemForm[]>([{ procedimentoMedicoId: '', quantidade: 1, valorUnitario: 0 }]);

  async function load() {
    setLoading(true);
    try {
      const [{ data: g }, { data: p }, { data: pr }, { data: proc }] = await Promise.all([
        api.get('/guias-medicas', { params: { pageSize: 50 } }),
        api.get('/pessoas', { params: { pageSize: 200 } }),
        api.get('/prestadores', { params: { pageSize: 100 } }),
        api.get('/procedimentos-medicos', { params: { pageSize: 200 } }),
      ]);
      setGuias(g.data);
      setPessoas(p.data);
      setPrestadores(pr.data);
      setProcedimentos(proc.data);
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
    setBeneficiarioId('');
    setPrestadorId('');
    setTipoGuia('EXAME');
    setMedicoSolicitante('');
    setItens([{ procedimentoMedicoId: '', quantidade: 1, valorUnitario: 0 }]);
    setError('');
    setModalOpen(true);
  }

  function addItem() {
    setItens((prev) => [...prev, { procedimentoMedicoId: '', quantidade: 1, valorUnitario: 0 }]);
  }
  function removeItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateItem(idx: number, patch: Partial<ItemForm>) {
    setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function handleProcedimento(idx: number, id: string) {
    const opcao = procedimentos.find((o) => o.id === id);
    updateItem(idx, { procedimentoMedicoId: id, valorUnitario: opcao ? Number(opcao.valor) : 0 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/guias-medicas', {
        beneficiarioId,
        prestadorId,
        tipoGuia,
        medicoSolicitante: medicoSolicitante || undefined,
        itens: itens.filter((it) => it.procedimentoMedicoId),
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
    if (!confirm('Excluir esta guia médica?')) return;
    try {
      await api.delete(`/guias-medicas/${id}`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  const total = itens.reduce((acc, it) => acc + it.quantidade * it.valorUnitario, 0);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Guias Médicas</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98]">
          <Plus size={16} /> Nova Guia
        </button>
      </div>

      {error && !modalOpen && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Número</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Beneficiário</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Prestador</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-subtle">Carregando...</td></tr>}
            {!loading && guias.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-subtle">Nenhuma guia encontrada</td></tr>
            )}
            {!loading &&
              guias.map((g) => (
                <tr key={g.id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">{g.numero}</td>
                  <td className="px-4 py-3">{g.tipoGuia === 'EXAME' ? 'Exame' : 'Consulta'}</td>
                  <td className="px-4 py-3">{g.beneficiario?.nome}</td>
                  <td className="px-4 py-3">{g.prestador?.nome}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[g.status] ?? ''}`}>
                      {statusLabel[g.status] ?? g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => excluir(g.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Nova Guia Médica" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Beneficiário *</label>
              <select required value={beneficiarioId} onChange={(e) => setBeneficiarioId(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="">Selecione...</option>
                {pessoas.map((p) => <option key={p.id} value={p.id}>{pessoaLabel(p)}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Prestador *</label>
              <select required value={prestadorId} onChange={(e) => setPrestadorId(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="">Selecione...</option>
                {prestadores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Tipo</label>
              <select value={tipoGuia} onChange={(e) => setTipoGuia(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="EXAME">Exame</option>
                <option value="CONSULTA">Consulta</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Médico Solicitante</label>
              <input value={medicoSolicitante} onChange={(e) => setMedicoSolicitante(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-muted">Procedimentos</label>
              <button type="button" onClick={addItem} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">+ adicionar item</button>
            </div>
            <div className="space-y-2">
              {itens.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2 rounded-xl border border-border bg-surface-muted/50 p-2.5">
                  <div className="flex-1">
                    <label className="text-xs text-subtle">Procedimento</label>
                    <select required value={item.procedimentoMedicoId} onChange={(e) => handleProcedimento(idx, e.target.value)} className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                      <option value="">Selecione...</option>
                      {procedimentos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nome} - R$ {Number(p.valor).toFixed(2)}</option>
                      ))}
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
