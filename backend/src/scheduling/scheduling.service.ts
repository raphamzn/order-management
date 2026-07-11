import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Schedule, ScheduleStatus } from '@prisma/client';
import { isMutable } from '../orders/domain/order-status';
import { OrdersService } from '../orders/orders.service';
import { BusinessRuleException } from '../shared/exceptions/domain.exception';
import { OrderEvents, OrderScheduledEvent } from '../shared/events/order-events';
import { ScheduleOrderDto } from './dto/schedule-order.dto';
import { SchedulesRepository } from './schedules.repository';

@Injectable()
export class SchedulingService {
  constructor(
    private readonly repository: SchedulesRepository,
    private readonly orders: OrdersService,
    private readonly events: EventEmitter2,
  ) {}

  /** Cria ou reagenda a entrega. Reagendar volta o agendamento para PENDENTE. */
  async schedule(orderId: string, dto: ScheduleOrderDto) {
    const order = await this.orders.findOne(orderId);
    this.assertOrderCanBeScheduled(order.status);
    this.assertWindow(dto.windowStart, dto.windowEnd);

    const existing = await this.repository.findByOrderId(orderId);
    const saved = await this.repository.upsert(orderId, {
      deliveryDate: new Date(dto.deliveryDate),
      windowStart: dto.windowStart,
      windowEnd: dto.windowEnd,
    });

    this.events.emit(
      OrderEvents.Scheduled,
      new OrderScheduledEvent(
        orderId,
        existing ? 'RESCHEDULED' : 'CREATED',
        existing ? this.snapshot(existing) : null,
        this.snapshot(saved),
      ),
    );
    return saved;
  }

  async confirm(orderId: string) {
    const order = await this.orders.findOne(orderId);
    this.assertOrderCanBeScheduled(order.status);

    const existing = await this.repository.findByOrderId(orderId);
    if (!existing) {
      throw new BusinessRuleException(
        'Não há agendamento para confirmar',
        'SCHEDULE_NOT_FOUND',
      );
    }
    if (existing.status === ScheduleStatus.CONFIRMADO) {
      return existing;
    }

    const confirmed = await this.repository.confirm(orderId);
    this.events.emit(
      OrderEvents.Scheduled,
      new OrderScheduledEvent(
        orderId,
        'CONFIRMED',
        this.snapshot(existing),
        this.snapshot(confirmed),
      ),
    );
    return confirmed;
  }

  private assertOrderCanBeScheduled(status: Parameters<typeof isMutable>[0]) {
    if (!isMutable(status)) {
      throw new BusinessRuleException(
        'A OV não pode ser agendada após o início da entrega',
        'ORDER_LOCKED',
      );
    }
  }

  private assertWindow(start: string, end: string) {
    if (start >= end) {
      throw new BusinessRuleException(
        'A janela de atendimento deve terminar depois de começar',
        'INVALID_WINDOW',
      );
    }
  }

  private snapshot(schedule: Schedule) {
    return {
      deliveryDate: schedule.deliveryDate.toISOString().slice(0, 10),
      windowStart: schedule.windowStart,
      windowEnd: schedule.windowEnd,
      status: schedule.status,
    };
  }
}
