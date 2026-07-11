# OVGS - Backend

API REST do Sistema de Gestão de Ordens de Venda (NestJS + Prisma + PostgreSQL).

A documentação completa (arquitetura, modelagem, decisões e trade-offs) está no
[README raiz](../README.md).

## Scripts

```bash
pnpm start:dev          # desenvolvimento (watch)
pnpm prisma migrate dev # criar/aplicar migration
pnpm db:seed            # dados de exemplo
pnpm test               # testes unitários
pnpm test:e2e           # teste de integração (requer Postgres)
```

Swagger em `http://localhost:3333/docs`.
