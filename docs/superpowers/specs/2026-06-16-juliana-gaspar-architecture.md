# Juliana Gaspar — Especificação de Arquitetura

**Versão:** 1.0 — Implementation-Ready
**Data:** 2026-06-16
**Stack:** Next.js 15 + NestJS 11 + Prisma + PostgreSQL + Turborepo + pnpm
**Direção Visual:** Oliva & Botânico (verdes naturais + creme)
**Paradigma:** Mobile-first (320px baseline)

---

## Seção 1 — Árvore Completa do Monorepo

```
juliana-gaspar/
├── apps/
│   ├── web/                          # Next.js 15 App Router
│   │   ├── app/
│   │   │   ├── (landing)/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   └── not-found.tsx
│   │   │   ├── (admin)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── catalogo/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [dishId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── pedidos/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [orderId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── clientes/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [customerId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── ciclos/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [cycleId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── pagamentos/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── entregas/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── producao/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── assinaturas/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── relatorios/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── configuracoes/
│   │   │   │       └── page.tsx
│   │   │   └── api/                  # Next.js API routes (proxies NestJS)
│   │   │       └── [...]catch-all/
│   │   │           └── route.ts
│   │   │
│   │   ├── features/
│   │   │   ├── landing/
│   │   │   │   ├── components/
│   │   │   │   │   ├── hero.tsx
│   │   │   │   │   ├── como-funciona.tsx
│   │   │   │   │   ├── cardapio-semanal.tsx
│   │   │   │   │   ├── cardapio-card.tsx
│   │   │   │   │   ├── diferenciais.tsx
│   │   │   │   │   ├── depoimentos.tsx
│   │   │   │   │   ├── depoimento-card.tsx
│   │   │   │   │   ├── faq.tsx
│   │   │   │   │   ├── faq-item.tsx
│   │   │   │   │   ├── cta-section.tsx
│   │   │   │   │   └── footer.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── use-intersection-observer.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── landing.service.ts
│   │   │   │   └── types/
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── kpi-cards.tsx
│   │   │   │   │   │   ├── receita-chart.tsx
│   │   │   │   │   │   └── pedidos-recentes.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── use-dashboard.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── dashboard.service.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   ├── catalogo/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── pratos-lista.tsx
│   │   │   │   │   │   ├── prato-card.tsx
│   │   │   │   │   │   ├── prato-form.tsx
│   │   │   │   │   │   ├── prato-form-passo-1.tsx
│   │   │   │   │   │   ├── prato-form-passo-2.tsx
│   │   │   │   │   │   ├── prato-image-upload.tsx
│   │   │   │   │   │   └── filtros-catalogo.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── use-catalogo.ts
│   │   │   │   │   │   └── use-prato-form.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── prato.schema.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── catalogo.service.ts
│   │   │   │   │   ├── actions/
│   │   │   │   │   │   └── catalogo.actions.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   ├── pedidos/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── pedidos-lista.tsx
│   │   │   │   │   │   ├── pedidos-tabela.tsx
│   │   │   │   │   │   ├── pedido-card.tsx
│   │   │   │   │   │   ├── pedido-detalhes-sheet.tsx
│   │   │   │   │   │   ├── pedido-status-badge.tsx
│   │   │   │   │   │   ├── pedido-status-select.tsx
│   │   │   │   │   │   ├── filtros-pedidos.tsx
│   │   │   │   │   │   └── pedido-empty-state.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── use-pedidos.ts
│   │   │   │   │   │   └── use-pedido-filtros.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── pedido.schema.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── pedidos.service.ts
│   │   │   │   │   ├── actions/
│   │   │   │   │   │   └── pedidos.actions.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   ├── clientes/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── clientes-lista.tsx
│   │   │   │   │   │   ├── cliente-card.tsx
│   │   │   │   │   │   ├── cliente-detalhes-sheet.tsx
│   │   │   │   │   │   ├── cliente-form.tsx
│   │   │   │   │   │   └── cliente-historico.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── use-clientes.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── cliente.schema.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── clientes.service.ts
│   │   │   │   │   ├── actions/
│   │   │   │   │   │   └── clientes.actions.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   ├── pagamentos/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── pagamentos-lista.tsx
│   │   │   │   │   │   ├── pagamento-card.tsx
│   │   │   │   │   │   ├── pagamento-registro-form.tsx
│   │   │   │   │   │   └── reconciliacao-view.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── use-pagamentos.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── pagamento.schema.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── pagamentos.service.ts
│   │   │   │   │   ├── actions/
│   │   │   │   │   │   └── pagamentos.actions.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   ├── ciclos/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ciclos-lista.tsx
│   │   │   │   │   │   ├── ciclo-card.tsx
│   │   │   │   │   │   ├── ciclo-form.tsx
│   │   │   │   │   │   ├── ciclo-dashboard.tsx
│   │   │   │   │   │   └── ciclo-pratos-select.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── use-ciclos.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── ciclo.schema.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── ciclos.service.ts
│   │   │   │   │   ├── actions/
│   │   │   │   │   │   └── ciclos.actions.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   ├── entregas/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── entregas-lista.tsx
│   │   │   │   │   │   ├── entrega-card.tsx
│   │   │   │   │   │   ├── zona-form.tsx
│   │   │   │   │   │   └── rota-manifesto.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── use-entregas.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── entrega.schema.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── entregas.service.ts
│   │   │   │   │   ├── actions/
│   │   │   │   │   │   └── entregas.actions.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   ├── producao/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── producao-lista.tsx
│   │   │   │   │   │   ├── producao-mapa-montagem.tsx
│   │   │   │   │   │   ├── producao-consolidado.tsx
│   │   │   │   │   │   └── producao-etiquetas.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── use-producao.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── producao.service.ts
│   │   │   │   │   ├── actions/
│   │   │   │   │   │   └── producao.actions.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   └── assinaturas/
│   │   │   │       ├── components/
│   │   │   │       │   ├── assinaturas-lista.tsx
│   │   │   │       │   ├── assinatura-card.tsx
│   │   │   │       │   └── assinatura-acoes.tsx
│   │   │   │       ├── hooks/
│   │   │   │       │   └── use-assinaturas.ts
│   │   │   │       ├── schemas/
│   │   │   │       │   └── assinatura.schema.ts
│   │   │   │       ├── services/
│   │   │   │       │   └── assinaturas.service.ts
│   │   │   │       ├── actions/
│   │   │   │       │   └── assinaturas.actions.ts
│   │   │   │       └── types/
│   │   │   │           └── index.ts
│   │   │   │
│   │   │   └── customer/           # Futura área do cliente (Phase 2+)
│   │   │       └── (placeholder)
│   │   │
│   │   ├── components/
│   │   │   └── ui/                 # shadcn/ui + overrides
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── select.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── drawer.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── toast.tsx
│   │   │       ├── sonner.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── accordion.tsx
│   │   │       ├── command.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── tooltip.tsx
│   │   │       ├── label.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── form.tsx
│   │   │       ├── table.tsx
│   │   │       ├── pagination.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── data-table.tsx       # Generic table with card fallback
│   │   │       ├── empty-state.tsx
│   │   │       ├── confirm-dialog.tsx
│   │   │       ├── whatsapp-button.tsx
│   │   │       └── image-upload.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.ts              # cn(), formatDate(), formatCurrency()
│   │   │   ├── auth-client.ts        # NextAuth / JWT client helpers
│   │   │   ├── api-client.ts         # fetch wrapper with auth header
│   │   │   ├── formatters.ts         # formatPhone(), formatCPF(), etc.
│   │   │   ├── validators.ts         # Generic Zod helpers
│   │   │   ├── constants.ts          # App-wide constants
│   │   │   └── hooks/
│   │   │       ├── use-media-query.ts
│   │   │       ├── use-toast.ts
│   │   │       └── use-debounce.ts
│   │   │
│   │   ├── server/
│   │   │   ├── auth.ts               # Auth config (NextAuth v5)
│   │   │   ├── db.ts                 # Prisma client singleton
│   │   │   └── cloudinary.ts         # Cloudinary server helpers
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css           # Tailwind + design tokens
│   │   │
│   │   ├── public/
│   │   │   ├── images/
│   │   │   │   ├── logo.svg
│   │   │   │   ├── hero-bg.webp
│   │   │   │   ├── og-image.jpg
│   │   │   │   └── placeholder-food.jpg
│   │   │   └── favicon.ico
│   │   │
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # NestJS 11
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   │   ├── roles.decorator.ts
│       │   │   │   └── current-user.decorator.ts
│       │   │   ├── guards/
│       │   │   │   ├── jwt-auth.guard.ts
│       │   │   │   └── roles.guard.ts
│       │   │   ├── filters/
│       │   │   │   └── http-exception.filter.ts
│       │   │   ├── interceptors/
│       │   │   │   └── transform.interceptor.ts
│       │   │   └── pipes/
│       │   │       └── zod-validation.pipe.ts
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── login.dto.ts
│       │   │   │   │   └── register.dto.ts
│       │   │   │   └── strategies/
│       │   │   │       └── jwt.strategy.ts
│       │   │   ├── catalog/
│       │   │   │   ├── catalog.module.ts
│       │   │   │   ├── catalog.controller.ts
│       │   │   │   ├── catalog.service.ts
│       │   │   │   └── dto/
│       │   │   │       ├── create-dish.dto.ts
│       │   │   │       └── update-dish.dto.ts
│       │   │   ├── orders/
│       │   │   │   ├── orders.module.ts
│       │   │   │   ├── orders.controller.ts
│       │   │   │   ├── orders.service.ts
│       │   │   │   └── dto/
│       │   │   │       ├── create-order.dto.ts
│       │   │   │       └── update-order.dto.ts
│       │   │   ├── cycles/
│       │   │   │   ├── cycles.module.ts
│       │   │   │   ├── cycles.controller.ts
│       │   │   │   ├── cycles.service.ts
│       │   │   │   └── dto/
│       │   │   ├── customers/
│       │   │   │   ├── customers.module.ts
│       │   │   │   ├── customers.controller.ts
│       │   │   │   ├── customers.service.ts
│       │   │   │   └── dto/
│       │   │   ├── payments/
│       │   │   │   ├── payments.module.ts
│       │   │   │   ├── payments.controller.ts
│       │   │   │   ├── payments.service.ts
│       │   │   │   └── dto/
│       │   │   ├── delivery/
│       │   │   │   ├── delivery.module.ts
│       │   │   │   ├── delivery.controller.ts
│       │   │   │   ├── delivery.service.ts
│       │   │   │   └── dto/
│       │   │   ├── subscriptions/
│       │   │   │   ├── subscriptions.module.ts
│       │   │   │   ├── subscriptions.controller.ts
│       │   │   │   ├── subscriptions.service.ts
│       │   │   │   └── dto/
│       │   │   ├── production/
│       │   │   │   ├── production.module.ts
│       │   │   │   ├── production.controller.ts
│       │   │   │   ├── production.service.ts
│       │   │   │   └── dto/
│       │   │   ├── inventory/
│       │   │   │   ├── inventory.module.ts
│       │   │   │   ├── inventory.controller.ts
│       │   │   │   ├── inventory.service.ts
│       │   │   │   └── dto/
│       │   │   └── reports/
│       │   │       ├── reports.module.ts
│       │   │       ├── reports.controller.ts
│       │   │       └── reports.service.ts
│       │   └── integrations/
│       │       ├── whatsapp/
│       │       │   └── whatsapp.interface.ts
│       │       ├── payment/
│       │       │   └── payment-gateway.interface.ts
│       │       └── email/
│       │           ├── email.interface.ts
│       │           └── mock-email.service.ts
│       ├── prisma/
│       │   └── seed.ts
│       ├── test/
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── contracts/                    # Zod schemas + TypeScript DTOs
│   │   ├── src/
│   │   │   ├── dish.schema.ts
│   │   │   ├── order.schema.ts
│   │   │   ├── customer.schema.ts
│   │   │   ├── cycle.schema.ts
│   │   │   ├── payment.schema.ts
│   │   │   ├── subscription.schema.ts
│   │   │   ├── delivery.schema.ts
│   │   │   ├── ingredient.schema.ts
│   │   │   ├── recipe.schema.ts
│   │   │   ├── auth.schema.ts
│   │   │   ├── common.schema.ts       # PaginatedResponse<T>, ApiError, etc.
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── database/                     # Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   └── index.ts              # Prisma client export
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                       # Shared tooling config
│       ├── eslint/
│       │   ├── base.js
│       │   ├── next.js
│       │   └── nest.js
│       ├── tsconfig/
│       │   ├── base.json
│       │   ├── next.json
│       │   └── nest.json
│       └── prettier.config.js
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── scripts/
│   ├── setup.sh
│   └── db-reset.sh
│
├── .env.example
├── .gitignore
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Seção 2 — Árvore Completa de `apps/web`

```
apps/web/
├── app/
│   ├── (landing)/
│   │   ├── page.tsx                  # importa features/landing/components/*
│   │   ├── layout.tsx                # Header + Footer públicos, meta tags
│   │   ├── loading.tsx               # Skeleton full-page
│   │   ├── error.tsx                 # Erro genérico com CTA
│   │   └── not-found.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                # Sidebar/Drawer + header + proteção auth
│   │   ├── loading.tsx               # Skeleton do painel
│   │   ├── error.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx              # → features/admin/dashboard
│   │   ├── catalogo/
│   │   │   ├── page.tsx              # → features/admin/catalogo
│   │   │   └── [dishId]/
│   │   │       └── page.tsx          # → features/admin/catalogo (edição)
│   │   ├── pedidos/
│   │   │   ├── page.tsx              # → features/admin/pedidos
│   │   │   └── [orderId]/
│   │   │       └── page.tsx          # → features/admin/pedidos (detalhe)
│   │   ├── clientes/
│   │   │   ├── page.tsx
│   │   │   └── [customerId]/
│   │   │       └── page.tsx
│   │   ├── ciclos/
│   │   │   ├── page.tsx
│   │   │   └── [cycleId]/
│   │   │       └── page.tsx
│   │   ├── pagamentos/
│   │   │   └── page.tsx
│   │   ├── entregas/
│   │   │   └── page.tsx
│   │   ├── producao/
│   │   │   └── page.tsx
│   │   ├── assinaturas/
│   │   │   └── page.tsx
│   │   ├── relatorios/
│   │   │   └── page.tsx
│   │   └── configuracoes/
│   │       └── page.tsx
│   └── api/                          # Proxy reverso para NestJS
│       └── [...route]/
│           └── route.ts
│
├── features/
│   ├── landing/
│   │   ├── components/
│   │   │   ├── hero.tsx
│   │   │   ├── como-funciona.tsx
│   │   │   ├── cardapio-semanal.tsx
│   │   │   ├── cardapio-card.tsx
│   │   │   ├── diferenciais.tsx
│   │   │   ├── depoimentos.tsx
│   │   │   ├── depoimento-card.tsx
│   │   │   ├── faq.tsx
│   │   │   ├── faq-item.tsx
│   │   │   ├── cta-section.tsx
│   │   │   └── footer.tsx
│   │   ├── hooks/use-intersection-observer.ts
│   │   ├── services/landing.service.ts
│   │   └── types/index.ts
│   │
│   └── admin/
│       ├── dashboard/
│       │   ├── components/ (kpi-cards, receita-chart, pedidos-recentes)
│       │   ├── hooks/use-dashboard.ts
│       │   ├── services/dashboard.service.ts
│       │   └── types/index.ts
│       ├── catalogo/
│       │   ├── components/ (pratos-lista, prato-card, prato-form, ...)
│       │   ├── hooks/ (use-catalogo, use-prato-form)
│       │   ├── schemas/prato.schema.ts
│       │   ├── services/catalogo.service.ts
│       │   ├── actions/catalogo.actions.ts
│       │   └── types/index.ts
│       ├── pedidos/
│       │   ├── components/ (pedidos-lista, pedidos-tabela, pedido-card, ...)
│       │   ├── hooks/ (use-pedidos, use-pedido-filtros)
│       │   ├── schemas/pedido.schema.ts
│       │   ├── services/pedidos.service.ts
│       │   ├── actions/pedidos.actions.ts
│       │   └── types/index.ts
│       ├── clientes/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── schemas/cliente.schema.ts
│       │   ├── services/clientes.service.ts
│       │   ├── actions/clientes.actions.ts
│       │   └── types/index.ts
│       ├── pagamentos/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── schemas/pagamento.schema.ts
│       │   ├── services/pagamentos.service.ts
│       │   ├── actions/pagamentos.actions.ts
│       │   └── types/index.ts
│       ├── ciclos/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── schemas/ciclo.schema.ts
│       │   ├── services/ciclos.service.ts
│       │   ├── actions/ciclos.actions.ts
│       │   └── types/index.ts
│       ├── entregas/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── schemas/entrega.schema.ts
│       │   ├── services/entregas.service.ts
│       │   ├── actions/entregas.actions.ts
│       │   └── types/index.ts
│       ├── producao/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── services/producao.service.ts
│       │   ├── actions/producao.actions.ts
│       │   └── types/index.ts
│       └── assinaturas/
│           ├── components/
│           ├── hooks/
│           ├── schemas/assinatura.schema.ts
│           ├── services/assinaturas.service.ts
│           ├── actions/assinaturas.actions.ts
│           └── types/index.ts
│
├── components/
│   └── ui/
│       ├── primitives/               # shadcn/ui primitives
│       │   ├── button.tsx
│       │   ├── input.tsx
│       │   ├── textarea.tsx
│       │   ├── select.tsx
│       │   ├── checkbox.tsx
│       │   ├── radio-group.tsx
│       │   ├── switch.tsx
│       │   ├── label.tsx
│       │   ├── badge.tsx
│       │   ├── avatar.tsx
│       │   ├── separator.tsx
│       │   ├── skeleton.tsx
│       │   ├── tooltip.tsx
│       │   ├── calendar.tsx
│       │   └── scroll-area.tsx
│       ├── layout/
│       │   ├── card.tsx
│       │   ├── tabs.tsx
│       │   └── accordion.tsx
│       ├── overlay/
│       │   ├── dialog.tsx
│       │   ├── sheet.tsx
│       │   ├── drawer.tsx
│       │   ├── popover.tsx
│       │   ├── dropdown-menu.tsx
│       │   └── command.tsx
│       ├── data/
│       │   ├── table.tsx
│       │   ├── data-table.tsx
│       │   ├── pagination.tsx
│       │   └── empty-state.tsx
│       ├── form/
│       │   ├── form.tsx
│       │   └── image-upload.tsx
│       ├── feedback/
│       │   ├── toast.tsx
│       │   ├── sonner.tsx
│       │   └── confirm-dialog.tsx
│       └── brand/
│           └── whatsapp-button.tsx
│
├── lib/
│   ├── utils.ts
│   ├── api-client.ts
│   ├── auth-client.ts
│   ├── formatters.ts
│   ├── constants.ts
│   └── hooks/
│       ├── use-media-query.ts
│       ├── use-debounce.ts
│       └── use-intersection-observer.ts
│
├── server/
│   ├── auth.ts
│   ├── db.ts
│   └── cloudinary.ts
│
├── styles/
│   └── globals.css
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero-bg.webp
│   │   └── og-image.jpg
│   └── favicon.ico
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Regra de ouro:** `app/` importa de `features/`. `features/` importa de `components/ui/` e `lib/`. Features NUNCA importam de outras features diretamente. Se duas features precisam compartilhar algo, ou vai para `components/ui/` (se for visual genérico) ou para `lib/` (se for lógica reutilizável).

---

## Seção 3 — Exemplo Concreto: Feature `orders`

### 3.1 — Barrels e Exports

```typescript
// features/admin/pedidos/index.ts
export { PedidosLista } from './components/pedidos-lista';
export { PedidosTabela } from './components/pedidos-tabela';
export { PedidoCard } from './components/pedido-card';
export { PedidoDetalhesSheet } from './components/pedido-detalhes-sheet';
export { usePedidos } from './hooks/use-pedidos';
export { usePedidoFiltros } from './hooks/use-pedido-filtros';
export type { Pedido, PedidoStatus, PedidoFilter } from './types';
```

### 3.2 — types/index.ts

```typescript
import type { PedidoStatus, PaymentStatus, PlanType } from '@juliana-gaspar/contracts';

export type PedidoFilter = {
  status?: PedidoStatus[];
  paymentStatus?: PaymentStatus[];
  planType?: PlanType;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
};

export type PedidoListItem = {
  id: string;
  customerName: string;
  customerPhone: string;
  planType: PlanType;
  status: PedidoStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  deliveryDate: string;
  createdAt: string;
};

// Exported for use in pages
export type { PedidoStatus, PaymentStatus, PlanType };
```

### 3.3 — schemas/pedido.schema.ts (forms internos do admin — DTO de API usa contracts)

```typescript
import { z } from 'zod';

// Status update form (admin-only)
export const pedidoStatusSchema = z.object({
  status: z.enum([
    'PENDING', 'CONFIRMED', 'IN_PRODUCTION',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
  ], { required_error: 'Selecione o novo status' }),
  notes: z.string().max(500, 'Máximo de 500 caracteres').optional(),
});

export type PedidoStatusForm = z.infer<typeof pedidoStatusSchema>;

// Payment registration form
export const pagamentoRegistroSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['PIX', 'CREDIT_CARD', 'PAYMENT_LINK']),
  amount: z.number().positive('Valor deve ser positivo'),
  paidAt: z.date().optional(),
});

export type PagamentoRegistroForm = z.infer<typeof pagamentoRegistroSchema>;
```

### 3.4 — services/pedidos.service.ts

```typescript
import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse } from '@juliana-gaspar/contracts';
import type { PedidoListItem, PedidoFilter } from '../types';

const BASE = '/api/orders';

export const pedidosService = {
  list: async (filters: PedidoFilter, page = 1, limit = 20) => {
    return apiClient.get<PaginatedResponse<PedidoListItem>>(BASE, {
      params: { ...filters, page, limit },
    });
  },

  getById: async (id: string) => {
    return apiClient.get<PedidoListItem>(`${BASE}/${id}`);
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    return apiClient.patch(`${BASE}/${id}/status`, { status, notes });
  },
};
```

### 3.5 — hooks/use-pedidos.ts

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { pedidosService } from '../services/pedidos.service';
import type { PedidoListItem, PedidoFilter } from '../types';

type UsePedidosReturn = {
  pedidos: PedidoListItem[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refetch: () => void;
};

export function usePedidos(filters: PedidoFilter): UsePedidosReturn {
  const [pedidos, setPedidos] = useState<PedidoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await pedidosService.list(filters, page, limit);
      setPedidos(res.data);
      setTotal(res.total);
    } catch (e) {
      setError('Erro ao carregar pedidos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    pedidos,
    isLoading,
    error,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    setPage,
    refetch: fetch,
  };
}
```

### 3.6 — components/pedido-card.tsx

```typescript
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PedidoStatusBadge } from './pedido-status-badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { PedidoListItem } from '../types';

type PedidoCardProps = {
  pedido: PedidoListItem;
  onPress: (id: string) => void;
};

// statusToVariant mapeia cada status a uma cor de badge
const paymentBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  PAID: 'success',
  PENDING: 'warning',
  OVERDUE: 'destructive',
  REFUNDED: 'default',
};

export function PedidoCard({ pedido, onPress }: PedidoCardProps) {
  return (
    <Card
      className="cursor-pointer active:bg-muted/50 min-h-[88px] transition-colors"
      onClick={() => onPress(pedido.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onPress(pedido.id); }}
    >
      <CardContent className="p-4 space-y-2">
        {/* Linha 1: Nome + Status */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">{pedido.customerName}</h3>
          <PedidoStatusBadge status={pedido.status} />
        </div>

        {/* Linha 2: Info resumida */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{pedido.itemCount} {pedido.itemCount === 1 ? 'prato' : 'pratos'}</span>
          <Badge variant={paymentBadgeVariant[pedido.paymentStatus]}>
            {pedido.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
          </Badge>
        </div>

        {/* Linha 3: Valor + Data */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-sm">{formatCurrency(pedido.totalAmount)}</span>
          <span className="text-muted-foreground">{formatDate(pedido.deliveryDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.7 — components/pedidos-lista.tsx

```typescript
'use client';

import { usePedidos } from '../hooks/use-pedidos';
import { PedidoCard } from './pedido-card';
import { PedidosTabela } from './pedidos-tabela';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import type { PedidoFilter } from '../types';

type PedidosListaProps = {
  filters: PedidoFilter;
  onSelectPedido: (id: string) => void;
};

export function PedidosLista({ filters, onSelectPedido }: PedidosListaProps) {
  const { pedidos, isLoading, error } = usePedidos(filters);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (error) {
    return <EmptyState icon="alert-triangle" title="Erro ao carregar" description={error} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-3 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="Nenhum pedido encontrado"
        description="Ajuste os filtros ou aguarde novos pedidos."
      />
    );
  }

  // Mobile: cards | Desktop: tabela
  if (!isDesktop) {
    return (
      <div className="space-y-3 px-4">
        {pedidos.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} onPress={onSelectPedido} />
        ))}
      </div>
    );
  }

  return <PedidosTabela pedidos={pedidos} onSelect={onSelectPedido} />;
}
```

### 3.8 — Página `app/(admin)/pedidos/page.tsx`

```typescript
// ⚠️ APENAS orquestração. Zero lógica de negócio.
import { PedidosLista } from '@/features/admin/pedidos';
import { PedidoDetalhesSheet } from '@/features/admin/pedidos';
import { FiltrosPedidos } from '@/features/admin/pedidos';

export default function PedidosPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 border-b">
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>
      <FiltrosPedidos />
      <PedidosLista />
      <PedidoDetalhesSheet />
    </div>
  );
}
```

---

## Seção 4 — Regras de Decisão por Camada

### 4.1 — `components/ui/`

**Coloque aqui quando:**
- O componente é puramente visual (renderiza children ou props simples)
- É usado por 2+ features diferentes
- Não importa nada de `features/`, `server/`, ou domínio específico
- Não contém chamadas de API, estado global, ou regras de negócio
- Exemplos: Button, Input, Card, Dialog, Badge, Skeleton, DataTable, EmptyState, Tabs

**NÃO coloque aqui quando:**
- O componente sabe o que é um "Pedido", "Cliente", "Prato" (vai para `features/`)
- Contém fetch, mutations, ou server actions (vai para `features/`)
- Contém estado complexo acoplado a um domínio (vai para `features/`)

### 4.2 — `features/`

**Coloque aqui quando:**
- O componente, hook, schema, service ou action pertence a um domínio funcional específico (landing, pedidos, catalogo, clientes, etc.)
- Contém regras de negócio daquele domínio
- Chama endpoints de API relacionados ao domínio
- É usado apenas naquela feature (mesmo que seja usado em várias páginas dentro dela)
- Exemplos: PedidoCard, FiltroPedidos, usePedidos, pedidosService, pratoSchema

**NÃO coloque aqui quando:**
- É genérico e reutilizável em 2+ features (vai para `lib/` ou `components/ui/`)
- É uma página/rota (páginas vão em `app/`, importam de `features/`)

### 4.3 — `lib/`

**Coloque aqui quando:**
- Utilitário puro, sem efeitos colaterais, sem estado
- Funções de formatação, validação, transformação
- Configuração do cliente HTTP (`api-client.ts`)
- Helpers de autenticação do lado cliente (`auth-client.ts`)
- Hooks genéricos usados por várias features (`useMediaQuery`, `useDebounce`)
- Constantes da aplicação que não pertencem a um domínio específico

**NÃO coloque aqui quando:**
- O código depende de Prisma, `fs`, `process.env` server-side (vai para `server/`)
- Contém regras de negócio de um domínio (vai para `features/`)
- É um componente React (vai para `components/ui/` ou `features/`)

### 4.4 — `server/`

**Coloque aqui quando:**
- O código usa APIs Node.js (`fs`, `path`, `crypto`)
- Configuração de autenticação (NextAuth providers, callbacks)
- Cliente Prisma singleton
- Integrações server-side (Cloudinary upload, PDF generation)
- O código nunca deve ser importado de um `'use client'`
- `import 'server-only'` no topo de cada arquivo

**NÃO coloque aqui quando:**
- O código roda no browser (fetch, hooks, eventos)
- É um server component — esses vão em `features/*/components/` com `async` e importam de `server/`

### 4.5 — `packages/contracts/`

**Coloque aqui quando:**
- Schema Zod que é usado pelo NestJS para validação de DTOs E pelo frontend para validação de formulários
- Tipo TypeScript que representa a forma exata de uma resposta de API
- Enums compartilhados (OrderStatus, PaymentMethod, PlanType)
- Tipos de request/response de API (`CreateOrderDTO`, `OrderResponse`)
- Schemas de validação que precisam ser idênticos no front e no back

**NÃO coloque aqui quando:**
- É um schema de formulário interno do admin sem correspondência 1:1 na API (vai para `features/admin/X/schemas/`)
- Tipo interno do frontend que não trafega na API (`PedidoFilter` é só do front — fica em `features/admin/pedidos/types/`)
- Configuração, utilitários, ou qualquer coisa que não seja type/contract
- Código que importa de Prisma, Next.js, ou NestJS

### 4.6 — `packages/database/`

**ÚNICA responsabilidade:** Prisma schema, migrations, seed, e export do client. Nenhum outro código.

---

## Seção 5 — Checklist Mobile-First Expandido

### 5.1 — Landing Page

| # | Item | Critério de Aceite |
|---|------|-------------------|
| L01 | Hero CTA acima da dobra | Headline + CTA visível em 320px sem scroll |
| L02 | Botões touch | Altura mínima 48px, largura mínima 120px |
| L03 | Espaçamento entre CTAs | Mínimo 16px entre botões empilhados |
| L04 | Imagens responsivas | `<img>` com `srcset` + `sizes`, formato WebP |
| L05 | Lazy loading | `loading="lazy"` em imagens abaixo da dobra |
| L06 | FAQ accordion | Área de toque 48px no header, animação <200ms |
| L07 | Floating WhatsApp | 56x56px fixo, bottom: 20px, right: 16px, z-index: 50 |
| L08 | Depoimentos carrossel | Swipe nativo (touch-action: pan-y), dots indicadores |
| L09 | Como funciona (4 steps) | 2 colunas no mobile (2x2 grid), 4 colunas no desktop |
| L10 | Cardápio cards | Scroll vertical, 1 card por linha no mobile |
| L11 | CTA repetido | Mínimo 3 CTAs: hero, pós-cardápio, pré-footer |
| L12 | Contraste WCAG AA | Todos textos ≥ 4.5:1 contra fundo |
| L13 | Tipografia | 16px base (sem zoom necessário), headings relativos (rem) |
| L14 | Semantic HTML | `<header>`, `<main>`, `<section>`, `<footer>` |
| L15 | Open Graph | og:title, og:description, og:image, og:type preenchidos |
| L16 | Schema LD+JSON | LocalBusiness JSON-LD com endereço Teresina-PI |
| L17 | Meta Pixel / GA | Comentário `{/* <!-- Meta Pixel / GA4 placeholder --> */}` |
| L18 | Política LGPD | Link no footer + banner de cookies |

### 5.2 — Painel Admin

| # | Item | Critério de Aceite |
|---|------|-------------------|
| A01 | Login responsivo | Formulário centralizado, max-w 400px, funciona 320px |
| A02 | Header mobile | Barra superior fixa, 56px altura, hamburger esquerda, título centro |
| A03 | Drawer navigation | Abre da esquerda, overlay escuro, swipe-to-close |
| A04 | Menu items | 48px altura, ícone 24px + label 14px, gap 12px |
| A05 | Listagens como cards | Mobile: cards empilhados. Tablet+: tabela |
| A06 | Card tocável | Área inteira do card é tocável, min-height 88px |
| A07 | Filtros em sheet | Botão "Filtros" fixo, abre sheet bottom (mobile) ou drawer (tablet+) |
| A08 | Formulários multi-step | 5+ campos → quebrar em steps com indicador de progresso |
| A09 | Skeletons | Toda listagem mostra skeletons durante carregamento |
| A10 | Estados vazios | Ícone + título + descrição + CTA (ex: "Criar primeiro prato") |
| A11 | Erros com retry | Mensagem em PT-BR + botão "Tentar novamente" |
| A12 | Toast feedback | Sucesso (verde), erro (vermelho), duração 4s, posição bottom |
| A13 | Confirmação destrutiva | Dialog "Tem certeza?" antes de cancelar/excluir |
| A14 | Sidebar tablet | 64px colapsada (ícones), expande a 240px no hover/toggle |
| A15 | Sidebar desktop | 240px fixa com labels visíveis |
| A16 | Breadcrumb mobile | Escondido. Só visível tablet+ |
| A17 | Paginação mobile | Botões "Anterior" / "Próximo" grandes. Números só em tablet+ |
| A18 | Search mobile | Input full-width abaixo do header, com ícone lupa |
| A19 | KPIs dashboard | 2 colunas mobile, 4 colunas desktop |
| A20 | Logout | Acessível com 2 toques: menu > "Sair" |

---

## Seção 6 — Regras de Comportamento Responsivo

### 6.1 — Listagens

**Mobile (320px–767px):**
- Cards verticais empilhados com gap de 12px
- Cada card mostra: título, status (badge), valor, data, ação principal
- Toque no card → abre sheet/drawer com detalhes completos
- Swipe actions opcionais: swipe left → "Confirmar", swipe right → "Cancelar" (desabilitado por padrão, ativável via settings)

**Tablet (768px–1023px):**
- Tabela com colunas essenciais (máx 5 colunas)
- Toque na linha → abre sheet lateral com detalhes
- Ordenação por clique no header da coluna

**Desktop (1024px+):**
- Tabela completa com todas as colunas
- Hover na linha destaca (nunca ação primária — hover é enhancement)
- Click na linha → navega para página de detalhe ou abre dialog

### 6.2 — Tabelas

**Regra geral:** Tabela é experiência SECUNDÁRIA. Cards são a experiência PRIMÁRIA.

- `<DataTable>` — componente genérico em `components/ui/data/`
  - Prop `columns`: define quais colunas são `'always'`, `'mobile'`, `'tablet'`, `'desktop'`
  - Prop `CardComponent`: componente de card alternativo para mobile
  - Internamente usa `useMediaQuery` para decidir se renderiza cards ou `<table>`
  - NUNCA usa `overflow-x: auto` com scroll horizontal para dados

```typescript
// Exemplo de definição de colunas
const pedidoColumns = [
  { key: 'customerName', label: 'Cliente', show: 'always' },
  { key: 'status', label: 'Status', show: 'always' },
  { key: 'totalAmount', label: 'Valor', show: 'always' },
  { key: 'itemCount', label: 'Itens', show: 'tablet' },
  { key: 'paymentStatus', label: 'Pagamento', show: 'tablet' },
  { key: 'deliveryDate', label: 'Entrega', show: 'desktop' },
  { key: 'createdAt', label: 'Data', show: 'desktop' },
];
```

### 6.3 — Cards

Todo card de listagem deve:
- Ter height mínima de 88px (WCAG touch target area)
- Ser inteiramente tocável (não apenas um botão dentro do card)
- Ter feedback visual no toque (`active:bg-muted`)
- Mostrar informação hierárquica: título → status → valor → metadados
- Ter padding interno mínimo de 16px
- Separar cards com gap de 12px ou border sutil

### 6.4 — Filtros

**Mobile:**
- Botão "Filtros" fixo abaixo do header (sticky, com contador de filtros ativos)
- Ao tocar, abre `<Sheet>` vindo de baixo (bottom sheet) ocupando até 80vh
- Filtros organizados verticalmente, cada grupo colapsável (accordion)
- Botão "Aplicar" fixo no bottom do sheet (sticky)
- Botão "Limpar todos" no header do sheet
- Contador de resultados visível: "12 pedidos encontrados"

**Tablet/Desktop:**
- Filtros em `<Drawer>` lateral (direita) ou barra horizontal acima da tabela
- Ao usar drawer: mesmo comportamento do sheet mas com overlay lateral
- Ao usar barra horizontal: filtros rápidos inline (status tabs, date picker)

### 6.5 — Drawers / Sheets

- **Sheet (mobile):** vem do bottom, altura máxima 85vh, handle de arraste visível, fecha com swipe down
- **Drawer (tablet+):** vem da direita, largura 400px, overlay semi-transparente
- **Dialog (confirmações):** centralizado em todos os breakpoints, max-w 440px, botões empilhados no mobile

### 6.6 — Navegação Admin

**Mobile (320px–767px):**
```
┌──────────────────────────────┐
│ ☰  │  Pedidos          │  🔔 │  ← Header 56px fixo
├──────────────────────────────┤
│                              │
│  [Drawer overlay]            │  ← Sheet da esquerda
│  ┌─────────────┐             │
│  │ 🏠 Dashboard │             │
│  │ 🍽️ Catálogo  │             │
│  │ 📦 Pedidos   │             │  ← Itens 48px altura
│  │ 👥 Clientes  │             │
│  │ 💰 Pagamentos│             │
│  │ 🚚 Entregas  │             │
│  │ 📊 Relatórios│             │
│  │ ⚙️ Config    │             │
│  │             │             │
│  │ Sair         │             │
│  └─────────────┘             │
└──────────────────────────────┘
```

**Tablet (768px–1023px):**
- Sidebar colapsada: 64px, ícones apenas
- Ao tocar/hover no ícone: expande tooltip com label
- Ao tocar no botão expandir: sidebar abre a 240px com labels

**Desktop (1024px+):**
- Sidebar fixa 240px com ícones + labels
- Seção ativa com background destacado
- Grupos de menu com títulos (Principal, Operações, Relatórios, Sistema)

### 6.7 — Formulários

- **Campos:** sempre stacked (label acima do input), nunca inline no mobile
- **Inputs:** altura mínima 48px (h-12), padding horizontal 16px
- **Selects:** nativos quando possível, customizados com search quando +5 opções
- **Date picker:** usa calendário nativo (`<input type="date">`) preferencialmente. Calendar customizado como fallback
- **Image upload:** área de drop generosa (160px altura), preview thumbnail
- **Validação:** inline abaixo do campo, texto vermelho, ícone de erro
- **Multi-step:** máximo 5 campos por step. Progress bar no topo. Botões "Voltar" e "Continuar" no bottom, fixos.
- **Submit:** botão full-width no mobile, auto-width no desktop. Estado de loading com spinner.

### 6.8 — Dashboards

- **KPI cards:** 2 colunas mobile, 3 tablet, 4 desktop
- **Gráficos:** altura fixa 200px mobile, 300px tablet, 350px desktop
- **Scroll horizontal:** NUNCA para dados. Só para galeria de imagens.
- **Período selector:** Tabs horizontais "Semana" | "Mês" | "Trimestre", com scroll horizontal se necessário
- **Tabela de recentes:** Cards mobile, tabela tablet+. Máximo 5 itens, com link "Ver todos"

### 6.9 — Paginação

**Mobile:**
```html
┌──────────────────────────────────┐
│  [← Anterior]    Próximo →      │
│        Página 2 de 8            │
└──────────────────────────────────┘
```
- Botões com 48px altura, largura mínima 120px
- Texto "Página X de Y" entre os botões
- Se primeira página: botão "Anterior" desabilitado (não escondido)
- Se última página: botão "Próximo" desabilitado

**Tablet+:**
```html
┌──────────────────────────────────────────────┐
│  ← Anterior  1  2  [3]  4  5  ...  8  Próximo →  │
└──────────────────────────────────────────────┘
```
- Números de página clicáveis, máximo 5 visíveis + elipses
- Página atual com background destacado

### 6.10 — Search

**Mobile:**
- Input full-width, 48px altura, placeholder "Buscar..."
- Ícone lupa à esquerda
- Limpar (X) à direita quando preenchido
- Busca com debounce 300ms (não busca a cada tecla)
- Resultados atualizam inline (não abre nova tela)

**Tablet+:** mesmo comportamento, mas com largura máxima 320px alinhado à direita.

---

## Seção 7 — Breakpoints e Comportamento por Dispositivo

### 7.1 — Breakpoints (Tailwind)

| Nome | Range | Dispositivo |
|------|-------|-------------|
| `default` (mobile) | 320px – 639px | Smartphone portrait |
| `sm` | 640px – 767px | Smartphone landscape / tablet pequeno |
| `md` | 768px – 1023px | Tablet |
| `lg` | 1024px – 1279px | Desktop / notebook |
| `xl` | 1280px – 1535px | Desktop grande |
| `2xl` | 1536px+ | Monitor wide |

**Regra:** todo componente começa com estilo base para 320px. Media queries adicionam comportamento para breakpoints maiores (`md:`, `lg:`), nunca o contrário.

### 7.2 — Mobile (320px – 767px)

**Landing Page:**
- Layout: single column vertical
- Hero: 100vw, texto sobreposto à imagem, CTA full-width
- Seções: padding horizontal 16px
- "Como funciona": grid 2x2 (nunca carrossel)
- Cardápio: cards em scroll vertical
- Depoimentos: carrossel horizontal com dots
- FAQ: accordion padrão, full-width
- Footer: links empilhados, colunas não usadas
- WhatsApp button: 56px, bottom-right, sempre visível

**Admin:**
- Layout: header fixo + drawer navigation + conteúdo scroll
- Listagens: SOMENTE cards, nunca tabelas
- Filtros: bottom sheet
- Formulários: multi-step se 5+ campos
- KPIs: 2 cards por linha
- Paginação: botões Anterior/Próximo
- Drawer de detalhes: full-width, 90vh altura

### 7.3 — Tablet (768px – 1023px)

**Landing Page:**
- Seções: padding horizontal 32px
- "Como funciona": 4 colunas
- Cardápio: 2 colunas
- Depoimentos: 2 colunas
- Footer: 2-3 colunas de links

**Admin:**
- Layout: sidebar colapsada (64px) + conteúdo
- Sidebar expande a 240px ao tocar no botão
- Listagens: tabela com colunas `always` + `tablet`
- Filtros: drawer lateral (direita) ou barra superior
- Formulários: single-page com 2 colunas quando fizer sentido
- KPIs: 3 cards por linha (grid-cols-3)
- Paginação: números visíveis
- Detalhes: drawer 480px da direita

### 7.4 — Desktop (1024px+)

**Landing Page:**
- Conteúdo max-w 1200px centralizado
- Seções: padding horizontal 64px
- Cardápio: 3 colunas
- Depoimentos: 3 colunas
- Footer: 4 colunas de links

**Admin:**
- Layout: sidebar fixa 240px + conteúdo com padding
- Listagens: tabela completa (todas as colunas)
- Filtros: barra inline acima da tabela (não drawer)
- Formulários: single-page, 2-3 colunas, sem multi-step
- KPIs: 4 cards por linha
- Paginação completa com números
- Detalhes: dialog modal ou página dedicada (dependendo da complexidade)

---

## Apêndice A — Touch Targets (WCAG 2.2 Level AA)

| Elemento | Altura Mínima | Largura Mínima | Gap entre elementos |
|----------|--------------|----------------|---------------------|
| Botão primário | 48px | 120px | 16px |
| Botão secundário / link | 44px | 44px | 12px |
| Input / Select / Textarea | 48px | - | 16px |
| Checkbox / Radio | 44px (área total) | 44px | 8px |
| Card tocável | 88px (área total) | - | 12px |
| Menu item | 48px | - | 0 |
| Ícone de ação (edit, delete) | 44px | 44px | 12px |
| Floating action button | 56px | 56px | - |

## Apêndice B — Estados de UI Obrigatórios

Todo componente de listagem/formulário DEVE implementar:

1. **Loading:** Skeleton (nunca spinner sozinho, nunca "Carregando..." texto puro)
2. **Empty:** Ícone ilustrativo + título + descrição contextual + CTA quando aplicável
3. **Error:** Mensagem em PT-BR + botão "Tentar novamente"
4. **Success:** Toast verde com resumo da ação (ex: "Pedido #123 confirmado")
5. **Disabled:** Estado visualmente distinto (opacidade reduzida, cursor not-allowed)

---

*Fim da especificação de arquitetura. Pronto para transição ao plano de implementação.*
