# OVGS - Sistema de Gestão de Ordens de Venda

Plataforma para gerenciar o ciclo de vida de Ordens de Venda (OVs): cadastros,
criação e acompanhamento das ordens, central de agendamento e trilha de auditoria.

O repositório é dividido em dois projetos independentes:

```
.
|-- backend/      API REST em NestJS + Prisma + PostgreSQL
|-- frontend/     Interface em Next.js + Tailwind
`-- docker-compose.yml
```

## Como rodar

Pré-requisito: Docker e Docker Compose.

```bash
docker compose up --build
```

Isso sobe três serviços:

| Serviço | URL                          | Descrição                          |
| ------- | ---------------------------- | ---------------------------------- |
| web     | http://localhost:3000        | Interface                          |
| api     | http://localhost:3333        | API REST                           |
| api     | http://localhost:3333/docs   | Documentação Swagger/OpenAPI       |
| db      | localhost:5432               | PostgreSQL                         |

A API aplica as migrations e insere dados de exemplo (transportes, itens e
clientes) automaticamente na subida - o seed é idempotente.

### Rodando localmente sem Docker

```bash
# banco
docker compose up -d db

# backend
cd backend
cp .env.example .env
pnpm install
pnpm prisma migrate deploy
pnpm db:seed
pnpm start:dev            # http://localhost:3333

# frontend (em outro terminal)
cd frontend
pnpm install
pnpm dev                 # http://localhost:3000
```

## Stack

**Backend:** Node.js, TypeScript, NestJS, Prisma, PostgreSQL, class-validator,
`@nestjs/swagger`, `@nestjs/event-emitter`, pino, Jest.

**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, React Query,
Redux Toolkit, Redux-Saga, React Hook Form, Zod, Axios.

## Domínio e regras de negócio

- **Cliente** possui uma lista de tipos de transporte autorizados.
- **Tipo de Transporte** é um cadastro extensível - novas modalidades entram sem
  alterar regra existente (não há `enum` de transporte no código).
- **Item** tem identificador único (SKU) e é premissa que exista antes da OV.
- **Ordem de Venda** referencia um cliente, exatamente um tipo de transporte e
  ao menos um item.

Regras aplicadas no domínio:

1. A OV só é criada se o transporte informado estiver **autorizado para aquele
   cliente** (`ClientsService.assertTransportAuthorized`).
2. Itens precisam existir previamente e não podem se repetir na mesma OV.
3. O status segue uma máquina de estados estrita.
4. Avançar para `AGENDADA` exige um agendamento **confirmado**.
5. Transporte e agendamento só podem ser alterados antes de a OV sair para
   entrega (`EM_TRANSPORTE`/`ENTREGUE` travam a edição).

### Fluxo operacional (máquina de estados)

```
CRIADA -> PLANEJADA -> AGENDADA -> EM_TRANSPORTE -> ENTREGUE
```

As transições válidas ficam concentradas em um único mapa
(`backend/src/orders/domain/order-status.ts`), consumido pelo service. Qualquer
transição fora da sequência é rejeitada com `409 Conflict` e código
`INVALID_STATE_TRANSITION`.

## Decisões de arquitetura

**Camadas.** Cada módulo do backend segue `Controller -> Service -> Repository`,
com DTOs validados na borda e regras de negócio isoladas no service. A máquina de
estados é domínio puro (sem dependência de NestJS ou Prisma), o que a torna
trivial de testar e reutilizar.

**Persistência.** Prisma sobre PostgreSQL. Optei por encapsular o acesso ao
Prisma em classes `Repository` por agregado em vez de injetar o `PrismaService`
direto nos services: mantém a camada de persistência trocável e os services
livres de detalhes de query. Relacionamentos: `Client`<->`TransportType` é
many-to-many (autorizações); `Order` tem `OrderItem` (com quantidade) e um
`Schedule` opcional (1:1). Índices foram criados nas colunas usadas pelos
filtros de monitoramento (`status`, `clientId`, `transportTypeId`, `createdAt`).

**Auditoria orientada a eventos.** Em vez de a auditoria ser chamada dentro de
cada regra, os services emitem eventos de domínio (`order.created`,
`order.status-changed`, `order.scheduled`, `order.transport-changed`) via
`@nestjs/event-emitter`. Um `AuditListener` consome esses eventos e materializa a
trilha (`AuditLog` com ação, entidade, estado anterior e posterior). A gravação é
best-effort: uma falha na auditoria é logada, mas não derruba a operação de
negócio. Isso desacopla a auditoria e deixa espaço para novos consumidores dos
mesmos eventos.

**Tratamento de erros.** Erros de negócio herdam de `DomainException` (com o
status HTTP correspondente) e são traduzidos por um `ExceptionFilter`. Erros
conhecidos do Prisma (unicidade, FK, registro inexistente) têm filtro próprio,
com mapeamento para 409/422/404.

**Observabilidade.** Logs estruturados com pino (`nestjs-pino`) e health check em
`/health` (verifica a conexão com o banco via `@nestjs/terminus`).

### Frontend - estado

Cada biblioteca de estado cobre uma responsabilidade:

- **React Query** - estado de servidor (clientes, transportes, itens, ordens,
  auditoria): cache, revalidação e mutations.
- **Redux Toolkit** - estado de cliente: filtros do monitoramento, o wizard de
  criação de OV e os toasts.
- **Redux-Saga** - efeitos multi-step: a transição de status e a confirmação de
  agendamento (com a OV em `PLANEJADA`, confirmar já a avança para `AGENDADA`
  numa ação). A saga chama a API, invalida as queries do React Query e dispara os
  toasts.
- **React Hook Form + Zod** - formulários e validação.

As páginas rodam no cliente (`"use client"`) - é um painel operacional interno,
sem necessidade de SSR/SEO.

## API

Endpoints principais (documentação completa em `/docs`):

| Método | Rota                              | Descrição                          |
| ------ | --------------------------------- | ---------------------------------- |
| POST   | `/clients`                        | Criar cliente                      |
| PUT    | `/clients/:id/authorized-transports` | Definir transportes autorizados |
| POST   | `/transport-types`                | Criar tipo de transporte           |
| POST   | `/items`                          | Criar item                         |
| POST   | `/orders`                         | Criar OV                           |
| GET    | `/orders`                         | Listar OVs (filtros + paginação)   |
| GET    | `/orders/:id`                     | Detalhar OV                        |
| PATCH  | `/orders/:id/status`              | Atualizar status                   |
| PATCH  | `/orders/:id/transport`           | Alterar transporte                 |
| PUT    | `/orders/:id/schedule`            | Agendar/reagendar entrega          |
| POST   | `/orders/:id/schedule/confirm`    | Confirmar agendamento              |
| GET    | `/audit-logs`                     | Consultar trilha de auditoria      |

O monitoramento (`GET /orders`) aceita `status`, `clientId`, `transportTypeId`,
`dateFrom`, `dateTo`, `page` e `pageSize`.

## Testes

```bash
cd backend  && pnpm test        # unitários
cd backend  && pnpm test:e2e    # integração (requer o Postgres no ar)
cd frontend && pnpm test        # unitários (Vitest)
```

- **Backend - unitários:** máquina de estados, regra de autorização de
  transporte e validações da criação de OV.
- **Backend - integração:** cria uma OV de ponta a ponta contra o banco,
  bloqueia uma transição inválida e verifica a trilha de auditoria.
- **Frontend - unitários:** slices do Redux (wizard e filtros) e helpers de
  domínio do fluxo de status.

## Escalabilidade e performance

- A listagem de ordens é paginada e usa índices nas colunas filtradas.
- As contagens de `$transaction` (dados + total) evitam round-trips extras.
- A auditoria é assíncrona ao fluxo principal (event-driven), então não adiciona
  latência às operações de negócio.
- O React Query faz cache e revalidação por chave, reduzindo requisições
  repetidas na navegação.
- Para escalar horizontalmente, a API é stateless; o event-emitter é in-process
  e poderia ser trocado por um broker (ex.: RabbitMQ/Kafka) mantendo o
  `AuditListener` como consumidor.

## Trade-offs assumidos

- **Código da OV sequencial (`OV-00001`) por contagem.** Simples e legível; sob
  altíssima concorrência de criação daria pra trocar por uma sequence dedicada no
  banco.
- **Regras de disponibilidade do agendamento simplificadas.** Valida-se a janela
  (início < fim) e o estado da OV, sem calendário de capacidade.
- **Auditoria best-effort.** Prioriza não bloquear a operação de negócio; para
  auditoria com garantia transacional, o listener poderia participar da mesma
  transação - ao custo de acoplamento.
- **Sem autenticação.** A API é stateless e comportaria um guard JWT sem mudança
  estrutural, caso necessário.
- **Frontend client-side.** Troca SSR/SEO (desnecessários num painel interno) por
  simplicidade na orquestração de estado.
