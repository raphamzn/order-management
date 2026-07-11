import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OrderCreatedEvent,
  OrderEvents,
  OrderScheduledEvent,
  OrderStatusChangedEvent,
  OrderTransportChangedEvent,
} from '../shared/events/order-events';
import { AuditService, RecordAuditInput } from './audit.service';

/**
 * Consome os eventos de domínio e materializa a trilha de auditoria.
 * A gravação é best-effort: uma falha aqui é registrada em log, mas nunca
 * derruba a operação de negócio que originou o evento.
 */
@Injectable()
export class AuditListener {
  private readonly logger = new Logger(AuditListener.name);

  constructor(private readonly audit: AuditService) {}

  @OnEvent(OrderEvents.Created)
  onCreated(event: OrderCreatedEvent) {
    return this.safeRecord({
      action: 'ORDER_CREATED',
      entity: 'Order',
      entityId: event.orderId,
      nextState: event.snapshot,
    });
  }

  @OnEvent(OrderEvents.StatusChanged)
  onStatusChanged(event: OrderStatusChangedEvent) {
    return this.safeRecord({
      action: 'ORDER_STATUS_CHANGED',
      entity: 'Order',
      entityId: event.orderId,
      previousState: { status: event.from },
      nextState: { status: event.to },
    });
  }

  @OnEvent(OrderEvents.Scheduled)
  onScheduled(event: OrderScheduledEvent) {
    return this.safeRecord({
      action: 'ORDER_SCHEDULE_CHANGED',
      entity: 'Schedule',
      entityId: event.orderId,
      previousState: event.previous,
      nextState: event.next,
      metadata: { scheduleAction: event.action },
    });
  }

  @OnEvent(OrderEvents.TransportChanged)
  onTransportChanged(event: OrderTransportChangedEvent) {
    return this.safeRecord({
      action: 'ORDER_TRANSPORT_CHANGED',
      entity: 'Order',
      entityId: event.orderId,
      previousState: { transportType: event.from },
      nextState: { transportType: event.to },
    });
  }

  private async safeRecord(input: RecordAuditInput) {
    try {
      await this.audit.record(input);
    } catch (error) {
      this.logger.error(
        `Falha ao registrar auditoria (${input.action} ${input.entityId})`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
