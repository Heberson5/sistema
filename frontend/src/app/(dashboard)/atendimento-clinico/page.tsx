'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, CalendarClock, Plus, XCircle } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

const statusLabel: Record<string, string> = {
  AGENDADO: 'Agendado',
  CONFIRMADO: 'Confirmado',
  EM_ANDAMENTO: 'Em andamento',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
};
const statusBadge: Record<string, string> = {
  AGENDADO: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  CONFIRMADO: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  EM_ANDAMENTO: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  REALIZADO: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  CANCELADO: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

const input =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const label = 'mb-1.5 block text-sm font-medium text-muted';
const errorBox =
  'rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AtendimentoClinicoPage() {
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [beneficiarioId, setBeneficiarioId] = useState('');
  const [prestadorId, setPrestadorId] = useState('');
  const [tipoAtendimento, setTipoAtendimento] = useState('EXAME');
  const [dataAgendada, setDataAgendada] = useState('');
  const [observacoes, setObservacoes] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [{ data: a }, { data: p }, { data: pr }] = await Promise.all([
        api.get('/atendimentos-clinicos', { params: { pageSize: 50 } }),
        api.get('/pessoas', { params: { pageSize: 200 } }),
        api.get('/prestadores', { params: { pageSize: 100 } }),
      ]);
      setAtendimentos(a.data);
      setPessoas(p.data);
      setPrestadores(pr.data);
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
    setTipoAtendimento('EXAME');
    setDataAgendada('');
    setObservacoes('');
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/atendimentos-clinicos', {
        beneficiarioId,
        prestadorId,
        tipoAtendimento,
        dataAgendada: new Date(dataAgendada).toISOString(),
        observacoes: observacoes || undefined,
      });
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function concluir(id: string) {
    try {
      await api.post(`/atendimentos-clinicos/${id}/concluir`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }
  async function cancelar(id: string) {
    if (!confirm('Cancelar este atendimento clínico?')) return;
    try {
      await api.post(`/atendimentos-clinicos/${id}/cancelar`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Agenda Clínica</h1>
          <p className="text-sm text-subtle">Exames e consultas agendados junto aos prestadores</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98]"
        >
          <Plus size={16} /> Agendar
        </button>
      </div>

      {error && !modalOpen && <div className={`mb-4 ${errorBox}`}>{error}</div>}

      {loading && (
        <div className="rounded-2xl border border-border bg-surface px-4 py-10 text-center text-sm text-subtle shadow-soft">
          Carregando...
        </div>
      )}
      {!loading && atendimentos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-subtle">
          Nenhum atendimento clínico agendado
        </div>
      )}

      {!loading && atendimentos.length > 0 && (
        <>
          <div className="space-y-2.5 sm:hidden">
            {atendimentos.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{a.beneficiario?.nome}</p>
                    <p className="text-xs text-subtle">{a.tipoAtendimento === 'EXAME' ? 'Exame' : 'Consulta'} · {a.prestador?.nome}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusBadge[a.status] ?? ''}`}>
                    {statusLabel[a.status] ?? a.status}
                  </span>
                </div>
                <p className="text-sm text-muted">{formatDateTime(a.dataAgendada)}</p>
                {(a.status === 'AGENDADO' || a.status === 'CONFIRMADO' || a.status === 'EM_ANDAMENTO') && (
                  <div className="mt-2 flex justify-end gap-1">
                    <button onClick={() => concluir(a.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
                      <CalendarCheck size={15} />
                    </button>
                    <button onClick={() => cancelar(a.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400">
                      <XCircle size={15} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft sm:block">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Número</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Beneficiário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Prestador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Data agendada</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {atendimentos.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-foreground">{a.numero}</td>
                    <td className="px-4 py-3 text-foreground">{a.beneficiario?.nome}</td>
                    <td className="px-4 py-3 text-foreground">{a.tipoAtendimento === 'EXAME' ? 'Exame' : 'Consulta'}</td>
                    <td className="px-4 py-3 text-foreground">{a.prestador?.nome}</td>
                    <td className="px-4 py-3 text-foreground">{formatDateTime(a.dataAgendada)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[a.status] ?? ''}`}>
                        {statusLabel[a.status] ?? a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(a.status === 'AGENDADO' || a.status === 'CONFIRMADO' || a.status === 'EM_ANDAMENTO') && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => concluir(a.id)}
                            title="Marcar como realizado"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
                          >
                            <CalendarCheck size={15} />
                          </button>
                          <button
                            onClick={() => cancelar(a.id)}
                            title="Cancelar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={modalOpen} title="Agendar Atendimento Clínico" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && <div className={errorBox}>{error}</div>}
          <div>
            <label className={label}>Beneficiário *</label>
            <select required value={beneficiarioId} onChange={(e) => setBeneficiarioId(e.target.value)} className={input}>
              <option value="">Selecione...</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>{pessoaLabel(p)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Prestador *</label>
              <select required value={prestadorId} onChange={(e) => setPrestadorId(e.target.value)} className={input}>
                <option value="">Selecione...</option>
                {prestadores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Tipo</label>
              <select value={tipoAtendimento} onChange={(e) => setTipoAtendimento(e.target.value)} className={input}>
                <option value="EXAME">Exame</option>
                <option value="CONSULTA">Consulta</option>
              </select>
            </div>
          </div>
          <div>
            <label className={label}>
              <CalendarClock size={13} className="mr-1 inline" />
              Data e hora *
            </label>
            <input
              type="datetime-local"
              required
              value={dataAgendada}
              onChange={(e) => setDataAgendada(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Observações</label>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className={input} rows={2} />
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
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
