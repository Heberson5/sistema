import { Controller, Injectable, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Produto, Servico } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreateProdutoDto {
  @IsString() nome: string;
  @IsString() @IsOptional() descricao?: string;
  @IsString() @IsOptional() categoria?: string;
  @IsNumber() @Min(0) valor: number;
  @IsInt() @Min(0) @IsOptional() estoque?: number;
  @IsBoolean() @IsOptional() ativo?: boolean;
}
export class UpdateProdutoDto {
  @IsString() @IsOptional() nome?: string;
  @IsString() @IsOptional() descricao?: string;
  @IsString() @IsOptional() categoria?: string;
  @IsNumber() @Min(0) @IsOptional() valor?: number;
  @IsInt() @Min(0) @IsOptional() estoque?: number;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

export class CreateServicoDto {
  @IsString() nome: string;
  @IsString() @IsOptional() descricao?: string;
  @IsString() @IsOptional() categoria?: string;
  @IsNumber() @Min(0) valor: number;
  @IsBoolean() @IsOptional() ativo?: boolean;
}
export class UpdateServicoDto {
  @IsString() @IsOptional() nome?: string;
  @IsString() @IsOptional() descricao?: string;
  @IsString() @IsOptional() categoria?: string;
  @IsNumber() @Min(0) @IsOptional() valor?: number;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

@Injectable()
export class ProdutosService extends BaseCrudService<Produto, CreateProdutoDto, UpdateProdutoDto> {
  constructor(prisma: PrismaService) {
    super(prisma.produto, 'Produto', ['nome', 'categoria']);
  }
}

@Injectable()
export class ServicosService extends BaseCrudService<Servico, CreateServicoDto, UpdateServicoDto> {
  constructor(prisma: PrismaService) {
    super(prisma.servico, 'Serviço', ['nome', 'categoria']);
  }
}

@ApiTags('Produtos')
@UseGuards(JwtAuthGuard)
@Controller('produtos')
export class ProdutosController extends BaseCrudController<Produto, CreateProdutoDto, UpdateProdutoDto> {
  constructor(service: ProdutosService) {
    super(service);
  }
}

@ApiTags('Serviços')
@UseGuards(JwtAuthGuard)
@Controller('servicos')
export class ServicosController extends BaseCrudController<Servico, CreateServicoDto, UpdateServicoDto> {
  constructor(service: ServicosService) {
    super(service);
  }
}
