import { Controller, Injectable, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  Columbario,
  Jazigo,
  Ossuario,
  StatusUnidade,
  TipoColumbario,
  TipoJazigo,
} from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

// ---- Tipos (cadastros de apoio) ----

export class CreateTipoJazigoDto {
  @IsString() nome: string;
  @IsInt() @Min(1) @IsOptional() capacidadeGavetas?: number;
  @IsNumber() @Min(0) valorBase: number;
}
export class UpdateTipoJazigoDto {
  @IsString() @IsOptional() nome?: string;
  @IsInt() @Min(1) @IsOptional() capacidadeGavetas?: number;
  @IsNumber() @Min(0) @IsOptional() valorBase?: number;
}

export class CreateTipoColumbarioDto {
  @IsString() nome: string;
  @IsInt() @Min(1) @IsOptional() capacidadeUrnas?: number;
  @IsNumber() @Min(0) valorBase: number;
}
export class UpdateTipoColumbarioDto {
  @IsString() @IsOptional() nome?: string;
  @IsInt() @Min(1) @IsOptional() capacidadeUrnas?: number;
  @IsNumber() @Min(0) @IsOptional() valorBase?: number;
}

// ---- Jazigo ----

export class CreateJazigoDto {
  @IsString() alamedaId: string;
  @IsString() tipoJazigoId: string;
  @IsString() numero: string;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
  @IsNumber() @Min(0) valor: number;
  @IsString() @IsOptional() observacoes?: string;
}
export class UpdateJazigoDto {
  @IsString() @IsOptional() alamedaId?: string;
  @IsString() @IsOptional() tipoJazigoId?: string;
  @IsString() @IsOptional() numero?: string;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
  @IsNumber() @Min(0) @IsOptional() valor?: number;
  @IsString() @IsOptional() observacoes?: string;
}

// ---- Columbário ----

export class CreateColumbarioDto {
  @IsString() alaId: string;
  @IsString() tipoColumbarioId: string;
  @IsString() numero: string;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
  @IsNumber() @Min(0) valor: number;
  @IsString() @IsOptional() observacoes?: string;
}
export class UpdateColumbarioDto {
  @IsString() @IsOptional() alaId?: string;
  @IsString() @IsOptional() tipoColumbarioId?: string;
  @IsString() @IsOptional() numero?: string;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
  @IsNumber() @Min(0) @IsOptional() valor?: number;
  @IsString() @IsOptional() observacoes?: string;
}

// ---- Ossuário ----

export class CreateOssuarioDto {
  @IsString() blocoId: string;
  @IsString() numero: string;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
  @IsNumber() @Min(0) valor: number;
  @IsString() @IsOptional() observacoes?: string;
}
export class UpdateOssuarioDto {
  @IsString() @IsOptional() blocoId?: string;
  @IsString() @IsOptional() numero?: string;
  @IsEnum(StatusUnidade) @IsOptional() status?: StatusUnidade;
  @IsNumber() @Min(0) @IsOptional() valor?: number;
  @IsString() @IsOptional() observacoes?: string;
}

// ---- Services ----

@Injectable()
export class TipoJazigoService extends BaseCrudService<TipoJazigo, CreateTipoJazigoDto, UpdateTipoJazigoDto> {
  constructor(prisma: PrismaService) {
    super(prisma.tipoJazigo, 'Tipo de jazigo', ['nome']);
  }
}

@Injectable()
export class TipoColumbarioService extends BaseCrudService<
  TipoColumbario,
  CreateTipoColumbarioDto,
  UpdateTipoColumbarioDto
> {
  constructor(prisma: PrismaService) {
    super(prisma.tipoColumbario, 'Tipo de columbário', ['nome']);
  }
}

@Injectable()
export class JazigoService extends BaseCrudService<Jazigo, CreateJazigoDto, UpdateJazigoDto> {
  constructor(prisma: PrismaService) {
    super(prisma.jazigo, 'Jazigo', ['numero'], { alameda: true, tipoJazigo: true });
  }
}

@Injectable()
export class ColumbarioService extends BaseCrudService<Columbario, CreateColumbarioDto, UpdateColumbarioDto> {
  constructor(prisma: PrismaService) {
    super(prisma.columbario, 'Columbário', ['numero'], { ala: true, tipoColumbario: true });
  }
}

@Injectable()
export class OssuarioService extends BaseCrudService<Ossuario, CreateOssuarioDto, UpdateOssuarioDto> {
  constructor(prisma: PrismaService) {
    super(prisma.ossuario, 'Ossuário', ['numero'], { bloco: true });
  }
}

// ---- Controllers ----

@ApiTags('Cemitérios - Tipos de Jazigo')
@UseGuards(JwtAuthGuard)
@Controller('tipos-jazigo')
export class TipoJazigoController extends BaseCrudController<TipoJazigo, CreateTipoJazigoDto, UpdateTipoJazigoDto> {
  constructor(service: TipoJazigoService) {
    super(service);
  }
}

@ApiTags('Cemitérios - Tipos de Columbário')
@UseGuards(JwtAuthGuard)
@Controller('tipos-columbario')
export class TipoColumbarioController extends BaseCrudController<
  TipoColumbario,
  CreateTipoColumbarioDto,
  UpdateTipoColumbarioDto
> {
  constructor(service: TipoColumbarioService) {
    super(service);
  }
}

@ApiTags('Jazigos')
@UseGuards(JwtAuthGuard)
@Controller('jazigos')
export class JazigoController extends BaseCrudController<Jazigo, CreateJazigoDto, UpdateJazigoDto> {
  constructor(service: JazigoService) {
    super(service);
  }
}

@ApiTags('Columbários')
@UseGuards(JwtAuthGuard)
@Controller('columbarios')
export class ColumbarioController extends BaseCrudController<Columbario, CreateColumbarioDto, UpdateColumbarioDto> {
  constructor(service: ColumbarioService) {
    super(service);
  }
}

@ApiTags('Ossuários')
@UseGuards(JwtAuthGuard)
@Controller('ossuarios')
export class OssuarioController extends BaseCrudController<Ossuario, CreateOssuarioDto, UpdateOssuarioDto> {
  constructor(service: OssuarioService) {
    super(service);
  }
}
