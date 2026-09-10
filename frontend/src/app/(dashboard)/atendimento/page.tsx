'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { pessoaLabel } from '@/config/resources';

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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Atendimentos</h1>
        <button onClick={openCreate} className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus size={16} /> Novo Atendimento
        </button>
      </div>

      {error && !modalOpen && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Número</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Tipo</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Falecido</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Responsável</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Carregando...</td></tr>}
            {!loading && atendimentos.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Nenhum atendimento encontrado</td></tr>
            )}
            {!loading &&
              atendimentos.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{a.numero}</td>
                  <td className="px-4 py-2">{TIPOS.find((t) => t.value === a.tipoAtendimento)?.label}</td>
                  <td className="px-4 py-2">{a.obito?.nomeFalecido ?? '-'}</td>
                  <td className="px-4 py-2">{a.clienteResponsavel?.nome}</td>
                  <td className="px-4 py-2">{statusLabel[a.status] ?? a.status}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => excluir(a.id)} className="rounded p-1 text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Novo Atendimento" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Óbito (opcional)</label>
              <select value={obitoId} onChange={(e) => setObitoId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                <option value="">Nenhum</option>
                {obitos.map((o) => (
                  <option key={o.id} value={o.id}>{o.nomeFalecido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
              <select value={tipoAtendimento} onChange={(e) => setTipoAtendimento(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Responsável pelo atendimento *</label>
            <select required value={clienteResponsavelId} onChange={(e) => setClienteResponsavelId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="">Selecione...</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>{pessoaLabel(p)}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Itens (produtos/serviços)</label>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline">+ adicionar item</button>
            </div>
            <div className="space-y-2">
              {itens.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2 rounded-md border border-gray-200 p-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Produto</label>
                    <select
                      value={item.produtoId ?? ''}
                      onChange={(e) => e.target.value && handleProdutoServico(idx, 'produtoId', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="">-</option>
                      {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Serviço</label>
                    <select
                      value={item.servicoId ?? ''}
                      onChange={(e) => e.target.value && handleProdutoServico(idx, 'servicoId', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="">-</option>
                      {servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
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
