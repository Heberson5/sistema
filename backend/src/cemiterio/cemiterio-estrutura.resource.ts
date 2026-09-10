import { Controller, Injectable, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Ala, Alameda, Bloco, Cemiterio, PapelUsuario, Quadra } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreateCemiterioDto {
  @IsString() nome: string;
  @IsString() @IsOptional() cnpj?: string;
  @IsString() @IsOptional() telefone?: string;
  @IsString() @IsOptional() cep?: string;
  @IsString() @IsOptional() logradouro?: string;
  @IsString() @IsOptional() numero?: string;
  @IsString() @IsOptional() bairro?: string;
  @IsString() @IsOptional() cidade?: string;
  @IsString() @IsOptional() uf?: string;
  @IsBoolean() @IsOptional() ativo?: boolean;
}
export class UpdateCemiterioDto {
  @IsString() @IsOptional() nome?: string;
  @IsString() @IsOptional() cnpj?: string;
  @IsString() @IsOptional() telefone?: string;
  @IsString() @IsOptional() cep?: string;
  @IsString() @IsOptional() logradouro?: string;
  @IsString() @IsOptional() numero?: string;
  @IsString() @IsOptional() bairro?: string;
  @IsString() @IsOptional() cidade?: string;
  @IsString() @IsOptional() uf?: string;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

export class CreateQuadraDto {
  @IsString() cemiterioId: string;
  @IsString() codigo: string;
  @IsString() @IsOptional() descricao?: string;
}
export class UpdateQuadraDto {
  @IsString() @IsOptional() cemiterioId?: string;
  @IsString() @IsOptional() codigo?: string;
  @IsString() @IsOptional() descricao?: string;
}

export class CreateAlamedaDto {
  @IsString() quadraId: string;
  @IsString() codigo: string;
  @IsString() @IsOptional() descricao?: string;
}
export class UpdateAlamedaDto {
  @IsString() @IsOptional() quadraId?: string;
  @IsString() @IsOptional() codigo?: string;
  @IsString() @IsOptional() descricao?: string;
}

export class CreateAlaDto {
  @IsString() cemiterioId: string;
  @IsString() codigo: string;
  @IsString() @IsOptional() descricao?: string;
}
export class UpdateAlaDto {
  @IsString() @IsOptional() cemiterioId?: string;
  @IsString() @IsOptional() codigo?: string;
  @IsString() @IsOptional() descricao?: string;
}

export class CreateBlocoDto {
  @IsString() cemiterioId: string;
  @IsString() codigo: string;
  @IsString() @IsOptional() descricao?: string;
}
export class UpdateBlocoDto {
  @IsString() @IsOptional() cemiterioId?: string;
  @IsString() @IsOptional() codigo?: string;
  @IsString() @IsOptional() descricao?: string;
}

@Injectable()
export class CemiterioService extends BaseCrudService<Cemiterio, CreateCemiterioDto, UpdateCemiterioDto> {
  constructor(prisma: PrismaService) {
    super(prisma.cemiterio, 'Cemitério', ['nome', 'cidade'], {
      quadras: true,
      alas: true,
      blocos: true,
    });
  }
}

@Injectable()
export class QuadraService extends BaseCrudService<Quadra, CreateQuadraDto, UpdateQuadraDto> {
  constructor(prisma: PrismaService) {
    super(prisma.quadra, 'Quadra', ['codigo'], { alamedas: true });
  }
}

@Injectable()
export class AlamedaService extends BaseCrudService<Alameda, CreateAlamedaDto, UpdateAlamedaDto> {
  constructor(prisma: PrismaService) {
    super(prisma.alameda, 'Alameda', ['codigo']);
  }
}

@Injectable()
export class AlaService extends BaseCrudService<Ala, CreateAlaDto, UpdateAlaDto> {
  constructor(prisma: PrismaService) {
    super(prisma.ala, 'Ala', ['codigo']);
  }
}

@Injectable()
export class BlocoService extends BaseCrudService<Bloco, CreateBlocoDto, UpdateBlocoDto> {
  constructor(prisma: PrismaService) {
    super(prisma.bloco, 'Bloco', ['codigo']);
  }
}

@ApiTags('Cemitérios')
@UseGuards(JwtAuthGuard)
@Controller('cemiterios')
export class CemiterioController extends BaseCrudController<Cemiterio, CreateCemiterioDto, UpdateCemiterioDto> {
  constructor(service: CemiterioService) {
    super(service, [PapelUsuario.GERENTE]);
  }
}

@ApiTags('Cemitérios - Quadras')
@UseGuards(JwtAuthGuard)
@Controller('quadras')
export class QuadraController extends BaseCrudController<Quadra, CreateQuadraDto, UpdateQuadraDto> {
  constructor(service: QuadraService) {
    super(service, [PapelUsuario.GERENTE]);
  }
}

@ApiTags('Cemitérios - Alamedas')
@UseGuards(JwtAuthGuard)
@Controller('alamedas')
export class AlamedaController extends BaseCrudController<Alameda, CreateAlamedaDto, UpdateAlamedaDto> {
  constructor(service: AlamedaService) {
    super(service, [PapelUsuario.GERENTE]);
  }
}

@ApiTags('Cemitérios - Alas')
@UseGuards(JwtAuthGuard)
@Controller('alas')
export class AlaController extends BaseCrudController<Ala, CreateAlaDto, UpdateAlaDto> {
  constructor(service: AlaService) {
    super(service, [PapelUsuario.GERENTE]);
  }
}

@ApiTags('Cemitérios - Blocos')
@UseGuards(JwtAuthGuard)
@Controller('blocos')
export class BlocoController extends BaseCrudController<Bloco, CreateBlocoDto, UpdateBlocoDto> {
  constructor(service: BlocoService) {
    super(service, [PapelUsuario.GERENTE]);
  }
}
