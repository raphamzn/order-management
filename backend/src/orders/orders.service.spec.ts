import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { ClientsService } from '../clients/clients.service';
import { ItemsRepository } from '../items/items.repository';
import {
  BusinessRuleException,
  InvalidStateTransitionException,
} from '../shared/exceptions/domain.exception';
import { OrderEvents } from '../shared/events/order-events';
import { TransportTypesService } from '../transport-types/transport-types.service';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

const createDto = {
  clientId: '11111111-1111-4111-8111-111111111111',
  transportTypeId: '22222222-2222-4222-8222-222222222222',
  items: [{ itemId: '33333333-3333-4333-8333-333333333333', quantity: 3 }],
};

describe('OrdersService', () => {
  let service: OrdersService;

  const repository = {
    count: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };
  const clients = {
    findOne: jest.fn(),
    assertTransportAuthorized: jest.fn(),
  };
  const transportTypes = { findOne: jest.fn() };
  const items = { findManyByIds: jest.fn() };
  const events = { emit: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: repository },
        { provide: ClientsService, useValue: clients },
        { provide: TransportTypesService, useValue: transportTypes },
        { provide: ItemsRepository, useValue: items },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();
    service = moduleRef.get(OrdersService);
  });

  describe('create', () => {
    it('cria a OV e emite evento quando as regras passam', async () => {
      clients.findOne.mockResolvedValue({ id: createDto.clientId });
      transportTypes.findOne.mockResolvedValue({ id: createDto.transportTypeId });
      clients.assertTransportAuthorized.mockResolvedValue(undefined);
      items.findManyByIds.mockResolvedValue([{ id: createDto.items[0].itemId }]);
      repository.count.mockResolvedValue(0);
      repository.create.mockResolvedValue({
        id: 'order-1',
        code: 'OV-00001',
        status: OrderStatus.CRIADA,
        clientId: createDto.clientId,
        transportType: { name: 'Caminhão' },
        items: [{ item: { sku: 'SKU-1' }, quantity: 3 }],
      });

      const result = await service.create(createDto);

      expect(result.code).toBe('OV-00001');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'OV-00001' }),
      );
      expect(events.emit).toHaveBeenCalledWith(
        OrderEvents.Created,
        expect.anything(),
      );
    });

    it('não persiste quando o transporte não está autorizado', async () => {
      clients.findOne.mockResolvedValue({ id: createDto.clientId });
      transportTypes.findOne.mockResolvedValue({ id: createDto.transportTypeId });
      clients.assertTransportAuthorized.mockRejectedValue(
        new BusinessRuleException('não autorizado', 'TRANSPORT_NOT_AUTHORIZED'),
      );

      await expect(service.create(createDto)).rejects.toBeInstanceOf(
        BusinessRuleException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('recusa itens inexistentes', async () => {
      clients.findOne.mockResolvedValue({ id: createDto.clientId });
      transportTypes.findOne.mockResolvedValue({ id: createDto.transportTypeId });
      clients.assertTransportAuthorized.mockResolvedValue(undefined);
      items.findManyByIds.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toBeInstanceOf(
        BusinessRuleException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('rejeita transição fora da sequência', async () => {
      repository.findById.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.CRIADA,
        schedule: null,
      });

      await expect(
        service.updateStatus('order-1', OrderStatus.EM_TRANSPORTE),
      ).rejects.toBeInstanceOf(InvalidStateTransitionException);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('exige agendamento confirmado para avançar a AGENDADA', async () => {
      repository.findById.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PLANEJADA,
        schedule: { status: 'PENDENTE' },
      });

      await expect(
        service.updateStatus('order-1', OrderStatus.AGENDADA),
      ).rejects.toBeInstanceOf(BusinessRuleException);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });
  });
});
