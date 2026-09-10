import {
  BadRequestException,
  Controller,
  Injectable,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  Locacao,
  LocacaoParcela,
  PapelUsuario,
  PeriodicidadeLocacao,
  StatusLocacao,
  StatusParcela,
  StatusUnidade,
  TipoLocacao,
} from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreateLocacaoDto {
  @IsString() @IsOptional() numero?: string;
  @IsEnum(TipoLocacao) tipo: TipoLocacao;
  @IsString() clienteId: string;
  @IsString() @IsOptional() jazigoId?: string;
  @IsString() @IsOptional() salaComercialId?: string;
  @IsString() @IsOptional() equipamentoOrtopedicoId?: string;
  @IsDateString() @IsOptional() dataInicio?: string;
  @IsDateString() @IsOptional() dataFim?: string;
  @IsNumber() @Min(0) valor: number;
  @IsEnum(PeriodicidadeLocacao) @IsOptional() periodicidade?: PeriodicidadeLocacao;
  @IsString() @IsOptional() observacoes?: string;
  @IsInt() @Min(1) @IsOptional() numeroParcelas?: number;
}
export class UpdateLocacaoDto {
  @IsDateString() @IsOptional() dataFim?: string;
  @IsNumber() @Min(0) @IsOptional() valor?: number;
  @IsString() @IsOptional() observacoes?: string;
}
export class UpdateLocacaoParcelaDto {
  @IsEnum(StatusParcela) @IsOptional() status?: StatusParcela;
  @IsDateString() @IsOptional() dataPagamento?: string;
  @IsString() @IsOptional() formaPagamento?: string;
}

const UNIDADE_FIELD: Record<string, 'jazigo' | 'salaComercial' | 'equipamentoOrtopedico'> = {
  JAZIGO: 'jazigo',
  SALA_COMERCIAL: 'salaComercial',
  ORTOPEDICO: 'equipamentoOrtopedico',
};

@Injectable()
export class LocacaoService extends BaseCrudService<Locacao, CreateLocacaoDto, UpdateLocacaoDto> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.locacao, 'Locação', ['numero'], {
      cliente: true,
      jazigo: true,
      salaComercial: true,
      equipamentoOrtopedico: true,
      parcelas: { orderBy: { numeroParcela: 'asc' } },
    });
  }

  async create(dto: CreateLocacaoDto) {
    const unidadeField = UNIDADE_FIELD[dto.tipo];
    const unidadeId = (dto as any)[`${unidadeField}Id`];
    if (!unidadeId) {
      throw new BadRequestException(`Informe o campo ${unidadeField}Id para locações do tipo ${dto.tipo}`);
    }

    const total = await this.prisma.locacao.count();
    const numero = dto.numero ?? `L${String(total + 1).padStart(6, '0')}`;

    const locacao = await this.prisma.locacao.create({
      data: {
        numero,
        tipo: dto.tipo,
        clienteId: dto.clienteId,
        jazigoId: dto.jazigoId,
        salaComercialId: dto.salaComercialId,
        equipamentoOrtopedicoId: dto.equipamentoOrtopedicoId,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : new Date(),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
        valor: dto.valor,
        periodicidade: dto.periodicidade ?? PeriodicidadeLocacao.MENSAL,
        observacoes: dto.observacoes,
        status: StatusLocacao.ATIVA,
      },
    });

    await (this.prisma as any)[unidadeField].update({
      where: { id: unidadeId },
      data: { status: StatusUnidade.LOCADO },
    });

    const numeroParcelas = dto.numeroParcelas ?? 1;
    const hoje = new Date();
    const parcelas = Array.from({ length: numeroParcelas }).map((_, i) => ({
      locacaoId: locacao.id,
      numeroParcela: i + 1,
      valor: dto.valor,
      vencimento: new Date(hoje.getFullYear(), hoje.getMonth() + i, hoje.getDate()),
      status: StatusParcela.PENDENTE,
    }));
    await this.prisma.locacaoParcela.createMany({ data: parcelas });

    return this.findOne(locacao.id);
  }

  async encerrar(id: string, cancelar = false) {
    const locacao = await this.prisma.locacao.findUnique({ where: { id } });
    if (!locacao) throw new BadRequestException('Locação não encontrada');

    const unidadeField = UNIDADE_FIELD[locacao.tipo];
    const unidadeId = (locacao as any)[`${unidadeField}Id`];
    if (unidadeId) {
      await (this.prisma as any)[unidadeField].update({
        where: { id: unidadeId },
        data: { status: StatusUnidade.DISPONIVEL },
      });
    }

    await this.prisma.locacao.update({
      where: { id },
      data: {
        status: cancelar ? StatusLocacao.CANCELADA : StatusLocacao.ENCERRADA,
        dataFim: new Date(),
      },
    });
    return this.findOne(id);
  }
}

@Injectable()
export class LocacaoParcelaService extends BaseCrudService<LocacaoParcela, never, UpdateLocacaoParcelaDto> {
  constructor(prisma: PrismaService) {
    super(prisma.locacaoParcela, 'Parcela de locação');
  }

  create(): never {
    throw new BadRequestException('Parcelas são geradas automaticamente pela locação');
  }
}

@ApiTags('Locações')
@UseGuards(JwtAuthGuard)
@Controller('locacoes')
export class LocacaoController extends BaseCrudController<Locacao, CreateLocacaoDto, UpdateLocacaoDto> {
  constructor(private readonly locacaoService: LocacaoService) {
    super(locacaoService, [PapelUsuario.GERENTE, PapelUsuario.VENDEDOR]);
  }

  @Post(':id/encerrar')
  @Roles(PapelUsuario.GERENTE, PapelUsuario.VENDEDOR)
  encerrar(@Param('id') id: string) {
    return this.locacaoService.encerrar(id, false);
  }

  @Post(':id/cancelar')
  @Roles(PapelUsuario.GERENTE, PapelUsuario.VENDEDOR)
  cancelar(@Param('id') id: string) {
    return this.locacaoService.encerrar(id, true);
  }
}

@ApiTags('Locações - Parcelas')
@UseGuards(JwtAuthGuard)
@Controller('locacao-parcelas')
export class LocacaoParcelaController extends BaseCrudController<LocacaoParcela, never, UpdateLocacaoParcelaDto> {
  constructor(service: LocacaoParcelaService) {
    super(service, [PapelUsuario.GERENTE, PapelUsuario.FINANCEIRO]);
  }
}
