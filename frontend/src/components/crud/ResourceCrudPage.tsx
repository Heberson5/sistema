'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
  const primaryField = tableFields[0];
  const secondaryFields = tableFields.slice(1);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{config.title}</h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={16} />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder={config.searchPlaceholder ?? 'Buscar...'}
              className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground shadow-soft placeholder:text-subtle focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-56"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98]"
          >
            <Plus size={16} /> {config.createLabel ?? 'Novo'}
          </button>
        </div>
      </div>

      {error && !modalOpen && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-border bg-surface px-4 py-10 text-center text-sm text-subtle shadow-soft">
          Carregando...
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-subtle">
          Nenhum registro encontrado
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
          {/* Cards no mobile — sensação de app nativo em vez de tabela espremida */}
          <div className="space-y-2.5 sm:hidden">
            {rows.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-border bg-surface p-4 shadow-soft transition-shadow active:shadow-elevated"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate font-semibold text-foreground">
                    {primaryField ? renderCell(primaryField, row) : row.id}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 hover:bg-brand-500/10 dark:text-brand-400"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  {secondaryFields.map((f) => (
                    <div key={f.name} className="min-w-0">
                      <dt className="text-subtle">{f.label}</dt>
                      <dd className="truncate font-medium text-muted">{renderCell(f, row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {/* Tabela no desktop */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft sm:block">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  {tableFields.map((f) => (
                    <th
                      key={f.name}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-subtle"
                    >
                      {f.label}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-hover">
                    {tableFields.map((f) => (
                      <td key={f.name} className="px-4 py-3 text-foreground">
                        {renderCell(f, row)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-soft transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-soft transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? `Editar ${config.title}` : `Novo(a) ${config.title}`}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}
          {config.fields
            .filter((f) => !f.hideInForm)
            .map((field) => {
              const isRequired = field.required || (!editing && !!field.requiredOnCreate);
              return (
                <div key={field.name}>
                  <label className="mb-1.5 block text-sm font-medium text-muted">
                    {field.label}
                    {isRequired && <span className="text-red-500"> *</span>}
                  </label>
                  {renderInput(field, form, setForm, relationOptions, isRequired)}
                  {field.helperText && <p className="mt-1 text-xs text-subtle">{field.helperText}</p>}
                </div>
              );
            })}
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
  isRequired: boolean,
) {
  const commonClass =
    'w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-soft placeholder:text-subtle focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-surface-muted disabled:text-subtle';
  const value = form[field.name] ?? '';

  if (field.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={!!value}
        disabled={field.readOnlyInForm}
        onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.checked }))}
        className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500/30"
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        disabled={field.readOnlyInForm}
        required={isRequired}
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
        required={isRequired}
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
      required={isRequired}
      minLength={field.minLength}
      onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
      className={commonClass}
      step={field.type === 'number' ? '0.01' : undefined}
    />
  );
}
