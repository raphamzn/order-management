import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ItemCreateInput) {
    return this.prisma.item.create({ data });
  }

  findAll() {
    return this.prisma.item.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string) {
    return this.prisma.item.findUnique({ where: { id } });
  }

  findManyByIds(ids: string[]) {
    return this.prisma.item.findMany({ where: { id: { in: ids } } });
  }
}
