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
import { GuiaMedica, GuiaMedicaItem, StatusGuia, TipoGuia } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class GuiaMedicaItemInputDto {
  @IsString() procedimentoMedicoId: string;
  @IsInt() @Min(1) @IsOptional() quantidade?: number;
  @IsNumber() @Min(0) valorUnitario: number;
}

export class CreateGuiaMedicaDto {
  @IsString() @IsOptional() numero?: string;
  @IsString() beneficiarioId: string;
  @IsString() @IsOptional() contratoPlanoId?: string;
  @IsString() prestadorId: string;
  @IsEnum(TipoGuia) tipoGuia: TipoGuia;
  @IsDateString() @IsOptional() dataEmissao?: string;
  @IsDateString() @IsOptional() dataValidade?: string;
  @IsString() @IsOptional() medicoSolicitante?: string;
  @IsString() @IsOptional() observacoes?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuiaMedicaItemInputDto)
  itens: GuiaMedicaItemInputDto[];
}
export class UpdateGuiaMedicaDto {
  @IsEnum(StatusGuia) @IsOptional() status?: StatusGuia;
  @IsString() @IsOptional() medicoSolicitante?: string;
  @IsString() @IsOptional() observacoes?: string;
}

@Injectable()
export class GuiaMedicaService extends BaseCrudService<GuiaMedica, CreateGuiaMedicaDto, UpdateGuiaMedicaDto> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.guiaMedica, 'Guia médica', ['numero'], {
      beneficiario: true,
      prestador: true,
      contratoPlano: true,
      itens: { include: { procedimentoMedico: true } },
    });
  }

  async create(dto: CreateGuiaMedicaDto) {
    const total = await this.prisma.guiaMedica.count();
    const numero = dto.numero ?? `GM${String(total + 1).padStart(6, '0')}`;

    const guia = await this.prisma.guiaMedica.create({
      data: {
        numero,
        beneficiarioId: dto.beneficiarioId,
        contratoPlanoId: dto.contratoPlanoId,
        prestadorId: dto.prestadorId,
        tipoGuia: dto.tipoGuia,
        dataEmissao: dto.dataEmissao ? new Date(dto.dataEmissao) : new Date(),
        dataValidade: dto.dataValidade ? new Date(dto.dataValidade) : undefined,
        medicoSolicitante: dto.medicoSolicitante,
        observacoes: dto.observacoes,
        itens: {
          create: dto.itens.map((item) => ({
            procedimentoMedicoId: item.procedimentoMedicoId,
            quantidade: item.quantidade ?? 1,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorUnitario * (item.quantidade ?? 1),
          })),
        },
      },
    });

    return this.findOne(guia.id);
  }
}

@Injectable()
export class GuiaMedicaItemService extends BaseCrudService<GuiaMedicaItem> {
  constructor(prisma: PrismaService) {
    super(prisma.guiaMedicaItem, 'Item de guia médica');
  }
}

@ApiTags('Guias Médicas')
@UseGuards(JwtAuthGuard)
@Controller('guias-medicas')
export class GuiaMedicaController extends BaseCrudController<
  GuiaMedica,
  CreateGuiaMedicaDto,
  UpdateGuiaMedicaDto
> {
  constructor(service: GuiaMedicaService) {
    super(service);
  }
}

@ApiTags('Guias Médicas - Itens')
@UseGuards(JwtAuthGuard)
@Controller('guia-medica-itens')
export class GuiaMedicaItemController extends BaseCrudController<GuiaMedicaItem> {
  constructor(service: GuiaMedicaItemService) {
    super(service);
  }
}
