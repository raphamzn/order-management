import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'SKU-1001', description: 'Identificador único do item' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  sku: string;

  @ApiProperty({ example: 'Parafuso sextavado M8' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ required: false, example: 'UN' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  unit?: string;
}
