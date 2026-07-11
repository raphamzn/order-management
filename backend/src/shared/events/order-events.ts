export const OrderEvents = {
  Created: 'order.created',
  StatusChanged: 'order.status-changed',
  Scheduled: 'order.scheduled',
  TransportChanged: 'order.transport-changed',
} as const;

export class OrderCreatedEvent {
  constructor(
    readonly orderId: string,
    readonly snapshot: Record<string, unknown>,
  ) {}
}

export class OrderStatusChangedEvent {
  constructor(
    readonly orderId: string,
    readonly from: string,
    readonly to: string,
  ) {}
}

export type ScheduleAction = 'CREATED' | 'RESCHEDULED' | 'CONFIRMED';

export class OrderScheduledEvent {
  constructor(
    readonly orderId: string,
    readonly action: ScheduleAction,
    readonly previous: unknown,
    readonly next: unknown,
  ) {}
}

export class OrderTransportChangedEvent {
  constructor(
    readonly orderId: string,
    readonly from: string,
    readonly to: string,
  ) {}
}
