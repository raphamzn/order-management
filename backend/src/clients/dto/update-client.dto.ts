import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

/**
 * A lista de transportes autorizados é gerenciada por endpoint próprio,
 * então fica de fora da edição de dados cadastrais.
 */
export class UpdateClientDto extends PartialType(
  OmitType(CreateClientDto, ['authorizedTransportTypeIds'] as const),
) {}
