# Juliana Gaspar

Plataforma de comida artesanal por assinatura — Teresina, PI.

## Setup

```bash
# Instalar dependências
pnpm install

# Iniciar banco de dados
pnpm docker:up

# Rodar migrations e seed
pnpm db:migrate
pnpm db:seed

# Iniciar desenvolvimento
pnpm dev
```

## Estrutura

- `apps/web/` — Next.js (landing page + painel admin)
- `apps/api/` — NestJS (API REST)
- `packages/contracts/` — Schemas Zod e tipos compartilhados
- `packages/database/` — Prisma schema e migrations
