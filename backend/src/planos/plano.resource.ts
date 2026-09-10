import { Controller, Injectable, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Plano, PlanoCobertura, TipoCobrancaPlano } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreatePlanoDto {
  @IsString() nome: string;
  @IsString() @IsOptional() descricao?: string;
  @IsEnum(TipoCobrancaPlano) @IsOptional() tipoCobranca?: TipoCobrancaPlano;
  @IsNumber() @Min(0) valorMensalidade: number;
  @IsInt() @Min(0) @IsOptional() carenciaDias?: number;
  @IsBoolean() @IsOptional() ativo?: boolean;
}
export class UpdatePlanoDto {
  @IsString() @IsOptional() nome?: string;
  @IsString() @IsOptional() descricao?: string;
  @IsEnum(TipoCobrancaPlano) @IsOptional() tipoCobranca?: TipoCobrancaPlano;
  @IsNumber() @Min(0) @IsOptional() valorMensalidade?: number;
  @IsInt() @Min(0) @IsOptional() carenciaDias?: number;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

export class CreatePlanoCoberturaDto {
  @IsString() planoId: string;
  @IsString() descricao: string;
  @IsNumber() @Min(0) @IsOptional() limiteValor?: number;
  @IsInt() @Min(0) @IsOptional() limiteQtd?: number;
}
export class UpdatePlanoCoberturaDto {
  @IsString() @IsOptional() descricao?: string;
  @IsNumber() @Min(0) @IsOptional() limiteValor?: number;
  @IsInt() @Min(0) @IsOptional() limiteQtd?: number;
}

@Injectable()
export class PlanoService extends BaseCrudService<Plano, CreatePlanoDto, UpdatePlanoDto> {
  constructor(prisma: PrismaService) {
    super(prisma.plano, 'Plano', ['nome'], { coberturas: true });
  }
}

@Injectable()
export class PlanoCoberturaService extends BaseCrudService<
  PlanoCobertura,
  CreatePlanoCoberturaDto,
  UpdatePlanoCoberturaDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.planoCobertura, 'Cobertura do plano', ['descricao']);
  }
}

@ApiTags('Planos')
@UseGuards(JwtAuthGuard)
@Controller('planos')
export class PlanoController extends BaseCrudController<Plano, CreatePlanoDto, UpdatePlanoDto> {
  constructor(service: PlanoService) {
    super(service);
  }
}

@ApiTags('Planos - Coberturas')
@UseGuards(JwtAuthGuard)
@Controller('plano-coberturas')
export class PlanoCoberturaController extends BaseCrudController<
  PlanoCobertura,
  CreatePlanoCoberturaDto,
  UpdatePlanoCoberturaDto
> {
  constructor(service: PlanoCoberturaService) {
    super(service);
  }
}
