import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditRepository } from './audit.repository';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';

export interface RecordAuditInput {
  action: string;
  entity: string;
  entityId: string;
  previousState?: unknown;
  nextState?: unknown;
  metadata?: Record<string, unknown>;
}

function toJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === undefined || value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  record(input: RecordAuditInput) {
    return this.repository.create({
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      previousState: toJson(input.previousState),
      nextState: toJson(input.nextState),
      metadata: toJson(input.metadata),
    });
  }

  async list(query: ListAuditQueryDto) {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.entity) where.entity = query.entity;
    if (query.entityId) where.entityId = query.entityId;
    if (query.action) where.action = query.action;

    const skip = (query.page - 1) * query.pageSize;
    const { data, total } = await this.repository.findMany(
      where,
      skip,
      query.pageSize,
    );
    return {
      data,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }
}
