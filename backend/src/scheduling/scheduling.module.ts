import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { SchedulesRepository } from './schedules.repository';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';

@Module({
  imports: [OrdersModule],
  controllers: [SchedulingController],
  providers: [SchedulingService, SchedulesRepository],
})
export class SchedulingModule {}
