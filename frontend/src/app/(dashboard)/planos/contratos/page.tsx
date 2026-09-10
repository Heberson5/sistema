'use client';

import { useEffect, useState } from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

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

const parcelaStatusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ATRASADO: 'Atrasado',
  CANCELADO: 'Cancelado',
};

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
      alert('12 novas parcelas geradas.');
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Contratos de Plano</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Novo Contrato
        </button>
      </div>

      {error && !modalOpen && (
        <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Número</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Plano</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Titular</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Mensalidade</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">Carregando...</td>
              </tr>
            )}
            {!loading && contratos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">Nenhum contrato encontrado</td>
              </tr>
            )}
            {!loading &&
              contratos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{c.numero}</td>
                  <td className="px-4 py-2">{c.plano?.nome}</td>
                  <td className="px-4 py-2">{c.titular?.nome}</td>
                  <td className="px-4 py-2">R$ {Number(c.valorMensalidade).toFixed(2)}</td>
                  <td className="px-4 py-2">{statusLabel[c.status] ?? c.status}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setParcelasModal(c)}
                        className="flex items-center gap-1 rounded p-1 text-blue-600 hover:bg-blue-50"
                        title="Ver parcelas"
                      >
                        <ReceiptText size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Novo Contrato de Plano" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Plano *</label>
            <select
              required
              value={form.planoId}
              onChange={(e) => setForm((f) => ({ ...f, planoId: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Titular *</label>
            <select
              required
              value={form.titularId}
              onChange={(e) => setForm((f) => ({ ...f, titularId: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Dia de Vencimento</label>
            <input
              type="number"
              min={1}
              max={28}
              value={form.diaVencimento}
              onChange={(e) => setForm((f) => ({ ...f, diaVencimento: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              rows={2}
            />
          </div>
          <p className="text-xs text-gray-500">
            Ao salvar, as primeiras 12 parcelas mensais serão geradas automaticamente.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
            <div className="mb-3 flex justify-end">
              <button
                onClick={() => gerarMaisParcelas(parcelasModal)}
                className="rounded-md border border-blue-600 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
              >
                Gerar mais 12 parcelas
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-1">#</th>
                  <th className="py-1">Vencimento</th>
                  <th className="py-1">Valor</th>
                  <th className="py-1">Status</th>
                  <th className="py-1" />
                </tr>
              </thead>
              <tbody>
                {parcelasModal.parcelas.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-1">{p.numeroParcela}</td>
                    <td className="py-1">{new Date(p.vencimento).toLocaleDateString('pt-BR')}</td>
                    <td className="py-1">R$ {Number(p.valor).toFixed(2)}</td>
                    <td className="py-1">{parcelaStatusLabel[p.status] ?? p.status}</td>
                    <td className="py-1 text-right">
                      {p.status === 'PENDENTE' && (
                        <button
                          onClick={() => marcarComoPaga(p)}
                          className="text-xs text-green-700 hover:underline"
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
        )}
      </Modal>
    </div>
  );
}
