import { Controller, Injectable, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Prestador, ProcedimentoMedico, TipoPrestador, TipoProcedimentoMedico } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreatePrestadorDto {
  @IsString() nome: string;
  @IsString() @IsOptional() cpfCnpj?: string;
  @IsEnum(TipoPrestador) tipo: TipoPrestador;
  @IsString() @IsOptional() especialidade?: string;
  @IsString() @IsOptional() telefone?: string;
  @IsString() @IsOptional() email?: string;
  @IsBoolean() @IsOptional() ativo?: boolean;
}
export class UpdatePrestadorDto {
  @IsString() @IsOptional() nome?: string;
  @IsString() @IsOptional() cpfCnpj?: string;
  @IsEnum(TipoPrestador) @IsOptional() tipo?: TipoPrestador;
  @IsString() @IsOptional() especialidade?: string;
  @IsString() @IsOptional() telefone?: string;
  @IsString() @IsOptional() email?: string;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

export class CreateProcedimentoMedicoDto {
  @IsString() @IsOptional() codigo?: string;
  @IsString() nome: string;
  @IsEnum(TipoProcedimentoMedico) tipo: TipoProcedimentoMedico;
  @IsNumber() @Min(0) valor: number;
  @IsBoolean() @IsOptional() ativo?: boolean;
}
export class UpdateProcedimentoMedicoDto {
  @IsString() @IsOptional() codigo?: string;
  @IsString() @IsOptional() nome?: string;
  @IsEnum(TipoProcedimentoMedico) @IsOptional() tipo?: TipoProcedimentoMedico;
  @IsNumber() @Min(0) @IsOptional() valor?: number;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

@Injectable()
export class PrestadorService extends BaseCrudService<Prestador, CreatePrestadorDto, UpdatePrestadorDto> {
  constructor(prisma: PrismaService) {
    super(prisma.prestador, 'Prestador', ['nome', 'cpfCnpj']);
  }
}

@Injectable()
export class ProcedimentoMedicoService extends BaseCrudService<
  ProcedimentoMedico,
  CreateProcedimentoMedicoDto,
  UpdateProcedimentoMedicoDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.procedimentoMedico, 'Procedimento médico', ['nome', 'codigo']);
  }
}

@ApiTags('Guias Médicas - Prestadores')
@UseGuards(JwtAuthGuard)
@Controller('prestadores')
export class PrestadorController extends BaseCrudController<Prestador, CreatePrestadorDto, UpdatePrestadorDto> {
  constructor(service: PrestadorService) {
    super(service);
  }
}

@ApiTags('Guias Médicas - Procedimentos')
@UseGuards(JwtAuthGuard)
@Controller('procedimentos-medicos')
export class ProcedimentoMedicoController extends BaseCrudController<
  ProcedimentoMedico,
  CreateProcedimentoMedicoDto,
  UpdateProcedimentoMedicoDto
> {
  constructor(service: ProcedimentoMedicoService) {
    super(service);
  }
}
