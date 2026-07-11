import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Distribuidora Central Ltda' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ required: false, example: '12.345.678/0001-90' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  document?: string;

  @ApiProperty({ required: false, example: 'contato@central.com.br' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'IDs dos tipos de transporte autorizados para o cliente',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  authorizedTransportTypeIds?: string[];
}
