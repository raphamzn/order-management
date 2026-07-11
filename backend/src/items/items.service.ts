import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../shared/exceptions/domain.exception';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsRepository } from './items.repository';

@Injectable()
export class ItemsService {
  constructor(private readonly repository: ItemsRepository) {}

  create(dto: CreateItemDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new EntityNotFoundException('Item', id);
    }
    return item;
  }
}
