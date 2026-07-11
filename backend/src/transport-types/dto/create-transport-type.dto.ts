import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTransportTypeDto {
  @ApiProperty({ example: 'Caminhão' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'CAMINHAO', description: 'Identificador estável do tipo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  code: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
