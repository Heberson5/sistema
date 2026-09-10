export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'textarea';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Só é obrigatório ao criar (ex.: senha, que ao editar pode ficar em branco para não ser alterada). */
  requiredOnCreate?: boolean;
  minLength?: number;
  helperText?: string;
  options?: SelectOption[];
  /** Popula as opções do select buscando outro endpoint (relacionamento). */
  relation?: {
    endpoint: string;
    labelField: string | ((item: any) => string);
    valueField?: string;
  };
  hideInTable?: boolean;
  hideInForm?: boolean;
  readOnlyInForm?: boolean;
  formatTable?: (value: any, row: any) => string;
  defaultValue?: unknown;
}

export interface ResourceConfig {
  title: string;
  endpoint: string;
  fields: FieldConfig[];
  searchPlaceholder?: string;
  createLabel?: string;
  /** Papéis que podem criar/editar/excluir (espelha o backend). Sem isso, qualquer papel pode. */
  writeRoles?: string[];
}
