'use client';

import { useEffect, useState } from 'react';
import { Ban, Plus, StopCircle } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Locações</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Nova Locação
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
              <th className="px-4 py-2 text-left font-medium text-gray-600">Tipo</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Cliente</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Valor</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Carregando...</td></tr>}
            {!loading && locacoes.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Nenhuma locação encontrada</td></tr>
            )}
            {!loading &&
              locacoes.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{l.numero}</td>
                  <td className="px-4 py-2">{TIPOS.find((t) => t.value === l.tipo)?.label ?? l.tipo}</td>
                  <td className="px-4 py-2">{l.cliente?.nome}</td>
                  <td className="px-4 py-2">R$ {Number(l.valor).toFixed(2)}</td>
                  <td className="px-4 py-2">{statusLabel[l.status] ?? l.status}</td>
                  <td className="px-4 py-2 text-right">
                    {l.status === 'ATIVA' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => encerrar(l.id)} title="Encerrar" className="rounded p-1 text-blue-600 hover:bg-blue-50">
                          <StopCircle size={16} />
                        </button>
                        <button onClick={() => cancelar(l.id)} title="Cancelar" className="rounded p-1 text-red-600 hover:bg-red-50">
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
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tipo *</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cliente *</label>
            <select required value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="">Selecione...</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>{pessoaLabel(p)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Item a locar *</label>
            <select required value={unidadeId} onChange={(e) => handleUnidadeChange(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="">Selecione...</option>
              {opcoesUnidade.map((o) => (
                <option key={o.id} value={o.id}>{describeOpcao(tipo, o)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valor *</label>
              <input type="number" step="0.01" required value={valor} onChange={(e) => setValor(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Periodicidade</label>
              <select value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                <option value="DIARIA">Diária</option>
                <option value="SEMANAL">Semanal</option>
                <option value="MENSAL">Mensal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nº de Parcelas</label>
            <input type="number" min={1} value={numeroParcelas} onChange={(e) => setNumeroParcelas(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
