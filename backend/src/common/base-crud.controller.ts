import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BaseCrudService, ListQuery } from './base-crud.service';

/**
 * Controller genérico de CRUD. As rotas são definidas aqui via decorators;
 * o NestJS preserva os metadados de rota mesmo quando a classe concreta
 * apenas estende esta base (padrão documentado de "generic controllers").
 */
@ApiBearerAuth()
export class BaseCrudController<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  constructor(protected readonly service: BaseCrudService<T, CreateDto, UpdateDto>) {}

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
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
