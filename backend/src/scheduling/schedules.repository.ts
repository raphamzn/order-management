import { Injectable } from '@nestjs/common';
import { ScheduleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ScheduleData {
  deliveryDate: Date;
  windowStart: string;
  windowEnd: string;
}

@Injectable()
export class SchedulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOrderId(orderId: string) {
    return this.prisma.schedule.findUnique({ where: { orderId } });
  }

  upsert(orderId: string, data: ScheduleData) {
    return this.prisma.schedule.upsert({
      where: { orderId },
      create: { orderId, ...data, status: ScheduleStatus.PENDENTE },
      update: { ...data, status: ScheduleStatus.PENDENTE },
    });
  }

  confirm(orderId: string) {
    return this.prisma.schedule.update({
      where: { orderId },
      data: { status: ScheduleStatus.CONFIRMADO },
    });
  }
}
