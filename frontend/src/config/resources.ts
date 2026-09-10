import { ResourceConfig } from '@/types/resource';

const pessoaLabel = (item: any) => (item.cpfCnpj ? `${item.nome} (${item.cpfCnpj})` : item.nome);

export const usuariosConfig: ResourceConfig = {
  title: 'Usuários',
  endpoint: '/usuarios',
  searchPlaceholder: 'Buscar por nome ou e-mail',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'email', label: 'E-mail', type: 'email', required: true },
    { name: 'senha', label: 'Senha', type: 'text', hideInTable: true },
    {
      name: 'papel',
      label: 'Papel',
      type: 'select',
      required: true,
      defaultValue: 'ATENDENTE',
      options: [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'GERENTE', label: 'Gerente' },
        { value: 'ATENDENTE', label: 'Atendente' },
        { value: 'VENDEDOR', label: 'Vendedor' },
        { value: 'FINANCEIRO', label: 'Financeiro' },
      ],
    },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export const pessoasConfig: ResourceConfig = {
  title: 'Pessoas',
  endpoint: '/pessoas',
  searchPlaceholder: 'Buscar por nome, CPF/CNPJ ou e-mail',
  fields: [
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      defaultValue: 'FISICA',
      options: [
        { value: 'FISICA', label: 'Pessoa Física' },
        { value: 'JURIDICA', label: 'Pessoa Jurídica' },
      ],
    },
    { name: 'nome', label: 'Nome / Razão Social', type: 'text', required: true },
    { name: 'cpfCnpj', label: 'CPF/CNPJ', type: 'text' },
    { name: 'rg', label: 'RG', type: 'text', hideInTable: true },
    { name: 'dataNascimento', label: 'Data de Nascimento', type: 'date', hideInTable: true },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'telefone', label: 'Telefone', type: 'text', hideInTable: true },
    { name: 'celular', label: 'Celular', type: 'text' },
    { name: 'cep', label: 'CEP', type: 'text', hideInTable: true },
    { name: 'logradouro', label: 'Logradouro', type: 'text', hideInTable: true },
    { name: 'numero', label: 'Número', type: 'text', hideInTable: true },
    { name: 'complemento', label: 'Complemento', type: 'text', hideInTable: true },
    { name: 'bairro', label: 'Bairro', type: 'text', hideInTable: true },
    { name: 'cidade', label: 'Cidade', type: 'text' },
    { name: 'uf', label: 'UF', type: 'text' },
    { name: 'observacoes', label: 'Observações', type: 'textarea', hideInTable: true },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export const planosConfig: ResourceConfig = {
  title: 'Planos',
  endpoint: '/planos',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'textarea', hideInTable: true },
    {
      name: 'tipoCobranca',
      label: 'Cobrança',
      type: 'select',
      defaultValue: 'MENSAL',
      options: [
        { value: 'MENSAL', label: 'Mensal' },
        { value: 'ANUAL', label: 'Anual' },
      ],
    },
    { name: 'valorMensalidade', label: 'Valor Mensalidade', type: 'number', required: true },
    { name: 'carenciaDias', label: 'Carência (dias)', type: 'number', defaultValue: 0 },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export const planoCoberturasConfig: ResourceConfig = {
  title: 'Coberturas de Plano',
  endpoint: '/plano-coberturas',
  fields: [
    { name: 'planoId', label: 'Plano', type: 'select', required: true, relation: { endpoint: '/planos', labelField: 'nome' }, hideInTable: true },
    { name: 'plano', label: 'Plano', hideInForm: true, type: 'text', formatTable: (v) => v?.nome ?? '-' },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    { name: 'limiteValor', label: 'Limite (R$)', type: 'number' },
    { name: 'limiteQtd', label: 'Limite (qtd)', type: 'number' },
  ],
};

export const beneficiariosConfig: ResourceConfig = {
  title: 'Beneficiários de Contrato',
  endpoint: '/contrato-plano-beneficiarios',
  fields: [
    {
      name: 'contratoPlanoId',
      label: 'Contrato',
      type: 'select',
      required: true,
      hideInTable: true,
      relation: { endpoint: '/contratos-plano', labelField: 'numero' },
    },
    { name: 'pessoaId', label: 'Pessoa', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/pessoas', labelField: pessoaLabel } },
    { name: 'pessoa', label: 'Pessoa', hideInForm: true, type: 'text', formatTable: (v) => v?.nome ?? '-' },
    { name: 'parentesco', label: 'Parentesco', type: 'text' },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export const cemiteriosConfig: ResourceConfig = {
  title: 'Cemitérios',
  endpoint: '/cemiterios',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'cnpj', label: 'CNPJ', type: 'text', hideInTable: true },
    { name: 'telefone', label: 'Telefone', type: 'text', hideInTable: true },
    { name: 'cidade', label: 'Cidade', type: 'text' },
    { name: 'uf', label: 'UF', type: 'text' },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export const quadrasConfig: ResourceConfig = {
  title: 'Quadras',
  endpoint: '/quadras',
  fields: [
    { name: 'cemiterioId', label: 'Cemitério', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/cemiterios', labelField: 'nome' } },
    { name: 'cemiterio', label: 'Cemitério', hideInForm: true, type: 'text', formatTable: (v) => v?.nome ?? '-' },
    { name: 'codigo', label: 'Código', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text' },
  ],
};

export const alamedasConfig: ResourceConfig = {
  title: 'Alamedas',
  endpoint: '/alamedas',
  fields: [
    { name: 'quadraId', label: 'Quadra', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/quadras', labelField: 'codigo' } },
    { name: 'quadra', label: 'Quadra', hideInForm: true, type: 'text', formatTable: (v) => v?.codigo ?? '-' },
    { name: 'codigo', label: 'Código', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text' },
  ],
};

export const alasConfig: ResourceConfig = {
  title: 'Alas (Columbário)',
  endpoint: '/alas',
  fields: [
    { name: 'cemiterioId', label: 'Cemitério', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/cemiterios', labelField: 'nome' } },
    { name: 'cemiterio', label: 'Cemitério', hideInForm: true, type: 'text', formatTable: (v) => v?.nome ?? '-' },
    { name: 'codigo', label: 'Código', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text' },
  ],
};

export const blocosConfig: ResourceConfig = {
  title: 'Blocos (Ossuário)',
  endpoint: '/blocos',
  fields: [
    { name: 'cemiterioId', label: 'Cemitério', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/cemiterios', labelField: 'nome' } },
    { name: 'cemiterio', label: 'Cemitério', hideInForm: true, type: 'text', formatTable: (v) => v?.nome ?? '-' },
    { name: 'codigo', label: 'Código', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'text' },
  ],
};

export const tiposJazigoConfig: ResourceConfig = {
  title: 'Tipos de Jazigo',
  endpoint: '/tipos-jazigo',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'capacidadeGavetas', label: 'Capacidade (gavetas)', type: 'number', defaultValue: 1 },
    { name: 'valorBase', label: 'Valor Base', type: 'number', required: true },
  ],
};

export const tiposColumbarioConfig: ResourceConfig = {
  title: 'Tipos de Columbário',
  endpoint: '/tipos-columbario',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'capacidadeUrnas', label: 'Capacidade (urnas)', type: 'number', defaultValue: 1 },
    { name: 'valorBase', label: 'Valor Base', type: 'number', required: true },
  ],
};

const statusUnidadeOptions = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'LOCADO', label: 'Locado' },
  { value: 'OCUPADO', label: 'Ocupado' },
  { value: 'BLOQUEADO', label: 'Bloqueado' },
];

export const jazigosConfig: ResourceConfig = {
  title: 'Jazigos',
  endpoint: '/jazigos',
  searchPlaceholder: 'Buscar por número',
  fields: [
    { name: 'alamedaId', label: 'Alameda', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/alamedas', labelField: 'codigo' } },
    { name: 'alameda', label: 'Alameda', hideInForm: true, type: 'text', formatTable: (v) => v?.codigo ?? '-' },
    { name: 'tipoJazigoId', label: 'Tipo', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/tipos-jazigo', labelField: 'nome' } },
    { name: 'tipoJazigo', label: 'Tipo', hideInForm: true, type: 'text', formatTable: (v) => v?.nome ?? '-' },
    { name: 'numero', label: 'Número', type: 'text', required: true },
    { name: 'valor', label: 'Valor', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'DISPONIVEL', options: statusUnidadeOptions },
    { name: 'observacoes', label: 'Observações', type: 'textarea', hideInTable: true },
  ],
};

export const columbariosConfig: ResourceConfig = {
  title: 'Columbários',
  endpoint: '/columbarios',
  searchPlaceholder: 'Buscar por número',
  fields: [
    { name: 'alaId', label: 'Ala', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/alas', labelField: 'codigo' } },
    { name: 'ala', label: 'Ala', hideInForm: true, type: 'text', formatTable: (v) => v?.codigo ?? '-' },
    { name: 'tipoColumbarioId', label: 'Tipo', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/tipos-columbario', labelField: 'nome' } },
    { name: 'tipoColumbario', label: 'Tipo', hideInForm: true, type: 'text', formatTable: (v) => v?.nome ?? '-' },
    { name: 'numero', label: 'Número', type: 'text', required: true },
    { name: 'valor', label: 'Valor', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'DISPONIVEL', options: statusUnidadeOptions },
    { name: 'observacoes', label: 'Observações', type: 'textarea', hideInTable: true },
  ],
};

export const ossuariosConfig: ResourceConfig = {
  title: 'Ossuários',
  endpoint: '/ossuarios',
  searchPlaceholder: 'Buscar por número',
  fields: [
    { name: 'blocoId', label: 'Bloco', type: 'select', required: true, hideInTable: true, relation: { endpoint: '/blocos', labelField: 'codigo' } },
    { name: 'bloco', label: 'Bloco', hideInForm: true, type: 'text', formatTable: (v) => v?.codigo ?? '-' },
    { name: 'numero', label: 'Número', type: 'text', required: true },
    { name: 'valor', label: 'Valor', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'DISPONIVEL', options: statusUnidadeOptions },
    { name: 'observacoes', label: 'Observações', type: 'textarea', hideInTable: true },
  ],
};

export const produtosConfig: ResourceConfig = {
  title: 'Produtos',
  endpoint: '/produtos',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'categoria', label: 'Categoria', type: 'text' },
    { name: 'descricao', label: 'Descrição', type: 'textarea', hideInTable: true },
    { name: 'valor', label: 'Valor', type: 'number', required: true },
    { name: 'estoque', label: 'Estoque', type: 'number', defaultValue: 0 },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export const servicosConfig: ResourceConfig = {
  title: 'Serviços',
  endpoint: '/servicos',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'categoria', label: 'Categoria', type: 'text' },
    { name: 'descricao', label: 'Descrição', type: 'textarea', hideInTable: true },
    { name: 'valor', label: 'Valor', type: 'number', required: true },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export const salasComerciaisConfig: ResourceConfig = {
  title: 'Salas Comerciais',
  endpoint: '/salas-comerciais',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'textarea', hideInTable: true },
    { name: 'areaM2', label: 'Área (m²)', type: 'number' },
    { name: 'valorMensal', label: 'Valor Mensal', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'DISPONIVEL', options: statusUnidadeOptions },
  ],
};

export const equipamentosOrtopedicosConfig: ResourceConfig = {
  title: 'Equipamentos Ortopédicos',
  endpoint: '/equipamentos-ortopedicos',
  fields: [
    { name: 'tipo', label: 'Tipo', type: 'text', required: true },
    { name: 'codigoPatrimonio', label: 'Código Patrimônio', type: 'text' },
    { name: 'descricao', label: 'Descrição', type: 'textarea', hideInTable: true },
    { name: 'valorDiaria', label: 'Valor Diária', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'DISPONIVEL', options: statusUnidadeOptions },
  ],
};

export const obitosConfig: ResourceConfig = {
  title: 'Óbitos',
  endpoint: '/obitos',
  searchPlaceholder: 'Buscar por nome do falecido',
  fields: [
    { name: 'nomeFalecido', label: 'Nome do Falecido', type: 'text', required: true },
    { name: 'cpfFalecido', label: 'CPF do Falecido', type: 'text' },
    { name: 'dataNascimento', label: 'Data de Nascimento', type: 'date', hideInTable: true },
    { name: 'dataFalecimento', label: 'Data de Falecimento', type: 'date', required: true },
    { name: 'localFalecimento', label: 'Local do Falecimento', type: 'text', hideInTable: true },
    { name: 'causaMortis', label: 'Causa Mortis', type: 'text', hideInTable: true },
    { name: 'numeroDO', label: 'Nº Declaração de Óbito', type: 'text' },
    { name: 'responsavelId', label: 'Responsável', type: 'select', hideInTable: true, relation: { endpoint: '/pessoas', labelField: pessoaLabel } },
    { name: 'responsavel', label: 'Responsável', hideInForm: true, type: 'text', formatTable: (v) => v?.nome ?? '-' },
  ],
};

export const prestadoresConfig: ResourceConfig = {
  title: 'Prestadores',
  endpoint: '/prestadores',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'cpfCnpj', label: 'CPF/CNPJ', type: 'text' },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        { value: 'LABORATORIO', label: 'Laboratório' },
        { value: 'CLINICA', label: 'Clínica' },
        { value: 'MEDICO', label: 'Médico' },
      ],
    },
    { name: 'especialidade', label: 'Especialidade', type: 'text', hideInTable: true },
    { name: 'telefone', label: 'Telefone', type: 'text', hideInTable: true },
    { name: 'email', label: 'E-mail', type: 'email', hideInTable: true },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export const procedimentosMedicosConfig: ResourceConfig = {
  title: 'Procedimentos Médicos',
  endpoint: '/procedimentos-medicos',
  fields: [
    { name: 'codigo', label: 'Código', type: 'text' },
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        { value: 'EXAME_LABORATORIAL', label: 'Exame Laboratorial' },
        { value: 'EXAME_CLINICO', label: 'Exame Clínico' },
        { value: 'CONSULTA', label: 'Consulta' },
      ],
    },
    { name: 'valor', label: 'Valor', type: 'number', required: true },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
};

export { pessoaLabel, statusUnidadeOptions };
