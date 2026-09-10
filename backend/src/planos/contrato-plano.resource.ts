import {
  BadRequestException,
  Controller,
  Injectable,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  ContratoPlano,
  ContratoPlanoBeneficiario,
  ContratoPlanoParcela,
  StatusContratoPlano,
  StatusParcela,
} from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreateContratoPlanoDto {
  @IsString() @IsOptional() numero?: string;
  @IsString() planoId: string;
  @IsString() titularId: string;
  @IsDateString() @IsOptional() dataAdesao?: string;
  @IsInt() @Min(1) @IsOptional() diaVencimento?: number;
  @IsNumber() @Min(0) @IsOptional() valorMensalidade?: number;
  @IsEnum(StatusContratoPlano) @IsOptional() status?: StatusContratoPlano;
  @IsString() @IsOptional() observacoes?: string;
}
export class UpdateContratoPlanoDto {
  @IsString() @IsOptional() planoId?: string;
  @IsString() @IsOptional() titularId?: string;
  @IsInt() @Min(1) @IsOptional() diaVencimento?: number;
  @IsNumber() @Min(0) @IsOptional() valorMensalidade?: number;
  @IsEnum(StatusContratoPlano) @IsOptional() status?: StatusContratoPlano;
  @IsString() @IsOptional() observacoes?: string;
}

export class CreateBeneficiarioDto {
  @IsString() contratoPlanoId: string;
  @IsString() pessoaId: string;
  @IsString() @IsOptional() parentesco?: string;
  @IsBoolean() @IsOptional() ativo?: boolean;
}
export class UpdateBeneficiarioDto {
  @IsString() @IsOptional() parentesco?: string;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

export class UpdateParcelaDto {
  @IsEnum(StatusParcela) @IsOptional() status?: StatusParcela;
  @IsDateString() @IsOptional() dataPagamento?: string;
  @IsString() @IsOptional() formaPagamento?: string;
}

@Injectable()
export class ContratoPlanoService extends BaseCrudService<
  ContratoPlano,
  CreateContratoPlanoDto,
  UpdateContratoPlanoDto
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.contratoPlano, 'Contrato de plano', ['numero'], {
      plano: true,
      titular: true,
      beneficiarios: { include: { pessoa: true } },
      parcelas: { orderBy: { numeroParcela: 'asc' } },
    });
  }

  async create(dto: CreateContratoPlanoDto) {
    const plano = await this.prisma.plano.findUniqueOrThrow({ where: { id: dto.planoId } });
    const total = await this.prisma.contratoPlano.count();
    const numero = dto.numero ?? `CP${String(total + 1).padStart(6, '0')}`;
    const dataAdesao = dto.dataAdesao ? new Date(dto.dataAdesao) : new Date();

    const contrato = await this.prisma.contratoPlano.create({
      data: {
        numero,
        planoId: dto.planoId,
        titularId: dto.titularId,
        dataAdesao,
        diaVencimento: dto.diaVencimento ?? 10,
        valorMensalidade: dto.valorMensalidade ?? plano.valorMensalidade,
        status: dto.status ?? StatusContratoPlano.ATIVO,
        observacoes: dto.observacoes,
      },
    });

    await this.gerarParcelas(contrato.id, 12);
    return this.findOne(contrato.id);
  }

  async gerarParcelas(contratoPlanoId: string, meses = 12) {
    const contrato = await this.prisma.contratoPlano.findUniqueOrThrow({
      where: { id: contratoPlanoId },
      include: { parcelas: true },
    });

    const jaGeradas = contrato.parcelas.length;
    const parcelas = Array.from({ length: meses }).map((_, i) => {
      const numeroParcela = jaGeradas + i + 1;
      const competencia = new Date(contrato.dataAdesao);
      competencia.setMonth(competencia.getMonth() + jaGeradas + i);
      const vencimento = new Date(
        competencia.getFullYear(),
        competencia.getMonth(),
        contrato.diaVencimento,
      );
      return {
        contratoPlanoId,
        numeroParcela,
        competencia,
        valor: contrato.valorMensalidade,
        vencimento,
        status: StatusParcela.PENDENTE,
      };
    });

    await this.prisma.contratoPlanoParcela.createMany({ data: parcelas });
    return this.prisma.contratoPlanoParcela.findMany({
      where: { contratoPlanoId },
      orderBy: { numeroParcela: 'asc' },
    });
  }
}

@Injectable()
export class BeneficiarioService extends BaseCrudService<
  ContratoPlanoBeneficiario,
  CreateBeneficiarioDto,
  UpdateBeneficiarioDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.contratoPlanoBeneficiario, 'Beneficiário', [], { pessoa: true });
  }
}

@Injectable()
export class ParcelaPlanoService extends BaseCrudService<
  ContratoPlanoParcela,
  never,
  UpdateParcelaDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.contratoPlanoParcela, 'Parcela');
  }

  create(): never {
    throw new BadRequestException(
      'Parcelas são geradas automaticamente pelo contrato (use /contratos-plano/:id/gerar-parcelas)',
    );
  }
}

@ApiTags('Planos - Contratos')
@UseGuards(JwtAuthGuard)
@Controller('contratos-plano')
export class ContratoPlanoController extends BaseCrudController<
  ContratoPlano,
  CreateContratoPlanoDto,
  UpdateContratoPlanoDto
> {
  constructor(private readonly contratoService: ContratoPlanoService) {
    super(contratoService);
  }

  @Post(':id/gerar-parcelas')
  gerarParcelas(@Param('id') id: string, @Query('meses') meses?: string) {
    return this.contratoService.gerarParcelas(id, meses ? Number(meses) : 12);
  }
}

@ApiTags('Planos - Beneficiários')
@UseGuards(JwtAuthGuard)
@Controller('contrato-plano-beneficiarios')
export class BeneficiarioController extends BaseCrudController<
  ContratoPlanoBeneficiario,
  CreateBeneficiarioDto,
  UpdateBeneficiarioDto
> {
  constructor(service: BeneficiarioService) {
    super(service);
  }
}

@ApiTags('Planos - Parcelas')
@UseGuards(JwtAuthGuard)
@Controller('contrato-plano-parcelas')
export class ParcelaPlanoController extends BaseCrudController<
  ContratoPlanoParcela,
  never,
  UpdateParcelaDto
> {
  constructor(service: ParcelaPlanoService) {
    super(service);
  }
}
