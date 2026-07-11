import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ChangeTransportDto {
  @ApiProperty()
  @IsUUID('4')
  transportTypeId: string;
}
