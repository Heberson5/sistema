import {
  BadRequestException,
  Body,
  Controller,
  Injectable,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { StatusParcela, StatusUnidade, StatusVenda, TipoVenda, Venda, VendaParcela } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class VendaItemInputDto {
  @IsString() descricao: string;
  @IsString() @IsOptional() jazigoId?: string;
  @IsString() @IsOptional() columbarioId?: string;
  @IsString() @IsOptional() ossuarioId?: string;
  @IsString() @IsOptional() produtoId?: string;
  @IsString() @IsOptional() servicoId?: string;
  @IsInt() @Min(1) @IsOptional() quantidade?: number;
  @IsNumber() @Min(0) valorUnitario: number;
}

export class CreateVendaDto {
  @IsString() @IsOptional() numero?: string;
  @IsEnum(TipoVenda) tipo: TipoVenda;
  @IsString() clienteId: string;
  @IsString() @IsOptional() vendedorId?: string;
  @IsDateString() @IsOptional() dataVenda?: string;
  @IsString() @IsOptional() formaPagamento?: string;
  @IsString() @IsOptional() observacoes?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendaItemInputDto)
  itens: VendaItemInputDto[];
  @IsInt() @Min(1) @IsOptional() numeroParcelas?: number;
}

export class UpdateVendaDto {
  @IsString() @IsOptional() formaPagamento?: string;
  @IsString() @IsOptional() observacoes?: string;
}

export class UpdateVendaParcelaDto {
  @IsEnum(StatusParcela) @IsOptional() status?: StatusParcela;
  @IsDateString() @IsOptional() dataPagamento?: string;
  @IsString() @IsOptional() formaPagamento?: string;
}

const UNIDADE_FIELD: Record<string, 'jazigo' | 'columbario' | 'ossuario' | null> = {
  JAZIGO: 'jazigo',
  COLUMBARIO: 'columbario',
  OSSUARIO: 'ossuario',
  PRODUTO: null,
  SERVICO: null,
  PLANO: null,
};

@Injectable()
export class VendaService extends BaseCrudService<Venda, CreateVendaDto, UpdateVendaDto> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.venda, 'Venda', ['numero'], {
      cliente: true,
      vendedor: true,
      itens: true,
      parcelas: { orderBy: { numeroParcela: 'asc' } },
    });
  }

  async create(dto: CreateVendaDto) {
    if (!dto.itens?.length) {
      throw new BadRequestException('A venda precisa ter ao menos um item');
    }

    const total = await this.prisma.venda.count();
    const numero = dto.numero ?? `V${String(total + 1).padStart(6, '0')}`;
    const valorTotal = dto.itens.reduce(
      (acc, item) => acc + item.valorUnitario * (item.quantidade ?? 1),
      0,
    );

    const venda = await this.prisma.venda.create({
      data: {
        numero,
        tipo: dto.tipo,
        clienteId: dto.clienteId,
        vendedorId: dto.vendedorId,
        dataVenda: dto.dataVenda ? new Date(dto.dataVenda) : new Date(),
        formaPagamento: dto.formaPagamento,
        observacoes: dto.observacoes,
        valorTotal,
        status: StatusVenda.ORCAMENTO,
        itens: {
          create: dto.itens.map((item) => ({
            descricao: item.descricao,
            jazigoId: item.jazigoId,
            columbarioId: item.columbarioId,
            ossuarioId: item.ossuarioId,
            produtoId: item.produtoId,
            servicoId: item.servicoId,
            quantidade: item.quantidade ?? 1,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorUnitario * (item.quantidade ?? 1),
          })),
        },
      },
    });

    await this.gerarParcelas(venda.id, dto.numeroParcelas ?? 1);
    return this.findOne(venda.id);
  }

  async gerarParcelas(vendaId: string, numeroParcelas: number) {
    const venda = await this.prisma.venda.findUniqueOrThrow({ where: { id: vendaId } });
    const valorParcela = Number(venda.valorTotal) / numeroParcelas;
    const hoje = new Date();

    const parcelas = Array.from({ length: numeroParcelas }).map((_, i) => {
      const vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + i, hoje.getDate());
      return {
        vendaId,
        numeroParcela: i + 1,
        valor: valorParcela,
        vencimento,
        status: StatusParcela.PENDENTE,
      };
    });

    await this.prisma.vendaParcela.createMany({ data: parcelas });
  }

  async confirmar(id: string) {
    const venda = await this.prisma.venda.findUnique({ where: { id }, include: { itens: true } });
    if (!venda) throw new BadRequestException('Venda não encontrada');
    if (venda.status !== StatusVenda.ORCAMENTO) {
      throw new BadRequestException('Apenas orçamentos podem ser confirmados');
    }

    const unidadeField = UNIDADE_FIELD[venda.tipo];
    if (unidadeField) {
      for (const item of venda.itens) {
        const unidadeId = (item as any)[`${unidadeField}Id`];
        if (unidadeId) {
          await (this.prisma as any)[unidadeField].update({
            where: { id: unidadeId },
            data: { status: StatusUnidade.VENDIDO },
          });
        }
      }
    }

    await this.prisma.venda.update({ where: { id }, data: { status: StatusVenda.CONFIRMADA } });
    return this.findOne(id);
  }

  async cancelar(id: string) {
    const venda = await this.prisma.venda.findUnique({ where: { id }, include: { itens: true } });
    if (!venda) throw new BadRequestException('Venda não encontrada');

    const unidadeField = UNIDADE_FIELD[venda.tipo];
    if (unidadeField && venda.status === StatusVenda.CONFIRMADA) {
      for (const item of venda.itens) {
        const unidadeId = (item as any)[`${unidadeField}Id`];
        if (unidadeId) {
          await (this.prisma as any)[unidadeField].update({
            where: { id: unidadeId },
            data: { status: StatusUnidade.DISPONIVEL },
          });
        }
      }
    }

    await this.prisma.venda.update({ where: { id }, data: { status: StatusVenda.CANCELADA } });
    return this.findOne(id);
  }
}

@Injectable()
export class VendaParcelaService extends BaseCrudService<VendaParcela, never, UpdateVendaParcelaDto> {
  constructor(prisma: PrismaService) {
    super(prisma.vendaParcela, 'Parcela de venda');
  }

  create(): never {
    throw new BadRequestException('Parcelas são geradas automaticamente pela venda');
  }
}

@ApiTags('Vendas')
@UseGuards(JwtAuthGuard)
@Controller('vendas')
export class VendaController extends BaseCrudController<Venda, CreateVendaDto, UpdateVendaDto> {
  constructor(private readonly vendaService: VendaService) {
    super(vendaService);
  }

  @Post(':id/confirmar')
  confirmar(@Param('id') id: string) {
    return this.vendaService.confirmar(id);
  }

  @Post(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.vendaService.cancelar(id);
  }
}

@ApiTags('Vendas - Parcelas')
@UseGuards(JwtAuthGuard)
@Controller('venda-parcelas')
export class VendaParcelaController extends BaseCrudController<VendaParcela, never, UpdateVendaParcelaDto> {
  constructor(service: VendaParcelaService) {
    super(service);
  }
}
