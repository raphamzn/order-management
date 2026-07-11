import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/shared/filters/domain-exception.filter';
import { PrismaExceptionFilter } from '../src/shared/filters/prisma-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Exercita o caminho crítico contra o banco real: criação de OV respeitando a
 * autorização de transporte, rejeição de transição inválida e trilha de auditoria.
 * Requer o Postgres de desenvolvimento no ar (docker compose up -d db).
 */
describe('Orders (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const suffix = Date.now().toString();
  const created: { clients: string[]; transports: string[]; items: string[] } = {
    clients: [],
    transports: [],
    items: [],
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(
      new DomainExceptionFilter(),
      new PrismaExceptionFilter(),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.order.deleteMany({
      where: { clientId: { in: created.clients } },
    });
    await prisma.client.deleteMany({ where: { id: { in: created.clients } } });
    await prisma.item.deleteMany({ where: { id: { in: created.items } } });
    await prisma.transportType.deleteMany({
      where: { id: { in: created.transports } },
    });
    await app.close();
  });

  it('cria uma OV válida, bloqueia transição inválida e registra auditoria', async () => {
    const server = app.getHttpServer();

    const transport = await request(server)
      .post('/transport-types')
      .send({ name: `Caminhão ${suffix}`, code: `CAMINHAO_${suffix}` })
      .expect(201);
    created.transports.push(transport.body.id);

    const otherTransport = await request(server)
      .post('/transport-types')
      .send({ name: `Bitruck ${suffix}`, code: `BITRUCK_${suffix}` })
      .expect(201);
    created.transports.push(otherTransport.body.id);

    const item = await request(server)
      .post('/items')
      .send({ sku: `SKU-${suffix}`, name: 'Item de teste', unit: 'UN' })
      .expect(201);
    created.items.push(item.body.id);

    const client = await request(server)
      .post('/clients')
      .send({
        name: `Cliente ${suffix}`,
        authorizedTransportTypeIds: [transport.body.id],
      })
      .expect(201);
    created.clients.push(client.body.id);

    // transporte não autorizado -> 422
    await request(server)
      .post('/orders')
      .send({
        clientId: client.body.id,
        transportTypeId: otherTransport.body.id,
        items: [{ itemId: item.body.id, quantity: 2 }],
      })
      .expect(422);

    // OV válida -> 201
    const order = await request(server)
      .post('/orders')
      .send({
        clientId: client.body.id,
        transportTypeId: transport.body.id,
        items: [{ itemId: item.body.id, quantity: 2 }],
      })
      .expect(201);
    expect(order.body.status).toBe('CRIADA');
    expect(order.body.code).toMatch(/^OV-\d+$/);

    // transição inválida -> 409
    await request(server)
      .patch(`/orders/${order.body.id}/status`)
      .send({ status: 'AGENDADA' })
      .expect(409);

    // transição válida -> 200
    await request(server)
      .patch(`/orders/${order.body.id}/status`)
      .send({ status: 'PLANEJADA' })
      .expect(200);

    // auditoria é gravada de forma assíncrona (event-driven), então damos
    // algumas tentativas até os eventos aparecerem na trilha.
    const actions = await eventuallyAuditActions(server, order.body.id);
    expect(actions).toContain('ORDER_CREATED');
    expect(actions).toContain('ORDER_STATUS_CHANGED');
  });

  async function eventuallyAuditActions(
    server: unknown,
    orderId: string,
    attempts = 10,
  ): Promise<string[]> {
    for (let i = 0; i < attempts; i++) {
      const res = await request(server as never).get(
        `/audit-logs?entityId=${orderId}`,
      );
      const actions = res.body.data.map((l: { action: string }) => l.action);
      if (actions.includes('ORDER_CREATED') && actions.includes('ORDER_STATUS_CHANGED')) {
        return actions;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    return [];
  }
});
