import { NotFoundException } from '@nestjs/common';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Delegate mínimo que qualquer model do Prisma Client satisfaz
 * (findMany, count, findUnique, create, update, delete).
 */
export interface PrismaDelegate<T> {
  findMany(args?: any): Promise<T[]>;
  count(args?: any): Promise<number>;
  findUnique(args: any): Promise<T | null>;
  create(args: any): Promise<T>;
  update(args: any): Promise<T>;
  delete(args: any): Promise<T>;
}

/**
 * Serviço genérico de CRUD sobre um delegate do Prisma. Cobre a maioria
 * das entidades de cadastro simples; entidades com regra de negócio própria
 * (ex.: Venda, Locação, Atendimento) estendem/sobrescrevem estes métodos.
 */
export class BaseCrudService<T, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
  constructor(
    protected readonly delegate: PrismaDelegate<T>,
    protected readonly entityName = 'Registro',
    protected readonly searchableFields: string[] = [],
    protected readonly include?: Record<string, any>,
  ) {}

  protected buildWhere(search?: string): any {
    if (!search || this.searchableFields.length === 0) return undefined;
    return {
      OR: this.searchableFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    };
  }

  async findAll(query: ListQuery = {}): Promise<PaginatedResult<T>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where = this.buildWhere(query.search);

    const [data, total] = await Promise.all([
      this.delegate.findMany({
        where,
        include: this.include,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.delegate.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string): Promise<T> {
    const record = await this.delegate.findUnique({ where: { id }, include: this.include });
    if (!record) {
      throw new NotFoundException(`${this.entityName} não encontrado(a)`);
    }
    return record;
  }

  async create(dto: CreateDto): Promise<T> {
    return this.delegate.create({ data: dto, include: this.include });
  }

  async update(id: string, dto: UpdateDto): Promise<T> {
    await this.findOne(id);
    return this.delegate.update({ where: { id }, data: dto, include: this.include });
  }

  async remove(id: string): Promise<T> {
    await this.findOne(id);
    return this.delegate.delete({ where: { id } });
  }
}
