import { Body, Delete, ForbiddenException, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PapelUsuario } from '@prisma/client';
import { CurrentUser } from './decorators/current-user.decorator';
import { BaseCrudService, ListQuery } from './base-crud.service';

interface RequestUser {
  papel?: PapelUsuario;
}

/**
 * Controller genérico de CRUD. As rotas são definidas aqui via decorators;
 * o NestJS preserva os metadados de rota mesmo quando a classe concreta
 * apenas estende esta base (padrão documentado de "generic controllers").
 *
 * Leitura (findAll/findOne) fica liberada para qualquer papel autenticado,
 * pois vários módulos leem cadastros de outros (ex.: vendas lê jazigos,
 * locações lê salas comerciais) independente de quem está operando.
 * Escrita (create/update/remove) pode ser restrita a papéis específicos
 * via `writeRoles` no construtor; ADMIN sempre tem acesso, mesmo sem estar
 * na lista.
 */
@ApiBearerAuth()
export class BaseCrudController<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  constructor(
    protected readonly service: BaseCrudService<T, CreateDto, UpdateDto>,
    protected readonly writeRoles?: PapelUsuario[],
  ) {}

  protected checkWriteAccess(user?: RequestUser) {
    if (!this.writeRoles || this.writeRoles.length === 0) return;
    if (user?.papel === PapelUsuario.ADMIN) return;
    if (!user?.papel || !this.writeRoles.includes(user.papel)) {
      throw new ForbiddenException('Seu perfil não tem permissão para esta ação');
    }
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: ListQuery) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDto, @CurrentUser() user: RequestUser) {
    this.checkWriteAccess(user);
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDto, @CurrentUser() user: RequestUser) {
    this.checkWriteAccess(user);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    this.checkWriteAccess(user);
    return this.service.remove(id);
  }
}
