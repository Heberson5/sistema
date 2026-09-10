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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Guias Médicas</h1>
        <button onClick={openCreate} className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus size={16} /> Nova Guia
        </button>
      </div>

      {error && !modalOpen && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Número</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Tipo</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Beneficiário</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Prestador</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Carregando...</td></tr>}
            {!loading && guias.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Nenhuma guia encontrada</td></tr>
            )}
            {!loading &&
              guias.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{g.numero}</td>
                  <td className="px-4 py-2">{g.tipoGuia === 'EXAME' ? 'Exame' : 'Consulta'}</td>
                  <td className="px-4 py-2">{g.beneficiario?.nome}</td>
                  <td className="px-4 py-2">{g.prestador?.nome}</td>
                  <td className="px-4 py-2">{statusLabel[g.status] ?? g.status}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => excluir(g.id)} className="rounded p-1 text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Nova Guia Médica" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Beneficiário *</label>
              <select required value={beneficiarioId} onChange={(e) => setBeneficiarioId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                <option value="">Selecione...</option>
                {pessoas.map((p) => <option key={p.id} value={p.id}>{pessoaLabel(p)}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Prestador *</label>
              <select required value={prestadorId} onChange={(e) => setPrestadorId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                <option value="">Selecione...</option>
                {prestadores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
              <select value={tipoGuia} onChange={(e) => setTipoGuia(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                <option value="EXAME">Exame</option>
                <option value="CONSULTA">Consulta</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Médico Solicitante</label>
              <input value={medicoSolicitante} onChange={(e) => setMedicoSolicitante(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Procedimentos</label>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline">+ adicionar item</button>
            </div>
            <div className="space-y-2">
              {itens.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2 rounded-md border border-gray-200 p-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Procedimento</label>
                    <select required value={item.procedimentoMedicoId} onChange={(e) => handleProcedimento(idx, e.target.value)} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm">
                      <option value="">Selecione...</option>
                      {procedimentos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nome} - R$ {Number(p.valor).toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-16">
                    <label className="text-xs text-gray-500">Qtd</label>
                    <input type="number" min={1} value={item.quantidade} onChange={(e) => updateItem(idx, { quantidade: Number(e.target.value) })} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-gray-500">Valor Unit.</label>
                    <input type="number" step="0.01" value={item.valorUnitario} onChange={(e) => updateItem(idx, { valorUnitario: Number(e.target.value) })} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
                  </div>
                  {itens.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="mb-1 text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="text-right text-sm font-semibold text-gray-700">Total: R$ {total.toFixed(2)}</p>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
