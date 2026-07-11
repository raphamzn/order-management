import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus, Prisma } from '@prisma/client';
import { ClientsService } from '../clients/clients.service';
import { ItemsRepository } from '../items/items.repository';
import { TransportTypesService } from '../transport-types/transport-types.service';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../shared/exceptions/domain.exception';
import {
  OrderCreatedEvent,
  OrderEvents,
  OrderStatusChangedEvent,
  OrderTransportChangedEvent,
} from '../shared/events/order-events';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { assertTransition, isMutable } from './domain/order-status';
import { OrdersRepository, OrderWithRelations } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly repository: OrdersRepository,
    private readonly clients: ClientsService,
    private readonly transportTypes: TransportTypesService,
    private readonly items: ItemsRepository,
    private readonly events: EventEmitter2,
  ) {}

  async create(dto: CreateOrderDto) {
    await this.clients.findOne(dto.clientId);
    await this.transportTypes.findOne(dto.transportTypeId);
    await this.clients.assertTransportAuthorized(dto.clientId, dto.transportTypeId);
    await this.ensureItemsExist(dto.items.map((i) => i.itemId));

    const order = await this.repository.create({
      code: await this.nextCode(),
      clientId: dto.clientId,
      transportTypeId: dto.transportTypeId,
      items: dto.items,
    });

    this.events.emit(
      OrderEvents.Created,
      new OrderCreatedEvent(order.id, this.snapshot(order)),
    );
    return order;
  }

  async findAll(query: ListOrdersQueryDto) {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.pageSize;
    const { data, total } = await this.repository.findManyWithFilters(
      where,
      skip,
      query.pageSize,
    );
    return {
      data,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string): Promise<OrderWithRelations> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new EntityNotFoundException('Ordem de Venda', id);
    }
    return order;
  }

  async updateStatus(id: string, to: OrderStatus) {
    const order = await this.findOne(id);
    const from = order.status;
    assertTransition(from, to);

    if (to === OrderStatus.AGENDADA) {
      if (!order.schedule || order.schedule.status !== 'CONFIRMADO') {
        throw new BusinessRuleException(
          'A OV precisa de um agendamento confirmado para avançar para AGENDADA',
          'SCHEDULE_REQUIRED',
        );
      }
    }

    const updated = await this.repository.updateStatus(id, to);
    this.events.emit(
      OrderEvents.StatusChanged,
      new OrderStatusChangedEvent(id, from, to),
    );
    return updated;
  }

  async changeTransport(id: string, transportTypeId: string) {
    const order = await this.findOne(id);
    if (!isMutable(order.status)) {
      throw new BusinessRuleException(
        'Não é possível alterar o transporte após o início da entrega',
        'ORDER_LOCKED',
      );
    }
    const newTransport = await this.transportTypes.findOne(transportTypeId);
    await this.clients.assertTransportAuthorized(order.clientId, transportTypeId);

    if (order.transportTypeId === transportTypeId) {
      return order;
    }

    const updated = await this.repository.updateTransport(id, transportTypeId);
    this.events.emit(
      OrderEvents.TransportChanged,
      new OrderTransportChangedEvent(
        id,
        order.transportType.name,
        newTransport.name,
      ),
    );
    return updated;
  }

  private buildWhere(query: ListOrdersQueryDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.clientId) where.clientId = query.clientId;
    if (query.transportTypeId) where.transportTypeId = query.transportTypeId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }
    return where;
  }

  private async ensureItemsExist(itemIds: string[]) {
    const unique = [...new Set(itemIds)];
    if (unique.length !== itemIds.length) {
      throw new BusinessRuleException(
        'Itens duplicados na mesma ordem de venda',
        'DUPLICATE_ORDER_ITEM',
      );
    }
    const found = await this.items.findManyByIds(unique);
    if (found.length !== unique.length) {
      const foundIds = new Set(found.map((i) => i.id));
      const missing = unique.filter((id) => !foundIds.has(id));
      throw new BusinessRuleException(
        `Itens inexistentes: ${missing.join(', ')}`,
        'ITEM_NOT_FOUND',
      );
    }
  }

  /**
   * Código sequencial legível (OV-00001). Usa a contagem atual como base;
   * para altíssima concorrência de criação daria pra trocar por uma sequence
   * dedicada no banco - trade-off assumido a favor da simplicidade.
   */
  private async nextCode() {
    const count = await this.repository.count();
    return `OV-${String(count + 1).padStart(5, '0')}`;
  }

  private snapshot(order: OrderWithRelations) {
    return {
      code: order.code,
      status: order.status,
      clientId: order.clientId,
      transportType: order.transportType.name,
      items: order.items.map((i) => ({
        sku: i.item.sku,
        quantity: i.quantity,
      })),
    };
  }
}
