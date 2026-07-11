import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScheduleOrderDto } from './dto/schedule-order.dto';
import { SchedulingService } from './scheduling.service';

@ApiTags('Central de Agendamento')
@Controller('orders/:id/schedule')
export class SchedulingController {
  constructor(private readonly service: SchedulingService) {}

  @Put()
  schedule(@Param('id') id: string, @Body() dto: ScheduleOrderDto) {
    return this.service.schedule(id, dto);
  }

  @Post('confirm')
  confirm(@Param('id') id: string) {
    return this.service.confirm(id);
  }
}
