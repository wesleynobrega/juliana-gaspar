# Juliana Gaspar

Chef pessoal e meal prep sob medida — Teresina, PI. Plano alimentar personalizado (com orientação de profissional de saúde ou experiência da chef), sessões de meal prep na casa do cliente ou na cozinha da chef, e configuração de preços centralizada.

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
