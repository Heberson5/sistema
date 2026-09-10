'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { FieldConfig, ResourceConfig, SelectOption } from '@/types/resource';

type Row = Record<string, any>;

function getInitialFormState(fields: FieldConfig[]): Row {
  const state: Row = {};
  for (const field of fields) {
    if (field.hideInForm) continue;
    state[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? false : '');
  }
  return state;
}

function toInputValue(field: FieldConfig, value: unknown) {
  if (value === null || value === undefined) return field.type === 'checkbox' ? false : '';
  if (field.type === 'date' && typeof value === 'string') return value.substring(0, 10);
  return value;
}

export function ResourceCrudPage({ config }: { config: ResourceConfig }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>(() => getInitialFormState(config.fields));
  const [relationOptions, setRelationOptions] = useState<Record<string, SelectOption[]>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(config.endpoint, {
        params: { page, pageSize: 10, search: search || undefined },
      });
      setRows(data.data);
      setTotalPages(Math.max(1, Math.ceil(data.total / data.pageSize)));
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const relFields = config.fields.filter((f) => f.relation);
    relFields.forEach(async (field) => {
      try {
        const { data } = await api.get(field.relation!.endpoint, { params: { pageSize: 200 } });
        const options: SelectOption[] = data.data.map((item: Row) => ({
          value: item[field.relation!.valueField ?? 'id'],
          label:
            typeof field.relation!.labelField === 'function'
              ? field.relation!.labelField(item)
              : item[field.relation!.labelField],
        }));
        setRelationOptions((prev) => ({ ...prev, [field.name]: options }));
      } catch {
        // ignora falha de carregamento de opções relacionadas
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.endpoint]);

  function openCreate() {
    setEditing(null);
    setForm(getInitialFormState(config.fields));
    setModalOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    const next: Row = {};
    for (const field of config.fields) {
      if (field.hideInForm) continue;
      next[field.name] = toInputValue(field, row[field.name]);
    }
    setForm(next);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Row = {};
      for (const field of config.fields) {
        if (field.hideInForm) continue;
        let value = form[field.name];
        if (value === '') value = undefined;
        if (field.type === 'number' && value !== undefined) value = Number(value);
        payload[field.name] = value;
      }
      if (editing) {
        await api.put(`${config.endpoint}/${editing.id}`, payload);
      } else {
        await api.post(config.endpoint, payload);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: Row) {
    if (!confirm('Confirma a exclusão deste registro?')) return;
    try {
      await api.delete(`${config.endpoint}/${row.id}`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  const tableFields = config.fields.filter((f) => !f.hideInTable);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-800">{config.title}</h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder={config.searchPlaceholder ?? 'Buscar...'}
              className="rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> {config.createLabel ?? 'Novo'}
          </button>
        </div>
      </div>

      {error && !modalOpen && (
        <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {tableFields.map((f) => (
                <th key={f.name} className="px-4 py-2 text-left font-medium text-gray-600">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={tableFields.length + 1} className="px-4 py-6 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={tableFields.length + 1} className="px-4 py-6 text-center text-gray-400">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {tableFields.map((f) => (
                    <td key={f.name} className="px-4 py-2 text-gray-700">
                      {renderCell(f, row)}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? `Editar ${config.title}` : `Novo(a) ${config.title}`}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {config.fields
            .filter((f) => !f.hideInForm)
            .map((field) => (
              <div key={field.name}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                {renderInput(field, form, setForm, relationOptions)}
              </div>
            ))}
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
    </div>
  );
}

function renderCell(field: FieldConfig, row: Row) {
  const value = row[field.name];
  if (field.formatTable) return field.formatTable(value, row);
  if (field.type === 'checkbox') return value ? 'Sim' : 'Não';
  if (field.type === 'date' && value) return new Date(value).toLocaleDateString('pt-BR');
  if (field.relation && value && typeof value === 'object') {
    const labelField = field.relation.labelField;
    return typeof labelField === 'function' ? labelField(value) : value[labelField];
  }
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return value ?? '-';
}

function renderInput(
  field: FieldConfig,
  form: Row,
  setForm: (updater: (prev: Row) => Row) => void,
  relationOptions: Record<string, SelectOption[]>,
) {
  const commonClass =
    'w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100';
  const value = form[field.name] ?? '';

  if (field.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={!!value}
        disabled={field.readOnlyInForm}
        onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.checked }))}
        className="h-4 w-4 rounded border-gray-300"
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        disabled={field.readOnlyInForm}
        required={field.required}
        onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
        className={commonClass}
        rows={3}
      />
    );
  }

  if (field.type === 'select' || field.relation) {
    const options = field.relation ? relationOptions[field.name] ?? [] : field.options ?? [];
    return (
      <select
        value={value}
        disabled={field.readOnlyInForm}
        required={field.required}
        onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
        className={commonClass}
      >
        <option value="">Selecione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type}
      value={value}
      disabled={field.readOnlyInForm}
      required={field.required}
      onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
      className={commonClass}
      step={field.type === 'number' ? '0.01' : undefined}
    />
  );
}
