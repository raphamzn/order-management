import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ORDER_INCLUDE = {
  client: { include: { authorizedTransportTypes: true } },
  transportType: true,
  items: { include: { item: true } },
  schedule: true,
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  count() {
    return this.prisma.order.count();
  }

  create(input: {
    code: string;
    clientId: string;
    transportTypeId: string;
    items: { itemId: string; quantity: number }[];
  }) {
    return this.prisma.order.create({
      data: {
        code: input.code,
        client: { connect: { id: input.clientId } },
        transportType: { connect: { id: input.transportTypeId } },
        items: {
          create: input.items.map((i) => ({
            item: { connect: { id: i.itemId } },
            quantity: i.quantity,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
  }

  async findManyWithFilters(where: Prisma.OrderWhereInput, skip: number, take: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total };
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: ORDER_INCLUDE,
    });
  }

  updateTransport(id: string, transportTypeId: string) {
    return this.prisma.order.update({
      where: { id },
      data: { transportType: { connect: { id: transportTypeId } } },
      include: ORDER_INCLUDE,
    });
  }
}
