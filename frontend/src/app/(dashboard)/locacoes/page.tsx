'use client';

import { useEffect, useState } from 'react';
import { Ban, Plus, StopCircle } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { podeEscrever } from '@/lib/auth';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

const LOCACAO_WRITE_ROLES = ['GERENTE', 'VENDEDOR'];

const TIPOS = [
  { value: 'JAZIGO', label: 'Jazigo' },
  { value: 'SALA_COMERCIAL', label: 'Sala Comercial' },
  { value: 'ORTOPEDICO', label: 'Equipamento Ortopédico' },
];

const UNIDADE_ENDPOINT: Record<string, string> = {
  JAZIGO: '/jazigos',
  SALA_COMERCIAL: '/salas-comerciais',
  ORTOPEDICO: '/equipamentos-ortopedicos',
};
const UNIDADE_FIELD: Record<string, string> = {
  JAZIGO: 'jazigoId',
  SALA_COMERCIAL: 'salaComercialId',
  ORTOPEDICO: 'equipamentoOrtopedicoId',
};

const statusLabel: Record<string, string> = { ATIVA: 'Ativa', ENCERRADA: 'Encerrada', CANCELADA: 'Cancelada' };
const statusBadge: Record<string, string> = {
  ATIVA: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  ENCERRADA: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
  CANCELADA: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

function describeOpcao(tipo: string, opcao: any) {
  if (tipo === 'JAZIGO') return `Jazigo ${opcao.numero}`;
  if (tipo === 'SALA_COMERCIAL') return opcao.nome;
  if (tipo === 'ORTOPEDICO') return `${opcao.tipo} (${opcao.codigoPatrimonio ?? 's/ código'})`;
  return opcao.id;
}

export default function LocacoesPage() {
  const [locacoes, setLocacoes] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [opcoesUnidade, setOpcoesUnidade] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tipo, setTipo] = useState('JAZIGO');
  const [clienteId, setClienteId] = useState('');
  const [unidadeId, setUnidadeId] = useState('');
  const [valor, setValor] = useState('0');
  const [periodicidade, setPeriodicidade] = useState('MENSAL');
  const [numeroParcelas, setNumeroParcelas] = useState('1');

  async function load() {
    setLoading(true);
    try {
      const [{ data: locacoesData }, { data: pessoasData }] = await Promise.all([
        api.get('/locacoes', { params: { pageSize: 50 } }),
        api.get('/pessoas', { params: { pageSize: 200 } }),
      ]);
      setLocacoes(locacoesData.data);
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
    api.get(UNIDADE_ENDPOINT[tipo], { params: { pageSize: 200 } }).then(({ data }) => {
      setOpcoesUnidade(data.data.filter((i: any) => i.status === 'DISPONIVEL'));
    });
    setUnidadeId('');
    setValor('0');
  }, [tipo, modalOpen]);

  function openCreate() {
    setTipo('JAZIGO');
    setClienteId('');
    setUnidadeId('');
    setValor('0');
    setPeriodicidade('MENSAL');
    setNumeroParcelas('1');
    setError('');
    setModalOpen(true);
  }

  function handleUnidadeChange(id: string) {
    setUnidadeId(id);
    const opcao = opcoesUnidade.find((o) => o.id === id);
    if (opcao) {
      setValor(String(opcao.valorMensal ?? opcao.valorDiaria ?? opcao.valor ?? 0));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/locacoes', {
        tipo,
        clienteId,
        [UNIDADE_FIELD[tipo]]: unidadeId,
        valor: Number(valor),
        periodicidade,
        numeroParcelas: Number(numeroParcelas) || 1,
      });
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function encerrar(id: string) {
    if (!confirm('Encerrar esta locação?')) return;
    try {
      await api.post(`/locacoes/${id}/encerrar`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }
  async function cancelar(id: string) {
    if (!confirm('Cancelar esta locação?')) return;
    try {
      await api.post(`/locacoes/${id}/cancelar`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  const canWrite = podeEscrever(LOCACAO_WRITE_ROLES);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Locações</h1>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98]"
          >
            <Plus size={16} /> Nova Locação
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Valor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-subtle">Carregando...</td></tr>}
            {!loading && locacoes.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-subtle">Nenhuma locação encontrada</td></tr>
            )}
            {!loading &&
              locacoes.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-foreground">{l.numero}</td>
                  <td className="px-4 py-3">{TIPOS.find((t) => t.value === l.tipo)?.label ?? l.tipo}</td>
                  <td className="px-4 py-3">{l.cliente?.nome}</td>
                  <td className="px-4 py-3">R$ {Number(l.valor).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[l.status] ?? ''}`}>
                      {statusLabel[l.status] ?? l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite && l.status === 'ATIVA' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => encerrar(l.id)} title="Encerrar" className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400">
                          <StopCircle size={16} />
                        </button>
                        <button onClick={() => cancelar(l.id)} title="Cancelar" className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
                          <Ban size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Nova Locação" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</div>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Tipo *</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Cliente *</label>
            <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option value="">Selecione...</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>{pessoaLabel(p)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Item a locar *</label>
            <select required value={unidadeId} onChange={(e) => handleUnidadeChange(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option value="">Selecione...</option>
              {opcoesUnidade.map((o) => (
                <option key={o.id} value={o.id}>{describeOpcao(tipo, o)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Valor *</label>
              <input type="number" step="0.01" required value={valor} onChange={(e) => setValor(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Periodicidade</label>
              <select value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="DIARIA">Diária</option>
                <option value="SEMANAL">Semanal</option>
                <option value="MENSAL">Mensal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Nº de Parcelas</label>
            <input type="number" min={1} value={numeroParcelas} onChange={(e) => setNumeroParcelas(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
