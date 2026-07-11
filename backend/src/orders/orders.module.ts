import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { ItemsModule } from '../items/items.module';
import { TransportTypesModule } from '../transport-types/transport-types.module';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Module({
  imports: [ClientsModule, TransportTypesModule, ItemsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
