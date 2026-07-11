import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { AuditModule } from './audit/audit.module';
import { ClientsModule } from './clients/clients.module';
import { HealthModule } from './health/health.module';
import { ItemsModule } from './items/items.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { TransportTypesModule } from './transport-types/transport-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true } },
      },
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    TransportTypesModule,
    ItemsModule,
    ClientsModule,
    OrdersModule,
    SchedulingModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
