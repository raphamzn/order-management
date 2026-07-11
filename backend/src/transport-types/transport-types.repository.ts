import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransportTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TransportTypeCreateInput) {
    return this.prisma.transportType.create({ data });
  }

  findAll() {
    return this.prisma.transportType.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string) {
    return this.prisma.transportType.findUnique({ where: { id } });
  }

  findManyByIds(ids: string[]) {
    return this.prisma.transportType.findMany({ where: { id: { in: ids } } });
  }

  update(id: string, data: Prisma.TransportTypeUpdateInput) {
    return this.prisma.transportType.update({ where: { id }, data });
  }
}
