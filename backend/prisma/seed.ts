import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [caminhao, carreta, bitruck] = await Promise.all([
    prisma.transportType.upsert({
      where: { code: 'CAMINHAO' },
      update: {},
      create: { name: 'Caminhão', code: 'CAMINHAO' },
    }),
    prisma.transportType.upsert({
      where: { code: 'CARRETA' },
      update: {},
      create: { name: 'Carreta', code: 'CARRETA' },
    }),
    prisma.transportType.upsert({
      where: { code: 'BITRUCK' },
      update: {},
      create: { name: 'Bi-truck', code: 'BITRUCK' },
    }),
  ]);

  const items = await Promise.all(
    [
      { sku: 'SKU-1001', name: 'Parafuso sextavado M8', unit: 'UN' },
      { sku: 'SKU-1002', name: 'Cimento CP-II 50kg', unit: 'SC' },
      { sku: 'SKU-1003', name: 'Tinta acrílica 18L', unit: 'LT' },
      { sku: 'SKU-1004', name: 'Vergalhão CA-50 12mm', unit: 'BR' },
    ].map((data) =>
      prisma.item.upsert({
        where: { sku: data.sku },
        update: {},
        create: data,
      }),
    ),
  );

  await prisma.client.upsert({
    where: { document: '12.345.678/0001-90' },
    update: {},
    create: {
      name: 'Distribuidora Central Ltda',
      document: '12.345.678/0001-90',
      email: 'contato@central.com.br',
      authorizedTransportTypes: {
        connect: [{ id: caminhao.id }, { id: carreta.id }],
      },
    },
  });

  await prisma.client.upsert({
    where: { document: '98.765.432/0001-10' },
    update: {},
    create: {
      name: 'Construtora Horizonte SA',
      document: '98.765.432/0001-10',
      email: 'compras@horizonte.com.br',
      authorizedTransportTypes: {
        connect: [{ id: bitruck.id }],
      },
    },
  });

  console.log(`Seed concluído: 3 transportes, ${items.length} itens, 2 clientes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
