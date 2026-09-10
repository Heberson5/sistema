import { Controller, Injectable, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { AtendimentoClinico, StatusAtendimentoClinico, TipoGuia } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreateAtendimentoClinicoDto {
  @IsString() @IsOptional() numero?: string;
  @IsString() beneficiarioId: string;
  @IsString() prestadorId: string;
  @IsString() @IsOptional() guiaMedicaId?: string;
  @IsEnum(TipoGuia) tipoAtendimento: TipoGuia;
  @IsDateString() dataAgendada: string;
  @IsString() @IsOptional() observacoes?: string;
}

export class UpdateAtendimentoClinicoDto {
  @IsString() @IsOptional() prestadorId?: string;
  @IsString() @IsOptional() guiaMedicaId?: string;
  @IsDateString() @IsOptional() dataAgendada?: string;
  @IsEnum(StatusAtendimentoClinico) @IsOptional() status?: StatusAtendimentoClinico;
  @IsString() @IsOptional() observacoes?: string;
}

@Injectable()
export class AtendimentoClinicoService extends BaseCrudService<
  AtendimentoClinico,
  CreateAtendimentoClinicoDto,
  UpdateAtendimentoClinicoDto
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.atendimentoClinico, 'Atendimento clínico', ['numero'], {
      beneficiario: true,
      prestador: true,
      guiaMedica: true,
    });
  }

  async create(dto: CreateAtendimentoClinicoDto) {
    const total = await this.prisma.atendimentoClinico.count();
    const numero = dto.numero ?? `AC${String(total + 1).padStart(6, '0')}`;

    const atendimento = await this.prisma.atendimentoClinico.create({
      data: {
        numero,
        beneficiarioId: dto.beneficiarioId,
        prestadorId: dto.prestadorId,
        guiaMedicaId: dto.guiaMedicaId,
        tipoAtendimento: dto.tipoAtendimento,
        dataAgendada: new Date(dto.dataAgendada),
        observacoes: dto.observacoes,
      },
    });

    return this.findOne(atendimento.id);
  }

  async concluir(id: string) {
    await this.findOne(id);
    await this.prisma.atendimentoClinico.update({
      where: { id },
      data: { status: StatusAtendimentoClinico.REALIZADO, dataRealizada: new Date() },
    });
    return this.findOne(id);
  }

  async cancelar(id: string) {
    await this.findOne(id);
    await this.prisma.atendimentoClinico.update({
      where: { id },
      data: { status: StatusAtendimentoClinico.CANCELADO },
    });
    return this.findOne(id);
  }
}

@ApiTags('Atendimento Clínico')
@UseGuards(JwtAuthGuard)
@Controller('atendimentos-clinicos')
export class AtendimentoClinicoController extends BaseCrudController<
  AtendimentoClinico,
  CreateAtendimentoClinicoDto,
  UpdateAtendimentoClinicoDto
> {
  constructor(private readonly atendimentoClinicoService: AtendimentoClinicoService) {
    super(atendimentoClinicoService);
  }

  @Post(':id/concluir')
  concluir(@Param('id') id: string) {
    return this.atendimentoClinicoService.concluir(id);
  }

  @Post(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.atendimentoClinicoService.cancelar(id);
  }
}
