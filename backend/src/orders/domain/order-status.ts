import { OrderStatus } from '@prisma/client';
import { InvalidStateTransitionException } from '../../shared/exceptions/domain.exception';

/**
 * Fluxo operacional da Ordem de Venda. Cada estado só admite os sucessores
 * listados aqui - qualquer outra transição é rejeitada. Manter as regras
 * concentradas neste mapa evita espalhar condicionais pelos services.
 */
const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  CRIADA: [OrderStatus.PLANEJADA],
  PLANEJADA: [OrderStatus.AGENDADA],
  AGENDADA: [OrderStatus.EM_TRANSPORTE],
  EM_TRANSPORTE: [OrderStatus.ENTREGUE],
  ENTREGUE: [],
};

export const ORDER_FLOW: OrderStatus[] = [
  OrderStatus.CRIADA,
  OrderStatus.PLANEJADA,
  OrderStatus.AGENDADA,
  OrderStatus.EM_TRANSPORTE,
  OrderStatus.ENTREGUE,
];

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidStateTransitionException(from, to);
  }
}

export function nextStatuses(from: OrderStatus): OrderStatus[] {
  return ALLOWED[from];
}

export function isTerminal(status: OrderStatus): boolean {
  return ALLOWED[status].length === 0;
}

/** Estados em que a OV ainda pode ser (re)agendada ou ter transporte alterado. */
export function isMutable(status: OrderStatus): boolean {
  return status !== OrderStatus.EM_TRANSPORTE && status !== OrderStatus.ENTREGUE;
}
