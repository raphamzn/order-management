import { Injectable } from '@nestjs/common';
import {
  BusinessRuleException,
  EntityNotFoundException,
} from '../shared/exceptions/domain.exception';
import { TransportTypesRepository } from '../transport-types/transport-types.repository';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly repository: ClientsRepository,
    private readonly transportTypes: TransportTypesRepository,
  ) {}

  async create(dto: CreateClientDto) {
    const { authorizedTransportTypeIds = [], ...data } = dto;
    await this.ensureTransportsExist(authorizedTransportTypeIds);
    return this.repository.create(data, authorizedTransportTypeIds);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const client = await this.repository.findById(id);
    if (!client) {
      throw new EntityNotFoundException('Cliente', id);
    }
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }

  async setAuthorizedTransports(id: string, transportTypeIds: string[]) {
    await this.findOne(id);
    await this.ensureTransportsExist(transportTypeIds);
    return this.repository.setAuthorizedTransports(id, transportTypeIds);
  }

  /** Regra central: a OV só nasce se o transporte estiver autorizado para o cliente. */
  async assertTransportAuthorized(clientId: string, transportTypeId: string) {
    const authorized = await this.repository.countAuthorization(
      clientId,
      transportTypeId,
    );
    if (authorized === 0) {
      throw new BusinessRuleException(
        'O tipo de transporte informado não está autorizado para este cliente',
        'TRANSPORT_NOT_AUTHORIZED',
      );
    }
  }

  private async ensureTransportsExist(ids: string[]) {
    if (ids.length === 0) return;
    const unique = [...new Set(ids)];
    const found = await this.transportTypes.findManyByIds(unique);
    if (found.length !== unique.length) {
      const foundIds = new Set(found.map((t) => t.id));
      const missing = unique.filter((id) => !foundIds.has(id));
      throw new BusinessRuleException(
        `Tipos de transporte inexistentes: ${missing.join(', ')}`,
        'TRANSPORT_TYPE_NOT_FOUND',
      );
    }
  }
}
