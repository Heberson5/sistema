import { Controller, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PapelUsuario, Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BaseCrudController } from '../common/base-crud.controller';
import { ListQuery } from '../common/base-crud.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateUsuarioDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  senha: string;

  @IsEnum(PapelUsuario)
  @IsOptional()
  papel?: PapelUsuario;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  ativo?: boolean;
}

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  senha?: string;

  @IsEnum(PapelUsuario)
  @IsOptional()
  papel?: PapelUsuario;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  ativo?: boolean;
}

type UsuarioSemSenha = Omit<Usuario, 'senhaHash'>;

function sanitize(usuario: Usuario): UsuarioSemSenha {
  const { senhaHash, ...rest } = usuario;
  return rest;
}

/**
 * Não estende BaseCrudService: usuário exige tratamento especial de senha
 * (hash) e nunca deve retornar senhaHash nas respostas.
 */
@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(search?: string) {
    if (!search) return undefined;
    return {
      OR: [
        { nome: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    };
  }

  async findAll(query: ListQuery = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where = this.buildWhere(query.search);
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({ where, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.usuario.count({ where }),
    ]);
    return { data: data.map(sanitize), total, page, pageSize };
  }

  async findOne(id: string): Promise<UsuarioSemSenha> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado(a)');
    return sanitize(usuario);
  }

  async create(dto: CreateUsuarioDto) {
    const { senha, ...rest } = dto;
    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await this.prisma.usuario.create({ data: { ...rest, senhaHash } });
    return sanitize(usuario);
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    const { senha, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (senha) {
      data.senhaHash = await bcrypt.hash(senha, 12);
    }
    const usuario = await this.prisma.usuario.update({ where: { id }, data });
    return sanitize(usuario);
  }

  async remove(id: string) {
    await this.findOne(id);
    const usuario = await this.prisma.usuario.delete({ where: { id } });
    return sanitize(usuario);
  }
}

@ApiTags('Usuários')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PapelUsuario.ADMIN)
@Controller('usuarios')
export class UsuariosController extends BaseCrudController<UsuarioSemSenha, CreateUsuarioDto, UpdateUsuarioDto> {
  constructor(service: UsuariosService) {
    super(service as any);
  }
}
