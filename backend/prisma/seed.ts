import {
  PapelUsuario,
  PrismaClient,
  StatusUnidade,
  TipoCobrancaPlano,
  TipoPessoa,
  TipoPrestador,
  TipoProcedimentoMedico,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // ---- Usuário admin ----
  const senhaHash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@funeraria.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@funeraria.com',
      senhaHash,
      papel: PapelUsuario.ADMIN,
    },
  });

  const vendedor = await prisma.usuario.upsert({
    where: { email: 'vendedor@funeraria.com' },
    update: {},
    create: {
      nome: 'Vendedor Exemplo',
      email: 'vendedor@funeraria.com',
      senhaHash: await bcrypt.hash('venda123', 10),
      papel: PapelUsuario.VENDEDOR,
    },
  });

  // ---- Pessoas ----
  const cliente = await prisma.pessoa.upsert({
    where: { cpfCnpj: '11111111111' },
    update: {},
    create: {
      tipo: TipoPessoa.FISICA,
      nome: 'Maria da Silva',
      cpfCnpj: '11111111111',
      email: 'maria.silva@example.com',
      telefone: '(11) 3333-4444',
      celular: '(11) 99999-1111',
      cidade: 'São Paulo',
      uf: 'SP',
    },
  });

  const beneficiario = await prisma.pessoa.upsert({
    where: { cpfCnpj: '22222222222' },
    update: {},
    create: {
      tipo: TipoPessoa.FISICA,
      nome: 'João da Silva',
      cpfCnpj: '22222222222',
      email: 'joao.silva@example.com',
      cidade: 'São Paulo',
      uf: 'SP',
    },
  });

  // ---- Cemitério e estrutura ----
  const cemiterio = await prisma.cemiterio.create({
    data: {
      nome: 'Cemitério Jardim da Paz',
      cidade: 'São Paulo',
      uf: 'SP',
    },
  });

  const quadra = await prisma.quadra.create({
    data: { cemiterioId: cemiterio.id, codigo: 'Q01', descricao: 'Quadra 01' },
  });

  const alameda = await prisma.alameda.create({
    data: { quadraId: quadra.id, codigo: 'A01', descricao: 'Alameda 01' },
  });

  const tipoJazigo = await prisma.tipoJazigo.create({
    data: { nome: 'Jazigo Simples', capacidadeGavetas: 2, valorBase: 8000 },
  });

  await prisma.jazigo.createMany({
    data: [
      { alamedaId: alameda.id, tipoJazigoId: tipoJazigo.id, numero: '001', valor: 8500, status: StatusUnidade.DISPONIVEL },
      { alamedaId: alameda.id, tipoJazigoId: tipoJazigo.id, numero: '002', valor: 8500, status: StatusUnidade.DISPONIVEL },
      { alamedaId: alameda.id, tipoJazigoId: tipoJazigo.id, numero: '003', valor: 9000, status: StatusUnidade.DISPONIVEL },
    ],
  });

  const ala = await prisma.ala.create({
    data: { cemiterioId: cemiterio.id, codigo: 'AL01', descricao: 'Ala Columbário 01' },
  });
  const tipoColumbario = await prisma.tipoColumbario.create({
    data: { nome: 'Columbário Padrão', capacidadeUrnas: 2, valorBase: 3500 },
  });
  await prisma.columbario.createMany({
    data: [
      { alaId: ala.id, tipoColumbarioId: tipoColumbario.id, numero: '001', valor: 3800 },
      { alaId: ala.id, tipoColumbarioId: tipoColumbario.id, numero: '002', valor: 3800 },
    ],
  });

  const bloco = await prisma.bloco.create({
    data: { cemiterioId: cemiterio.id, codigo: 'B01', descricao: 'Bloco Ossuário 01' },
  });
  await prisma.ossuario.createMany({
    data: [
      { blocoId: bloco.id, numero: '001', valor: 1500 },
      { blocoId: bloco.id, numero: '002', valor: 1500 },
    ],
  });

  // ---- Produtos e Serviços ----
  await prisma.produto.createMany({
    data: [
      { nome: 'Urna Standard', categoria: 'Urnas', valor: 1200, estoque: 20 },
      { nome: 'Urna Especial', categoria: 'Urnas', valor: 2800, estoque: 10 },
      { nome: 'Coroa de Flores', categoria: 'Ornamentação', valor: 250, estoque: 50 },
    ],
  });
  await prisma.servico.createMany({
    data: [
      { nome: 'Velório Completo', categoria: 'Cerimônia', valor: 1800 },
      { nome: 'Translado Municipal', categoria: 'Transporte', valor: 400 },
      { nome: 'Cremação', categoria: 'Cremação', valor: 3200 },
    ],
  });

  // ---- Planos ----
  const plano = await prisma.plano.create({
    data: {
      nome: 'Plano Família Completo',
      descricao: 'Cobertura funerária para até 4 dependentes',
      tipoCobranca: TipoCobrancaPlano.MENSAL,
      valorMensalidade: 49.9,
      carenciaDias: 30,
      coberturas: {
        create: [
          { descricao: 'Urna padrão inclusa', limiteQtd: 1 },
          { descricao: 'Translado até 100km', limiteValor: 500 },
        ],
      },
    },
  });

  const contrato = await prisma.contratoPlano.create({
    data: {
      numero: 'CP000001',
      planoId: plano.id,
      titularId: cliente.id,
      valorMensalidade: plano.valorMensalidade,
      diaVencimento: 10,
    },
  });
  await prisma.contratoPlanoBeneficiario.create({
    data: { contratoPlanoId: contrato.id, pessoaId: beneficiario.id, parentesco: 'Filho' },
  });

  // ---- Salas comerciais e equipamentos ----
  await prisma.salaComercial.createMany({
    data: [
      { nome: 'Sala Comercial 101', areaM2: 25, valorMensal: 1500 },
      { nome: 'Sala Comercial 102', areaM2: 30, valorMensal: 1800 },
    ],
  });
  await prisma.equipamentoOrtopedico.createMany({
    data: [
      { tipo: 'Cadeira de rodas', codigoPatrimonio: 'ORT-001', valorDiaria: 15 },
      { tipo: 'Cama hospitalar', codigoPatrimonio: 'ORT-002', valorDiaria: 40 },
      { tipo: 'Muletas (par)', codigoPatrimonio: 'ORT-003', valorDiaria: 8 },
    ],
  });

  // ---- Prestadores e procedimentos médicos ----
  const laboratorio = await prisma.prestador.create({
    data: { nome: 'Laboratório Vida Clínica', tipo: TipoPrestador.LABORATORIO, cpfCnpj: '12345678000199' },
  });
  await prisma.prestador.create({
    data: { nome: 'Clínica Bem Estar', tipo: TipoPrestador.CLINICA, cpfCnpj: '98765432000188' },
  });
  await prisma.procedimentoMedico.createMany({
    data: [
      { codigo: 'EX001', nome: 'Hemograma Completo', tipo: TipoProcedimentoMedico.EXAME_LABORATORIAL, valor: 45 },
      { codigo: 'EX002', nome: 'Glicemia em Jejum', tipo: TipoProcedimentoMedico.EXAME_LABORATORIAL, valor: 25 },
      { codigo: 'CL001', nome: 'Consulta Clínico Geral', tipo: TipoProcedimentoMedico.CONSULTA, valor: 120 },
    ],
  });

  console.log('Seed concluído com sucesso.');
  console.log('Login admin: admin@funeraria.com / admin123');
  console.log('Login vendedor: vendedor@funeraria.com / venda123');
  console.log('vendedorId de exemplo:', vendedor.id);
  console.log('laboratorioId de exemplo:', laboratorio.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
