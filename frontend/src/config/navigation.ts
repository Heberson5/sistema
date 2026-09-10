export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Geral',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pessoas', href: '/pessoas' },
      { label: 'Usuários', href: '/usuarios' },
    ],
  },
  {
    label: 'Planos de Assistência',
    items: [
      { label: 'Planos', href: '/planos' },
      { label: 'Coberturas', href: '/planos/coberturas' },
      { label: 'Contratos', href: '/planos/contratos' },
      { label: 'Beneficiários', href: '/planos/beneficiarios' },
    ],
  },
  {
    label: 'Cemitério',
    items: [
      { label: 'Cemitérios', href: '/cemiterios' },
      { label: 'Quadras', href: '/cemiterios/quadras' },
      { label: 'Alamedas', href: '/cemiterios/alamedas' },
      { label: 'Alas', href: '/cemiterios/alas' },
      { label: 'Blocos', href: '/cemiterios/blocos' },
      { label: 'Tipos de Jazigo', href: '/cemiterios/tipos-jazigo' },
      { label: 'Tipos de Columbário', href: '/cemiterios/tipos-columbario' },
      { label: 'Jazigos', href: '/cemiterios/jazigos' },
      { label: 'Columbários', href: '/cemiterios/columbarios' },
      { label: 'Ossuários', href: '/cemiterios/ossuarios' },
    ],
  },
  {
    label: 'Produtos e Serviços',
    items: [
      { label: 'Produtos', href: '/produtos' },
      { label: 'Serviços', href: '/servicos' },
    ],
  },
  {
    label: 'Vendas',
    items: [{ label: 'Vendas', href: '/vendas' }],
  },
  {
    label: 'Locações',
    items: [
      { label: 'Locações', href: '/locacoes' },
      { label: 'Salas Comerciais', href: '/locacoes/salas' },
      { label: 'Equip. Ortopédicos', href: '/locacoes/equipamentos' },
    ],
  },
  {
    label: 'Atendimento Funerário',
    items: [
      { label: 'Óbitos', href: '/atendimento/obitos' },
      { label: 'Atendimentos', href: '/atendimento' },
    ],
  },
  {
    label: 'Guias Médicas',
    items: [
      { label: 'Guias Médicas', href: '/guias-medicas' },
      { label: 'Prestadores', href: '/guias-medicas/prestadores' },
      { label: 'Procedimentos', href: '/guias-medicas/procedimentos' },
    ],
  },
];
