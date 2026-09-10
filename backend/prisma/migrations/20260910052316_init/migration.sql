-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'GERENTE', 'ATENDENTE', 'VENDEDOR', 'FINANCEIRO');

-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('FISICA', 'JURIDICA');

-- CreateEnum
CREATE TYPE "TipoCobrancaPlano" AS ENUM ('MENSAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "StatusContratoPlano" AS ENUM ('ATIVO', 'SUSPENSO', 'CANCELADO', 'QUITADO');

-- CreateEnum
CREATE TYPE "StatusParcela" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusUnidade" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'LOCADO', 'OCUPADO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "TipoVenda" AS ENUM ('JAZIGO', 'COLUMBARIO', 'OSSUARIO', 'PRODUTO', 'SERVICO', 'PLANO');

-- CreateEnum
CREATE TYPE "StatusVenda" AS ENUM ('ORCAMENTO', 'CONFIRMADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoLocacao" AS ENUM ('JAZIGO', 'SALA_COMERCIAL', 'ORTOPEDICO');

-- CreateEnum
CREATE TYPE "StatusLocacao" AS ENUM ('ATIVA', 'ENCERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PeriodicidadeLocacao" AS ENUM ('DIARIA', 'SEMANAL', 'MENSAL');

-- CreateEnum
CREATE TYPE "TipoAtendimento" AS ENUM ('VELORIO_SEPULTAMENTO', 'CREMACAO', 'TRANSLADO', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusAtendimento" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoPrestador" AS ENUM ('LABORATORIO', 'CLINICA', 'MEDICO');

-- CreateEnum
CREATE TYPE "TipoProcedimentoMedico" AS ENUM ('EXAME_LABORATORIAL', 'EXAME_CLINICO', 'CONSULTA');

-- CreateEnum
CREATE TYPE "TipoGuia" AS ENUM ('EXAME', 'CONSULTA');

-- CreateEnum
CREATE TYPE "StatusGuia" AS ENUM ('EMITIDA', 'UTILIZADA', 'CANCELADA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'ATENDENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPessoa" NOT NULL DEFAULT 'FISICA',
    "nome" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "rg" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "sexo" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "celular" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pessoas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipoCobranca" "TipoCobrancaPlano" NOT NULL DEFAULT 'MENSAL',
    "valorMensalidade" DECIMAL(12,2) NOT NULL,
    "carenciaDias" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_coberturas" (
    "id" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "limiteValor" DECIMAL(12,2),
    "limiteQtd" INTEGER,

    CONSTRAINT "plano_coberturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos_plano" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "titularId" TEXT NOT NULL,
    "dataAdesao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diaVencimento" INTEGER NOT NULL DEFAULT 10,
    "valorMensalidade" DECIMAL(12,2) NOT NULL,
    "status" "StatusContratoPlano" NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato_plano_beneficiarios" (
    "id" TEXT NOT NULL,
    "contratoPlanoId" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "parentesco" TEXT,
    "dataInclusao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contrato_plano_beneficiarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato_plano_parcelas" (
    "id" TEXT NOT NULL,
    "contratoPlanoId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "competencia" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "formaPagamento" TEXT,
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "contrato_plano_parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cemiterios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cemiterios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quadras" (
    "id" TEXT NOT NULL,
    "cemiterioId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "quadras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alamedas" (
    "id" TEXT NOT NULL,
    "quadraId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "alamedas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_jazigo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "capacidadeGavetas" INTEGER NOT NULL DEFAULT 1,
    "valorBase" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "tipos_jazigo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jazigos" (
    "id" TEXT NOT NULL,
    "alamedaId" TEXT NOT NULL,
    "tipoJazigoId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "StatusUnidade" NOT NULL DEFAULT 'DISPONIVEL',
    "valor" DECIMAL(12,2) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jazigos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alas" (
    "id" TEXT NOT NULL,
    "cemiterioId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "alas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_columbario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "capacidadeUrnas" INTEGER NOT NULL DEFAULT 1,
    "valorBase" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "tipos_columbario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "columbarios" (
    "id" TEXT NOT NULL,
    "alaId" TEXT NOT NULL,
    "tipoColumbarioId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "StatusUnidade" NOT NULL DEFAULT 'DISPONIVEL',
    "valor" DECIMAL(12,2) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "columbarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocos" (
    "id" TEXT NOT NULL,
    "cemiterioId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "blocos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ossuarios" (
    "id" TEXT NOT NULL,
    "blocoId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "StatusUnidade" NOT NULL DEFAULT 'DISPONIVEL',
    "valor" DECIMAL(12,2) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ossuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "valor" DECIMAL(12,2) NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "valor" DECIMAL(12,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoVenda" NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vendedorId" TEXT,
    "dataVenda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "formaPagamento" TEXT,
    "status" "StatusVenda" NOT NULL DEFAULT 'ORCAMENTO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_itens" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "jazigoId" TEXT,
    "columbarioId" TEXT,
    "ossuarioId" TEXT,
    "produtoId" TEXT,
    "servicoId" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "venda_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_parcelas" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "formaPagamento" TEXT,
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "venda_parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salas_comerciais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "areaM2" DECIMAL(10,2),
    "valorMensal" DECIMAL(12,2) NOT NULL,
    "status" "StatusUnidade" NOT NULL DEFAULT 'DISPONIVEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salas_comerciais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamentos_ortopedicos" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "codigoPatrimonio" TEXT,
    "descricao" TEXT,
    "valorDiaria" DECIMAL(12,2) NOT NULL,
    "status" "StatusUnidade" NOT NULL DEFAULT 'DISPONIVEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipamentos_ortopedicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locacoes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoLocacao" NOT NULL,
    "clienteId" TEXT NOT NULL,
    "jazigoId" TEXT,
    "salaComercialId" TEXT,
    "equipamentoOrtopedicoId" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "valor" DECIMAL(12,2) NOT NULL,
    "periodicidade" "PeriodicidadeLocacao" NOT NULL DEFAULT 'MENSAL',
    "status" "StatusLocacao" NOT NULL DEFAULT 'ATIVA',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locacao_parcelas" (
    "id" TEXT NOT NULL,
    "locacaoId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "formaPagamento" TEXT,
    "status" "StatusParcela" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "locacao_parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obitos" (
    "id" TEXT NOT NULL,
    "nomeFalecido" TEXT NOT NULL,
    "cpfFalecido" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "dataFalecimento" TIMESTAMP(3) NOT NULL,
    "localFalecimento" TEXT,
    "causaMortis" TEXT,
    "numeroDO" TEXT,
    "responsavelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimentos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "obitoId" TEXT,
    "clienteResponsavelId" TEXT NOT NULL,
    "tipoAtendimento" "TipoAtendimento" NOT NULL DEFAULT 'VELORIO_SEPULTAMENTO',
    "dataAtendimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendenteId" TEXT,
    "status" "StatusAtendimento" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimento_itens" (
    "id" TEXT NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "produtoId" TEXT,
    "servicoId" TEXT,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "atendimento_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestadores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "tipo" "TipoPrestador" NOT NULL,
    "especialidade" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prestadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedimentos_medicos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" "TipoProcedimentoMedico" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "procedimentos_medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_medicas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "beneficiarioId" TEXT NOT NULL,
    "contratoPlanoId" TEXT,
    "prestadorId" TEXT NOT NULL,
    "tipoGuia" "TipoGuia" NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataValidade" TIMESTAMP(3),
    "medicoSolicitante" TEXT,
    "status" "StatusGuia" NOT NULL DEFAULT 'EMITIDA',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guias_medicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guia_medica_itens" (
    "id" TEXT NOT NULL,
    "guiaMedicaId" TEXT NOT NULL,
    "procedimentoMedicoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "guia_medica_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pessoas_cpfCnpj_key" ON "pessoas"("cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_plano_numero_key" ON "contratos_plano"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "jazigos_alamedaId_numero_key" ON "jazigos"("alamedaId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "columbarios_alaId_numero_key" ON "columbarios"("alaId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "ossuarios_blocoId_numero_key" ON "ossuarios"("blocoId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_numero_key" ON "vendas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "equipamentos_ortopedicos_codigoPatrimonio_key" ON "equipamentos_ortopedicos"("codigoPatrimonio");

-- CreateIndex
CREATE UNIQUE INDEX "locacoes_numero_key" ON "locacoes"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "atendimentos_numero_key" ON "atendimentos"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "guias_medicas_numero_key" ON "guias_medicas"("numero");

-- AddForeignKey
ALTER TABLE "plano_coberturas" ADD CONSTRAINT "plano_coberturas_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos_plano" ADD CONSTRAINT "contratos_plano_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos_plano" ADD CONSTRAINT "contratos_plano_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_plano_beneficiarios" ADD CONSTRAINT "contrato_plano_beneficiarios_contratoPlanoId_fkey" FOREIGN KEY ("contratoPlanoId") REFERENCES "contratos_plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_plano_beneficiarios" ADD CONSTRAINT "contrato_plano_beneficiarios_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_plano_parcelas" ADD CONSTRAINT "contrato_plano_parcelas_contratoPlanoId_fkey" FOREIGN KEY ("contratoPlanoId") REFERENCES "contratos_plano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quadras" ADD CONSTRAINT "quadras_cemiterioId_fkey" FOREIGN KEY ("cemiterioId") REFERENCES "cemiterios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alamedas" ADD CONSTRAINT "alamedas_quadraId_fkey" FOREIGN KEY ("quadraId") REFERENCES "quadras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jazigos" ADD CONSTRAINT "jazigos_alamedaId_fkey" FOREIGN KEY ("alamedaId") REFERENCES "alamedas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jazigos" ADD CONSTRAINT "jazigos_tipoJazigoId_fkey" FOREIGN KEY ("tipoJazigoId") REFERENCES "tipos_jazigo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alas" ADD CONSTRAINT "alas_cemiterioId_fkey" FOREIGN KEY ("cemiterioId") REFERENCES "cemiterios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "columbarios" ADD CONSTRAINT "columbarios_alaId_fkey" FOREIGN KEY ("alaId") REFERENCES "alas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "columbarios" ADD CONSTRAINT "columbarios_tipoColumbarioId_fkey" FOREIGN KEY ("tipoColumbarioId") REFERENCES "tipos_columbario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocos" ADD CONSTRAINT "blocos_cemiterioId_fkey" FOREIGN KEY ("cemiterioId") REFERENCES "cemiterios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ossuarios" ADD CONSTRAINT "ossuarios_blocoId_fkey" FOREIGN KEY ("blocoId") REFERENCES "blocos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_jazigoId_fkey" FOREIGN KEY ("jazigoId") REFERENCES "jazigos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_columbarioId_fkey" FOREIGN KEY ("columbarioId") REFERENCES "columbarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_ossuarioId_fkey" FOREIGN KEY ("ossuarioId") REFERENCES "ossuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_parcelas" ADD CONSTRAINT "venda_parcelas_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locacoes" ADD CONSTRAINT "locacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locacoes" ADD CONSTRAINT "locacoes_jazigoId_fkey" FOREIGN KEY ("jazigoId") REFERENCES "jazigos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locacoes" ADD CONSTRAINT "locacoes_salaComercialId_fkey" FOREIGN KEY ("salaComercialId") REFERENCES "salas_comerciais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locacoes" ADD CONSTRAINT "locacoes_equipamentoOrtopedicoId_fkey" FOREIGN KEY ("equipamentoOrtopedicoId") REFERENCES "equipamentos_ortopedicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locacao_parcelas" ADD CONSTRAINT "locacao_parcelas_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "locacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obitos" ADD CONSTRAINT "obitos_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "pessoas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_obitoId_fkey" FOREIGN KEY ("obitoId") REFERENCES "obitos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_clienteResponsavelId_fkey" FOREIGN KEY ("clienteResponsavelId") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_itens" ADD CONSTRAINT "atendimento_itens_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "atendimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_itens" ADD CONSTRAINT "atendimento_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimento_itens" ADD CONSTRAINT "atendimento_itens_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_medicas" ADD CONSTRAINT "guias_medicas_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_medicas" ADD CONSTRAINT "guias_medicas_contratoPlanoId_fkey" FOREIGN KEY ("contratoPlanoId") REFERENCES "contratos_plano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_medicas" ADD CONSTRAINT "guias_medicas_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guia_medica_itens" ADD CONSTRAINT "guia_medica_itens_guiaMedicaId_fkey" FOREIGN KEY ("guiaMedicaId") REFERENCES "guias_medicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guia_medica_itens" ADD CONSTRAINT "guia_medica_itens_procedimentoMedicoId_fkey" FOREIGN KEY ("procedimentoMedicoId") REFERENCES "procedimentos_medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
