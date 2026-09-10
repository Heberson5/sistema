import { Controller, Injectable, UseGuards } from '@nestjs/common';
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
import { Atendimento, AtendimentoItem, PapelUsuario, StatusAtendimento, TipoAtendimento } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class AtendimentoItemInputDto {
  @IsString() descricao: string;
  @IsString() @IsOptional() produtoId?: string;
  @IsString() @IsOptional() servicoId?: string;
  @IsInt() @Min(1) @IsOptional() quantidade?: number;
  @IsNumber() @Min(0) valorUnitario: number;
}

export class CreateAtendimentoDto {
  @IsString() @IsOptional() numero?: string;
  @IsString() @IsOptional() obitoId?: string;
  @IsString() clienteResponsavelId: string;
  @IsEnum(TipoAtendimento) @IsOptional() tipoAtendimento?: TipoAtendimento;
  @IsDateString() @IsOptional() dataAtendimento?: string;
  @IsString() @IsOptional() atendenteId?: string;
  @IsString() @IsOptional() observacoes?: string;
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AtendimentoItemInputDto)
  itens?: AtendimentoItemInputDto[];
}
export class UpdateAtendimentoDto {
  @IsEnum(StatusAtendimento) @IsOptional() status?: StatusAtendimento;
  @IsEnum(TipoAtendimento) @IsOptional() tipoAtendimento?: TipoAtendimento;
  @IsString() @IsOptional() observacoes?: string;
}

export class CreateAtendimentoItemDto {
  @IsString() atendimentoId: string;
  @IsString() descricao: string;
  @IsString() @IsOptional() produtoId?: string;
  @IsString() @IsOptional() servicoId?: string;
  @IsInt() @Min(1) @IsOptional() quantidade?: number;
  @IsNumber() @Min(0) valorUnitario: number;
}
export class UpdateAtendimentoItemDto {
  @IsString() @IsOptional() descricao?: string;
  @IsInt() @Min(1) @IsOptional() quantidade?: number;
  @IsNumber() @Min(0) @IsOptional() valorUnitario?: number;
}

@Injectable()
export class AtendimentoService extends BaseCrudService<
  Atendimento,
  CreateAtendimentoDto,
  UpdateAtendimentoDto
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.atendimento, 'Atendimento', ['numero'], {
      obito: true,
      clienteResponsavel: true,
      atendente: true,
      itens: true,
    });
  }

  async create(dto: CreateAtendimentoDto) {
    const total = await this.prisma.atendimento.count();
    const numero = dto.numero ?? `AT${String(total + 1).padStart(6, '0')}`;

    const atendimento = await this.prisma.atendimento.create({
      data: {
        numero,
        obitoId: dto.obitoId,
        clienteResponsavelId: dto.clienteResponsavelId,
        tipoAtendimento: dto.tipoAtendimento ?? TipoAtendimento.VELORIO_SEPULTAMENTO,
        dataAtendimento: dto.dataAtendimento ? new Date(dto.dataAtendimento) : new Date(),
        atendenteId: dto.atendenteId,
        observacoes: dto.observacoes,
        itens: dto.itens?.length
          ? {
              create: dto.itens.map((item) => ({
                descricao: item.descricao,
                produtoId: item.produtoId,
                servicoId: item.servicoId,
                quantidade: item.quantidade ?? 1,
                valorUnitario: item.valorUnitario,
                valorTotal: item.valorUnitario * (item.quantidade ?? 1),
              })),
            }
          : undefined,
      },
    });

    return this.findOne(atendimento.id);
  }
}

@Injectable()
export class AtendimentoItemService extends BaseCrudService<
  AtendimentoItem,
  CreateAtendimentoItemDto,
  UpdateAtendimentoItemDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.atendimentoItem, 'Item de atendimento');
  }

  async create(dto: CreateAtendimentoItemDto) {
    return this.delegate.create({
      data: {
        ...dto,
        quantidade: dto.quantidade ?? 1,
        valorTotal: dto.valorUnitario * (dto.quantidade ?? 1),
      },
    });
  }

  async update(id: string, dto: UpdateAtendimentoItemDto) {
    const existente = await this.findOne(id);
    const quantidade = dto.quantidade ?? existente.quantidade;
    const valorUnitario = dto.valorUnitario ?? Number(existente.valorUnitario);
    return this.delegate.update({
      where: { id },
      data: { ...dto, valorTotal: quantidade * valorUnitario },
    });
  }
}

@ApiTags('Atendimentos')
@UseGuards(JwtAuthGuard)
@Controller('atendimentos')
export class AtendimentoController extends BaseCrudController<
  Atendimento,
  CreateAtendimentoDto,
  UpdateAtendimentoDto
> {
  constructor(service: AtendimentoService) {
    super(service, [PapelUsuario.GERENTE, PapelUsuario.ATENDENTE]);
  }
}

@ApiTags('Atendimentos - Itens')
@UseGuards(JwtAuthGuard)
@Controller('atendimento-itens')
export class AtendimentoItemController extends BaseCrudController<
  AtendimentoItem,
  CreateAtendimentoItemDto,
  UpdateAtendimentoItemDto
> {
  constructor(service: AtendimentoItemService) {
    super(service, [PapelUsuario.GERENTE, PapelUsuario.ATENDENTE]);
  }
}
