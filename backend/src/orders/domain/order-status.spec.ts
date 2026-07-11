import { OrderStatus } from '@prisma/client';
import { InvalidStateTransitionException } from '../../shared/exceptions/domain.exception';
import {
  assertTransition,
  canTransition,
  isTerminal,
  nextStatuses,
} from './order-status';

describe('order-status (máquina de estados)', () => {
  it('permite apenas o próximo estado da sequência', () => {
    expect(canTransition(OrderStatus.CRIADA, OrderStatus.PLANEJADA)).toBe(true);
    expect(canTransition(OrderStatus.PLANEJADA, OrderStatus.AGENDADA)).toBe(true);
    expect(canTransition(OrderStatus.AGENDADA, OrderStatus.EM_TRANSPORTE)).toBe(
      true,
    );
    expect(
      canTransition(OrderStatus.EM_TRANSPORTE, OrderStatus.ENTREGUE),
    ).toBe(true);
  });

  it('rejeita saltos e retrocessos na sequência', () => {
    expect(canTransition(OrderStatus.CRIADA, OrderStatus.AGENDADA)).toBe(false);
    expect(canTransition(OrderStatus.CRIADA, OrderStatus.ENTREGUE)).toBe(false);
    expect(canTransition(OrderStatus.AGENDADA, OrderStatus.PLANEJADA)).toBe(
      false,
    );
  });

  it('assertTransition lança exceção de domínio em transição inválida', () => {
    expect(() =>
      assertTransition(OrderStatus.CRIADA, OrderStatus.EM_TRANSPORTE),
    ).toThrow(InvalidStateTransitionException);
  });

  it('assertTransition não lança em transição válida', () => {
    expect(() =>
      assertTransition(OrderStatus.CRIADA, OrderStatus.PLANEJADA),
    ).not.toThrow();
  });

  it('ENTREGUE é estado terminal', () => {
    expect(isTerminal(OrderStatus.ENTREGUE)).toBe(true);
    expect(nextStatuses(OrderStatus.ENTREGUE)).toEqual([]);
  });
});
