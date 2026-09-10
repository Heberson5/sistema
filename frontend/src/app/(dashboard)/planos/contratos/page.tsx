'use client';

import { useEffect, useState } from 'react';
import { Plus, ReceiptText, Trash2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { podeEscrever } from '@/lib/auth';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

const CONTRATO_WRITE_ROLES = ['GERENTE', 'VENDEDOR'];
const PARCELA_WRITE_ROLES = ['GERENTE', 'FINANCEIRO'];

interface Plano {
  id: string;
  nome: string;
  valorMensalidade: string;
}
interface Pessoa {
  id: string;
  nome: string;
  cpfCnpj?: string;
}
interface Parcela {
  id: string;
  numeroParcela: number;
  competencia: string;
  valor: string;
  vencimento: string;
  status: string;
  dataPagamento?: string;
}
interface Contrato {
  id: string;
  numero: string;
  status: string;
  valorMensalidade: string;
  diaVencimento: number;
  plano: Plano;
  titular: Pessoa;
  beneficiarios: { id: string; pessoa: Pessoa; parentesco?: string }[];
  parcelas: Parcela[];
}

const statusLabel: Record<string, string> = {
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  CANCELADO: 'Cancelado',
  QUITADO: 'Quitado',
};

const statusBadge: Record<string, string> = {
  ATIVO: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  SUSPENSO: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  CANCELADO: 'bg-red-500/10 text-red-700 dark:text-red-400',
  QUITADO: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
};

const parcelaStatusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ATRASADO: 'Atrasado',
  CANCELADO: 'Cancelado',
};

const input =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const label = 'mb-1.5 block text-sm font-medium text-muted';
const errorBox =
  'rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400';

export default function ContratosPlanoPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [parcelasModal, setParcelasModal] = useState<Contrato | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ planoId: '', titularId: '', diaVencimento: '10', observacoes: '' });

  async function load() {
    setLoading(true);
    try {
      const [{ data: contratosData }, { data: planosData }, { data: pessoasData }] = await Promise.all([
        api.get('/contratos-plano', { params: { pageSize: 50 } }),
        api.get('/planos', { params: { pageSize: 100 } }),
        api.get('/pessoas', { params: { pageSize: 200 } }),
      ]);
      setContratos(contratosData.data);
      setPlanos(planosData.data);
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

  function openCreate() {
    setForm({ planoId: '', titularId: '', diaVencimento: '10', observacoes: '' });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/contratos-plano', {
        planoId: form.planoId,
        titularId: form.titularId,
        diaVencimento: Number(form.diaVencimento),
        observacoes: form.observacoes || undefined,
      });
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este contrato e todas as suas parcelas?')) return;
    try {
      await api.delete(`/contratos-plano/${id}`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  async function gerarMaisParcelas(contrato: Contrato) {
    try {
      await api.post(`/contratos-plano/${contrato.id}/gerar-parcelas?meses=12`);
      const { data } = await api.get(`/contratos-plano/${contrato.id}`);
      setParcelasModal(data);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  async function marcarComoPaga(parcela: Parcela) {
    try {
      await api.put(`/contrato-plano-parcelas/${parcela.id}`, {
        status: 'PAGO',
        dataPagamento: new Date().toISOString(),
      });
      const { data } = await api.get(`/contratos-plano/${parcelasModal!.id}`);
      setParcelasModal(data);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  const canWriteContrato = podeEscrever(CONTRATO_WRITE_ROLES);
  const canWriteParcela = podeEscrever(PARCELA_WRITE_ROLES);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Contratos de Plano</h1>
        {canWriteContrato && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98]"
          >
            <Plus size={16} /> Novo Contrato
          </button>
        )}
      </div>

      {error && !modalOpen && <div className={`mb-4 ${errorBox}`}>{error}</div>}

      {loading && (
        <div className="rounded-2xl border border-border bg-surface px-4 py-10 text-center text-sm text-subtle shadow-soft">
          Carregando...
        </div>
      )}
      {!loading && contratos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-subtle">
          Nenhum contrato encontrado
        </div>
      )}

      {!loading && contratos.length > 0 && (
        <>
          <div className="space-y-2.5 sm:hidden">
            {contratos.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{c.numero}</p>
                    <p className="text-xs text-subtle">{c.plano?.nome}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusBadge[c.status] ?? ''}`}>
                    {statusLabel[c.status] ?? c.status}
                  </span>
                </div>
                <p className="text-sm text-muted">{c.titular?.nome}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-semibold text-foreground">R$ {Number(c.valorMensalidade).toFixed(2)}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setParcelasModal(c)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 hover:bg-brand-500/10 dark:text-brand-400"
                    >
                      <ReceiptText size={15} />
                    </button>
                    {canWriteContrato && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft sm:block">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Número</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Plano</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Titular</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Mensalidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contratos.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-foreground">{c.numero}</td>
                    <td className="px-4 py-3 text-foreground">{c.plano?.nome}</td>
                    <td className="px-4 py-3 text-foreground">{c.titular?.nome}</td>
                    <td className="px-4 py-3 text-foreground">R$ {Number(c.valorMensalidade).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[c.status] ?? ''}`}>
                        {statusLabel[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setParcelasModal(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400"
                          title="Ver parcelas"
                        >
                          <ReceiptText size={15} />
                        </button>
                        {canWriteContrato && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={modalOpen} title="Novo Contrato de Plano" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && <div className={errorBox}>{error}</div>}
          <div>
            <label className={label}>Plano *</label>
            <select
              required
              value={form.planoId}
              onChange={(e) => setForm((f) => ({ ...f, planoId: e.target.value }))}
              className={input}
            >
              <option value="">Selecione...</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} (R$ {Number(p.valorMensalidade).toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Titular *</label>
            <select
              required
              value={form.titularId}
              onChange={(e) => setForm((f) => ({ ...f, titularId: e.target.value }))}
              className={input}
            >
              <option value="">Selecione...</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {pessoaLabel(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Dia de Vencimento</label>
            <input
              type="number"
              min={1}
              max={28}
              value={form.diaVencimento}
              onChange={(e) => setForm((f) => ({ ...f, diaVencimento: e.target.value }))}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              className={input}
              rows={2}
            />
          </div>
          <p className="text-xs text-subtle">
            Ao salvar, as primeiras 12 parcelas mensais serão geradas automaticamente.
          </p>
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

      <Modal
        open={!!parcelasModal}
        title={`Parcelas - Contrato ${parcelasModal?.numero ?? ''}`}
        onClose={() => setParcelasModal(null)}
      >
        {parcelasModal && (
          <div>
            {canWriteContrato && (
              <div className="mb-3 flex justify-end">
                <button
                  onClick={() => gerarMaisParcelas(parcelasModal)}
                  className="rounded-xl border border-brand-600 px-3.5 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400"
                >
                  Gerar mais 12 parcelas
                </button>
              </div>
            )}
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-subtle">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Vencimento</th>
                    <th className="px-3 py-2">Valor</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parcelasModal.parcelas.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 text-foreground">{p.numeroParcela}</td>
                      <td className="px-3 py-2 text-foreground">{new Date(p.vencimento).toLocaleDateString('pt-BR')}</td>
                      <td className="px-3 py-2 text-foreground">R$ {Number(p.valor).toFixed(2)}</td>
                      <td className="px-3 py-2 text-muted">{parcelaStatusLabel[p.status] ?? p.status}</td>
                      <td className="px-3 py-2 text-right">
                        {canWriteParcela && p.status === 'PENDENTE' && (
                          <button
                            onClick={() => marcarComoPaga(p)}
                            className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                          >
                            Marcar paga
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
