-- CreateEnum
CREATE TYPE "StatusAtendimentoClinico" AS ENUM ('AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO', 'REALIZADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "atendimentos_clinicos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "beneficiarioId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "guiaMedicaId" TEXT,
    "tipoAtendimento" "TipoGuia" NOT NULL,
    "dataAgendada" TIMESTAMP(3) NOT NULL,
    "dataRealizada" TIMESTAMP(3),
    "status" "StatusAtendimentoClinico" NOT NULL DEFAULT 'AGENDADO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atendimentos_clinicos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "atendimentos_clinicos_numero_key" ON "atendimentos_clinicos"("numero");

-- AddForeignKey
ALTER TABLE "atendimentos_clinicos" ADD CONSTRAINT "atendimentos_clinicos_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos_clinicos" ADD CONSTRAINT "atendimentos_clinicos_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "prestadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos_clinicos" ADD CONSTRAINT "atendimentos_clinicos_guiaMedicaId_fkey" FOREIGN KEY ("guiaMedicaId") REFERENCES "guias_medicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
