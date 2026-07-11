import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, Matches } from 'class-validator';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ScheduleOrderDto {
  @ApiProperty({ example: '2026-08-01', description: 'Data da entrega (ISO 8601)' })
  @IsISO8601()
  deliveryDate: string;

  @ApiProperty({ example: '08:00', description: 'Início da janela de atendimento (HH:mm)' })
  @Matches(HHMM, { message: 'windowStart deve estar no formato HH:mm' })
  windowStart: string;

  @ApiProperty({ example: '12:00', description: 'Fim da janela de atendimento (HH:mm)' })
  @Matches(HHMM, { message: 'windowEnd deve estar no formato HH:mm' })
  windowEnd: string;
}
