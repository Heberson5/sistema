import { Controller, Injectable, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EquipamentoOrtopedico, SalaComercial, StatusUnidade } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreateSalaComercialDto {
  @IsString() nome: string;
  @IsString() @IsOptional() descricao?: string;
  @IsNumber() @Min(0) @IsOptional() areaM2?: number;
  @IsNumber() @Min(0) valorMensal: number;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
}
export class UpdateSalaComercialDto {
  @IsString() @IsOptional() nome?: string;
  @IsString() @IsOptional() descricao?: string;
  @IsNumber() @Min(0) @IsOptional() areaM2?: number;
  @IsNumber() @Min(0) @IsOptional() valorMensal?: number;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
}

export class CreateEquipamentoOrtopedicoDto {
  @IsString() tipo: string;
  @IsString() @IsOptional() codigoPatrimonio?: string;
  @IsString() @IsOptional() descricao?: string;
  @IsNumber() @Min(0) valorDiaria: number;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
}
export class UpdateEquipamentoOrtopedicoDto {
  @IsString() @IsOptional() tipo?: string;
  @IsString() @IsOptional() codigoPatrimonio?: string;
  @IsString() @IsOptional() descricao?: string;
  @IsNumber() @Min(0) @IsOptional() valorDiaria?: number;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
}

@Injectable()
export class SalaComercialService extends BaseCrudService<
  SalaComercial,
  CreateSalaComercialDto,
  UpdateSalaComercialDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.salaComercial, 'Sala comercial', ['nome']);
  }
}

@Injectable()
export class EquipamentoOrtopedicoService extends BaseCrudService<
  EquipamentoOrtopedico,
  CreateEquipamentoOrtopedicoDto,
  UpdateEquipamentoOrtopedicoDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.equipamentoOrtopedico, 'Equipamento ortopédico', ['tipo', 'codigoPatrimonio']);
  }
}

@ApiTags('Locações - Salas Comerciais')
@UseGuards(JwtAuthGuard)
@Controller('salas-comerciais')
export class SalaComercialController extends BaseCrudController<
  SalaComercial,
  CreateSalaComercialDto,
  UpdateSalaComercialDto
> {
  constructor(service: SalaComercialService) {
    super(service);
  }
}

@ApiTags('Locações - Equipamentos Ortopédicos')
@UseGuards(JwtAuthGuard)
@Controller('equipamentos-ortopedicos')
export class EquipamentoOrtopedicoController extends BaseCrudController<
  EquipamentoOrtopedico,
  CreateEquipamentoOrtopedicoDto,
  UpdateEquipamentoOrtopedicoDto
> {
  constructor(service: EquipamentoOrtopedicoService) {
    super(service);
  }
}
