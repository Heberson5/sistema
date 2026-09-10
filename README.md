# Sistema de Gestão Funerária (Web)

Sistema web para gestão de assistência funerária, inspirado no iVertex (ERP desktop
existente), reconstruído como aplicação web moderna. Cobre:

- Planos de assistência funerária (contratos, beneficiários, mensalidades)
- Venda de jazigos, columbários e ossuários
- Locação de jazigos, salas comerciais e equipamentos ortopédicos
- Atendimento funerário (óbitos, velório/sepultamento, cremação, translado)
- Atendimento clínico: agenda de exames e consultas junto a prestadores, com
  emissão de guias médicas (exames clínicos, laboratoriais e consultas)
- Cadastros de apoio: pessoas, produtos, serviços, prestadores, estrutura de cemitério

Interface com tema claro/escuro/automático, cantos arredondados e camadas de
profundidade (sombras), totalmente responsiva — em celulares o menu vira um
drawer, os modais viram bottom sheets e as tabelas viram cartões, para uma
sensação de aplicativo nativo.

## Arquitetura

Monorepo com duas aplicações independentes:

```
backend/    API REST em NestJS + Prisma ORM + PostgreSQL
frontend/   Aplicação web em Next.js (React) + Tailwind CSS
```

- **Autenticação**: JWT (login em `/api/auth/login`), papéis de usuário
  (ADMIN, GERENTE, ATENDENTE, VENDEDOR, FINANCEIRO).
- **Banco de dados**: PostgreSQL. Schema novo (não é migração direta do banco do
  iVertex), mas modelado a partir da planilha de referência das tabelas do
  iVertex (`tbl_cemitérios_*`, `tbl_contratos_*`, `tbl_vendas_*`,
  `tbl_atendimentos_*`, `tbl_produtos_*`/`tbl_serviços_*`, `ProcedMedicos`),
  simplificado para uma aplicação nova.
- **API**: Documentação automática via Swagger em `/api/docs`.
- **Frontend**: Telas de CRUD para cadastros simples usam um componente genérico
  orientado a configuração (`ResourceCrudPage`); fluxos com regra de negócio
  (vendas, locações, contratos de plano, atendimentos, guias médicas, agenda
  clínica) têm páginas dedicadas.
- **Tema**: claro/escuro/automático via `ThemeProvider` (`frontend/src/contexts/ThemeContext.tsx`),
  com tokens de cor em CSS variables (`globals.css`) e persistência em `localStorage`.
- **PWA-like**: manifest (`frontend/public/manifest.json`) e meta tags de app
  para instalação na tela inicial do celular (visual em tela cheia, sem barra do navegador).

### Segurança

- Autenticação JWT (Bearer, sem cookies de sessão — imune a CSRF), senha com
  bcrypt (custo 12) e verificação em tempo constante no login (mitiga
  enumeração de e-mail por *timing attack*).
- `helmet` (cabeçalhos de segurança HTTP) e `@nestjs/throttler` (limite de
  requisições, com limite mais restrito no endpoint de login).
- CORS restrito à origem do frontend (`FRONTEND_URL`), configurável por ambiente.
- Dependências auditadas e atualizadas (Nest 11, Next 16) — 0 vulnerabilidades
  conhecidas em produção no momento da última auditoria (`npm audit`).

### Mapeamento de módulos (app novo → referência iVertex)

| Módulo no sistema novo         | Tabelas de referência no iVertex                              |
|---------------------------------|-----------------------------------------------------------------|
| Planos / Contratos              | `tbl_contratos*`, `tbl_plano_*`, `tbl_planos_funerais_parâmetros` |
| Cemitério (jazigo/columbário/ossuário) | `tbl_cemitérios_*` (quadras, alamedas, alas, blocos, tipos, reservas) |
| Vendas                          | `tbl_vendas*`                                                   |
| Locações                        | (sem módulo dedicado equivalente — modelado com base em `tbl_cemitérios_contratos_localizações` e `tbl_serviços_recursos_salas`) |
| Atendimento funerário           | `tbl_atendimentos*`, `tbl_entidades_falecidos*`, `tbl_cemitérios_falecidos_eventos*` |
| Guias médicas                   | `ProcedMedicos`                                                 |
| Produtos / Serviços             | `tbl_produtos*`, `tbl_serviços*`                                |

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+ (local ou via Docker)

### 1. Banco de dados

Usando Docker (recomendado):
```bash
docker compose up -d
```
Isso sobe um PostgreSQL em `localhost:5432` com usuário/senha/banco `funeraria`.

Ou aponte `DATABASE_URL` (em `backend/.env`) para um PostgreSQL já existente.

### 2. Backend
```bash
cd backend
cp .env.example .env   # ajuste DATABASE_URL e JWT_SECRET se necessário
npm install
npx prisma migrate dev   # cria as tabelas
npx prisma db seed       # popula dados de exemplo
npm run start:dev        # http://localhost:3001/api (docs em /api/docs)
```

Usuário de exemplo criado pelo seed: `admin@funeraria.com` / `admin123`.

> O seed não é totalmente idempotente (a maioria dos registros usa `create`, não
> `upsert`) — rodar `npx prisma db seed` de novo num banco que já tem os dados
> falha por violação de unicidade. Para recomeçar do zero: `npx prisma migrate reset --force`
> (recria o banco, aplica as migrações e roda o seed automaticamente).

### 3. Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

O frontend espera a API em `http://localhost:3001/api` (configurável via
`frontend/.env.local`, variável `NEXT_PUBLIC_API_URL`).

## Estrutura do backend

```
backend/
  prisma/schema.prisma      # modelo de dados completo
  prisma/seed.ts            # dados de exemplo
  src/
    auth/                   # login JWT
    common/                 # guards, decorators, CRUD genérico, filtro de exceções
    prisma/                 # PrismaService/PrismaModule
    usuarios/ pessoas/ produtos-servicos/
    planos/                 # Plano, Cobertura, ContratoPlano (+ geração de parcelas)
    cemiterio/              # Cemitério, Quadra, Alameda, Ala, Bloco, Jazigo, Columbário, Ossuário
    vendas/                 # Venda (com confirmação/cancelamento e baixa de unidade)
    locacoes/               # Sala Comercial, Equipamento Ortopédico, Locação
    atendimento/            # Óbito, Atendimento
    guias-medicas/          # Prestador, Procedimento Médico, Guia Médica
    atendimento-clinico/    # Agenda de exames/consultas (com concluir/cancelar)
```

Entidades de cadastro simples usam uma base genérica de CRUD
(`BaseCrudService` + `BaseCrudController`); os fluxos com regra de negócio
(geração de parcelas, baixa/liberação de unidades ao confirmar/cancelar venda
ou locação, cálculo de totais a partir dos itens) têm serviços dedicados.

## Estrutura do frontend

```
frontend/src/
  app/(dashboard)/...    # páginas por módulo (protegidas por login)
  app/login/             # tela de login
  components/crud/       # ResourceCrudPage genérico (tabela desktop + cards mobile + modal)
  components/layout/     # Sidebar (grupos colapsáveis), Header (tema + avatar)
  components/ui/         # Modal, ThemeToggle
  contexts/ThemeContext.tsx  # claro/escuro/automático
  config/resources.ts    # configuração dos campos de cada cadastro simples
  config/navigation.ts   # menu lateral
  lib/api.ts             # cliente HTTP (axios) com JWT
```

## Próximos passos sugeridos

- Migração/importação de dados reais do iVertex (quando aplicável).
- Emissão de documentos/PDF (contratos, guias, recibos).
- Integração de cobrança (boleto/PIX) para parcelas.
- Regras de comissionamento de vendedores.
- Controle de permissões mais granular por papel em cada módulo.
- Relatórios gerenciais (ocupação de cemitério, inadimplência, etc).
