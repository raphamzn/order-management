import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class SetAuthorizedTransportsDto {
  @ApiProperty({
    type: [String],
    description: 'Conjunto completo de tipos de transporte autorizados (substitui o atual)',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  transportTypeIds: string[];
}
