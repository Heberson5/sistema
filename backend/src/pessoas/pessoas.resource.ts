import { Controller, Injectable, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Pessoa, TipoPessoa } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreatePessoaDto {
  @IsEnum(TipoPessoa) @IsOptional() tipo?: TipoPessoa;
  @IsString() nome: string;
  @IsString() @IsOptional() cpfCnpj?: string;
  @IsString() @IsOptional() rg?: string;
  @IsDateString() @IsOptional() dataNascimento?: string;
  @IsString() @IsOptional() sexo?: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() telefone?: string;
  @IsString() @IsOptional() celular?: string;
  @IsString() @IsOptional() cep?: string;
  @IsString() @IsOptional() logradouro?: string;
  @IsString() @IsOptional() numero?: string;
  @IsString() @IsOptional() complemento?: string;
  @IsString() @IsOptional() bairro?: string;
  @IsString() @IsOptional() cidade?: string;
  @IsString() @IsOptional() uf?: string;
  @IsString() @IsOptional() observacoes?: string;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

export class UpdatePessoaDto {
  @IsEnum(TipoPessoa) @IsOptional() tipo?: TipoPessoa;
  @IsString() @IsOptional() nome?: string;
  @IsString() @IsOptional() cpfCnpj?: string;
  @IsString() @IsOptional() rg?: string;
  @IsDateString() @IsOptional() dataNascimento?: string;
  @IsString() @IsOptional() sexo?: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() telefone?: string;
  @IsString() @IsOptional() celular?: string;
  @IsString() @IsOptional() cep?: string;
  @IsString() @IsOptional() logradouro?: string;
  @IsString() @IsOptional() numero?: string;
  @IsString() @IsOptional() complemento?: string;
  @IsString() @IsOptional() bairro?: string;
  @IsString() @IsOptional() cidade?: string;
  @IsString() @IsOptional() uf?: string;
  @IsString() @IsOptional() observacoes?: string;
  @IsBoolean() @IsOptional() ativo?: boolean;
}

@Injectable()
export class PessoasService extends BaseCrudService<Pessoa, CreatePessoaDto, UpdatePessoaDto> {
  constructor(prisma: PrismaService) {
    super(prisma.pessoa, 'Pessoa', ['nome', 'cpfCnpj', 'email']);
  }
}

@ApiTags('Pessoas')
@UseGuards(JwtAuthGuard)
@Controller('pessoas')
export class PessoasController extends BaseCrudController<Pessoa, CreatePessoaDto, UpdatePessoaDto> {
  constructor(service: PessoasService) {
    super(service);
  }
}
