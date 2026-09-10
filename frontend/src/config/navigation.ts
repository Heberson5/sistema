import {
  Building2,
  HeartHandshake,
  Home,
  KeyRound,
  Landmark,
  Package,
  ShoppingCart,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  /** Papéis que podem ver este item. Sem isso, qualquer papel autenticado vê. */
  roles?: string[];
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Geral',
    icon: Home,
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pessoas', href: '/pessoas' },
      { label: 'Usuários', href: '/usuarios', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Planos de Assistência',
    icon: HeartHandshake,
    items: [
      { label: 'Planos', href: '/planos' },
      { label: 'Coberturas', href: '/planos/coberturas' },
      { label: 'Contratos', href: '/planos/contratos' },
      { label: 'Beneficiários', href: '/planos/beneficiarios' },
    ],
  },
  {
    label: 'Cemitério',
    icon: Landmark,
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
    icon: Package,
    items: [
      { label: 'Produtos', href: '/produtos' },
      { label: 'Serviços', href: '/servicos' },
    ],
  },
  {
    label: 'Vendas',
    icon: ShoppingCart,
    items: [{ label: 'Vendas', href: '/vendas' }],
  },
  {
    label: 'Locações',
    icon: KeyRound,
    items: [
      { label: 'Locações', href: '/locacoes' },
      { label: 'Salas Comerciais', href: '/locacoes/salas' },
      { label: 'Equip. Ortopédicos', href: '/locacoes/equipamentos' },
    ],
  },
  {
    label: 'Atendimento Funerário',
    icon: Building2,
    items: [
      { label: 'Óbitos', href: '/atendimento/obitos' },
      { label: 'Atendimentos', href: '/atendimento' },
    ],
  },
  {
    label: 'Atendimento Clínico',
    icon: Stethoscope,
    items: [
      { label: 'Guias Médicas', href: '/guias-medicas' },
      { label: 'Prestadores', href: '/guias-medicas/prestadores' },
      { label: 'Procedimentos', href: '/guias-medicas/procedimentos' },
    ],
  },
];
