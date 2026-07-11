import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemInput {
  @ApiProperty({ description: 'ID de um item previamente cadastrado' })
  @IsUUID('4')
  itemId: string;

  @ApiProperty({ minimum: 1, example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID('4')
  clientId: string;

  @ApiProperty()
  @IsUUID('4')
  transportTypeId: string;

  @ApiProperty({ type: [OrderItemInput], description: 'Ao menos um item' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];
}
