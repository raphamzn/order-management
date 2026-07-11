import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const withTransports = {
  include: { authorizedTransportTypes: { orderBy: { name: 'asc' as const } } },
};

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Omit<Prisma.ClientCreateInput, 'authorizedTransportTypes'>,
    authorizedTransportTypeIds: string[],
  ) {
    return this.prisma.client.create({
      data: {
        ...data,
        authorizedTransportTypes: authorizedTransportTypeIds.length
          ? { connect: authorizedTransportTypeIds.map((id) => ({ id })) }
          : undefined,
      },
      ...withTransports,
    });
  }

  findAll() {
    return this.prisma.client.findMany({
      orderBy: { name: 'asc' },
      ...withTransports,
    });
  }

  findById(id: string) {
    return this.prisma.client.findUnique({ where: { id }, ...withTransports });
  }

  update(id: string, data: Prisma.ClientUpdateInput) {
    return this.prisma.client.update({ where: { id }, data, ...withTransports });
  }

  setAuthorizedTransports(id: string, transportTypeIds: string[]) {
    return this.prisma.client.update({
      where: { id },
      data: {
        authorizedTransportTypes: {
          set: transportTypeIds.map((tid) => ({ id: tid })),
        },
      },
      ...withTransports,
    });
  }

  countAuthorization(clientId: string, transportTypeId: string) {
    return this.prisma.client.count({
      where: {
        id: clientId,
        authorizedTransportTypes: { some: { id: transportTypeId } },
      },
    });
  }
}
