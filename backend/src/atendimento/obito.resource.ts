import { Controller, Injectable, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { Obito, PapelUsuario } from '@prisma/client';
import { BaseCrudController } from '../common/base-crud.controller';
import { BaseCrudService } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class CreateObitoDto {
  @IsString() nomeFalecido: string;
  @IsString() @IsOptional() cpfFalecido?: string;
  @IsDateString() @IsOptional() dataNascimento?: string;
  @IsDateString() dataFalecimento: string;
  @IsString() @IsOptional() localFalecimento?: string;
  @IsString() @IsOptional() causaMortis?: string;
  @IsString() @IsOptional() numeroDO?: string;
  @IsString() @IsOptional() responsavelId?: string;
}
export class UpdateObitoDto {
  @IsString() @IsOptional() nomeFalecido?: string;
  @IsString() @IsOptional() cpfFalecido?: string;
  @IsDateString() @IsOptional() dataNascimento?: string;
  @IsDateString() @IsOptional() dataFalecimento?: string;
  @IsString() @IsOptional() localFalecimento?: string;
  @IsString() @IsOptional() causaMortis?: string;
  @IsString() @IsOptional() numeroDO?: string;
  @IsString() @IsOptional() responsavelId?: string;
}

@Injectable()
export class ObitoService extends BaseCrudService<Obito, CreateObitoDto, UpdateObitoDto> {
  constructor(prisma: PrismaService) {
    super(prisma.obito, 'Óbito', ['nomeFalecido', 'cpfFalecido', 'numeroDO'], {
      responsavel: true,
    });
  }
}

@ApiTags('Atendimento - Óbitos')
@UseGuards(JwtAuthGuard)
@Controller('obitos')
export class ObitoController extends BaseCrudController<Obito, CreateObitoDto, UpdateObitoDto> {
  constructor(service: ObitoService) {
    super(service, [PapelUsuario.GERENTE, PapelUsuario.ATENDENTE]);
  }
}
