import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../shared/exceptions/domain.exception';
import { CreateTransportTypeDto } from './dto/create-transport-type.dto';
import { UpdateTransportTypeDto } from './dto/update-transport-type.dto';
import { TransportTypesRepository } from './transport-types.repository';

@Injectable()
export class TransportTypesService {
  constructor(private readonly repository: TransportTypesRepository) {}

  create(dto: CreateTransportTypeDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const transportType = await this.repository.findById(id);
    if (!transportType) {
      throw new EntityNotFoundException('Tipo de transporte', id);
    }
    return transportType;
  }

  async update(id: string, dto: UpdateTransportTypeDto) {
    await this.findOne(id);
    return this.repository.update(id, dto);
  }
}
