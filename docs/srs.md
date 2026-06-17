# SRS — Software Requirements Specification

**Última atualização:** 2026-06-16
**Versão:** 1.0
**Sistema:** Juliana Gaspar Platform

---

## 1. Introdução

### 1.1 Escopo

Este documento especifica os requisitos de software para a plataforma Juliana Gaspar — um sistema web para gestão de negócio de comida caseira por assinatura, composto por:

- **Landing page pública:** Vitrine do negócio com cardápio semanal
- **Painel administrativo:** Gestão completa do negócio (cardápio, pedidos, clientes, pagamentos, ciclos, entregas)
- **API REST:** Backend que serve ambos os frontends

### 1.2 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Monorepo | Turborepo + pnpm workspaces | — |
| Frontend | Next.js (App Router) | 15.2 |
| UI | React + shadcn/ui + Tailwind CSS | React 19 / Tailwind v4 |
| Backend | NestJS | 11 |
| ORM | Prisma | — |
| Banco | PostgreSQL | — |
| Validação | Zod | 3.24 |
| Autenticação | Passport JWT + bcryptjs | — |
| Linguagem | TypeScript (strict) | 5.7 |

### 1.3 Estrutura do Monorepo

```
juliana-gaspar/
├── apps/
│   ├── api/          # NestJS backend (porta 3001)
│   └── web/          # Next.js frontend (porta 3000)
├── packages/
│   ├── contracts/    # Schemas Zod e tipos DTO compartilhados
│   ├── database/     # Prisma client singleton + schema + seed
│   └── config/       # TypeScript configs compartilhados
├── scripts/          # setup.sh, db-reset.sh
└── docs/             # Documentação
```

---

## 2. Arquitetura

### 2.1 Diagrama de Camadas

```
┌─────────────────────────────────────────┐
│              Cliente Web                │
│  (Next.js — Porta 3000)                 │
│  • Landing page pública                 │
│  • Painel admin (autenticado)           │
└────────────┬────────────────────────────┘
             │ HTTP REST (JSON)
             ▼
┌─────────────────────────────────────────┐
│           API Gateway (NestJS)          │
│  (Porta 3001)                           │
│  • CORS habilitado                      │
│  • Prefixo /api                         │
│  • Filtro global de exceções            │
│  • Interceptor de resposta              │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌──────────┐   ┌──────────────┐
│  Auth    │   │   Modules    │
│  JWT     │   │  • Catalog   │
│  RBAC    │   │  • Orders    │
│  bcrypt  │   │  • Customers │
└──────────┘   │  • Cycles    │
               │  • Payments  │
               │  • Delivery  │
               └──────┬───────┘
                      │
                      ▼
              ┌──────────────┐
              │   Prisma     │
              │   ORM        │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │  PostgreSQL  │
              └──────────────┘
```

### 2.2 Estrutura de Módulos (NestJS)

Cada módulo segue o padrão NestJS:
```
modules/<nome>/
├── <nome>.module.ts
├── <nome>.controller.ts
├── <nome>.service.ts
└── strategies/       (apenas auth)
```

### 2.3 Estrutura de Rotas (Next.js App Router)

```
app/
├── layout.tsx                    # Root layout (fonts, metadata)
├── globals.css                   # Tailwind v4 + tema customizado
├── (landing)/
│   ├── layout.tsx                # Layout da landing page
│   └── page.tsx                  # Landing page (7 seções)
├── (admin)/
│   ├── layout.tsx                # Admin layout (AuthProvider + Sidebar + Header)
│   ├── login/
│   │   └── page.tsx              # Página de login
│   ├── painel/
│   │   └── page.tsx              # Dashboard
│   ├── catalogo/
│   │   ├── page.tsx              # Lista de pratos
│   │   ├── novo/
│   │   │   └── page.tsx          # Criar prato
│   │   └── [dishId]/
│   │       └── page.tsx          # Editar prato
│   ├── pedidos/
│   │   ├── page.tsx              # Lista de pedidos
│   │   └── [orderId]/
│   │       └── page.tsx          # Detalhe do pedido
│   ├── clientes/
│   │   └── page.tsx              # Lista de clientes
│   ├── pagamentos/
│   │   └── page.tsx              # Lista de pagamentos
│   ├── ciclos/
│   │   └── page.tsx              # Lista de ciclos
│   └── entregas/
│       └── page.tsx              # Lista de zonas de entrega
```

---

## 3. Requisitos Funcionais por Módulo

### 3.1 Autenticação e Autorização

**RF-AUTH-01 — Login**
- Endpoint: `POST /api/auth/login`
- Body: `{ email: string, password: string }`
- Response: `{ accessToken: string, user: { id, name, email, role } }`
- Validação: Zod (`loginSchema`)
- Erro 401 se credenciais inválidas

**RF-AUTH-02 — JWT Strategy**
- Extrai token do header `Authorization: Bearer <token>`
- Payload: `{ sub: userId, email, role }`
- Expiração: 7 dias
- Secret: `JWT_SECRET` (env)

**RF-AUTH-03 — Role-Based Access Control**
- Roles: `ADMIN`, `OPERATOR`, `VIEWER`
- Decorator `@Roles('ADMIN', 'OPERATOR')` nos controllers
- `RolesGuard` verifica se `user.role` está na lista permitida
- Rotas sem `@Roles` são acessíveis a qualquer role autenticada

### 3.2 Catálogo de Pratos

**RF-CAT-01 — Listar pratos**
- Endpoint: `GET /api/dishes?page=1&limit=20&search=termo`
- Busca por nome ou descrição (case-insensitive)
- Resposta paginada: `{ data: DishDTO[], total, page, limit, totalPages }`

**RF-CAT-02 — Criar prato**
- Endpoint: `POST /api/dishes`
- Body validado por `createDishSchema`: name, description, ingredients, price, photoUrl?, allergens?, available?
- Roles: ADMIN, OPERATOR

**RF-CAT-03 — Atualizar prato**
- Endpoint: `PUT /api/dishes/:id`
- Body validado por `updateDishSchema` (todos os campos opcionais)
- Erro 404 se prato não encontrado
- Roles: ADMIN, OPERATOR

**RF-CAT-04 — Excluir prato**
- Endpoint: `DELETE /api/dishes/:id`
- Roles: ADMIN apenas
- Erro 404 se prato não encontrado

**RF-CAT-05 — Duplicar prato**
- Endpoint: `POST /api/dishes/:id/duplicate`
- Cria cópia com nome sufixado "(cópia)"
- Roles: ADMIN, OPERATOR

### 3.3 Pedidos

**RF-PED-01 — Listar pedidos com filtros**
- Endpoint: `GET /api/orders?page=1&limit=20&status=CONFIRMED&paymentStatus=PENDING&planType=SINGLE&search=joao&dateFrom=2026-01-01&dateTo=2026-01-31`
- Todos os filtros são opcionais
- Busca por nome do cliente (case-insensitive)
- Include: customer (name, phone), items com dish (name)

**RF-PED-02 — Criar pedido**
- Endpoint: `POST /api/orders`
- Valida existência do cliente e pratos
- Calcula `totalAmount` pela soma de `dish.price × item.quantity`
- Cria `OrderItem` para cada item do pedido

**RF-PED-03 — Atualizar status**
- Endpoint: `PATCH /api/orders/:id/status`
- Status válidos: PENDING, CONFIRMED, IN_PRODUCTION, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
- Opcionalmente atualiza `notes`

**RF-PED-04 — Status de pagamento**
- Sincronizado automaticamente quando pagamento é registrado
- Valores: PENDING, PAID

### 3.4 Clientes

**RF-CLI-01 — CRUD de clientes**
- `GET /api/customers` — listar com busca por nome/telefone, filtro por tag
- `GET /api/customers/:id` — detalhes com histórico de pedidos
- `POST /api/customers` — criar (name, phone obrigatórios; email, address, dietaryRestrictions, preferences, notes opcionais)
- `PUT /api/customers/:id` — atualizar

**RF-CLI-02 — Tags**
- Array de strings: `["VIP", "alergico", "vegetariano"]`
- Filtro por tag no endpoint de listagem

### 3.5 Ciclos Semanais

**RF-CIC-01 — Gerenciar ciclos**
- `GET /api/cycles` — listar com include de `cycleDishes.dish`
- `GET /api/cycles/:id` — detalhes com pratos, pedidos, receita calculada
- `POST /api/cycles` — criar com `dishIds[]` para vincular pratos
- `PUT /api/cycles/:id` — atualizar datas e/ou pratos

**RF-CIC-02 — Métricas do ciclo**
- `orderCount`: total de pedidos no ciclo
- `revenue`: soma de `totalAmount` de pedidos não cancelados

### 3.6 Pagamentos

**RF-PAG-01 — Gerenciar pagamentos**
- `GET /api/payments?page=1&limit=20&status=PENDING&method=PIX`
- `POST /api/payments` — criar vinculado a `orderId`
- `PATCH /api/payments/:id/register` — marcar como PAID

**RF-PAG-02 — Sincronização**
- Ao registrar pagamento como PAID, atualiza `order.paymentStatus = 'PAID'`

### 3.7 Entregas

**RF-ENT-01 — Zonas de entrega**
- CRUD completo: `GET/POST/PUT/DELETE /api/delivery/zones`
- Zona: name, fee, description?

**RF-ENT-02 — Manifesto de entrega**
- `GET /api/delivery/manifest?zoneId=X&date=2026-06-16`
- Lista pedidos com status ativo (CONFIRMED, IN_PRODUCTION, OUT_FOR_DELIVERY)
- Include: customer (name, phone, address), items com dish (name, allergens)
- Ordenado por endereço de entrega

---

## 4. Requisitos de Interface

### 4.1 API REST

**Formato de resposta padrão:**
```json
{
  "data": { ... },
  "timestamp": "2026-06-16T12:00:00.000Z"
}
```

**Formato de erro:**
```json
{
  "statusCode": 404,
  "message": "Prato não encontrado",
  "timestamp": "2026-06-16T12:00:00.000Z"
}
```

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <jwt_token>`

### 4.2 Frontend — Componentes Base

**Estados de UI (todas as páginas):**

| Estado | Comportamento |
|--------|--------------|
| Loading | Skeleton placeholders (shadcn/ui Skeleton) |
| Empty | Componente EmptyState com título, descrição, CTA opcional |
| Error | Banner de erro com mensagem, sem retry automático |
| Success | Toast de confirmação (sonner) para ações CUD |

**Responsividade:**
- Mobile (< 768px): Cards
- Desktop (≥ 768px): Tabelas
- Sidebar mobile: Sheet drawer (shadcn/ui)
- Sidebar desktop: Fixed sidebar colapsável
- Touch targets: ≥ 44px (min-h-[44px])

### 4.3 Tema e Design Tokens

```css
@theme {
  --color-primary-50: #fefbf6 ...;
  --color-primary-900: #3b2f1e;
  --color-accent: ...;
  --color-cream: #fefbf6;
  --color-secondary: ...;
}
```

Fontes: Inter (UI) + Playfair Display (headings)

---

## 5. Requisitos de Dados

### 5.1 Modelo de Dados (Prisma)

10 modelos:

| Model | Campos principais | Relacionamentos |
|-------|------------------|-----------------|
| User | id, name, email, passwordHash, role | — |
| Customer | id, name, phone, email?, address?, tags[], dietaryRestrictions?, preferences?, lgpdConsent | orders[], subscriptions[] |
| Dish | id, name, description, photoUrl?, ingredients, allergens?, price, available | orderItems[], cycleDishes[], recipeItems[] |
| WeeklyCycle | id, openDate, closeDate, deliveryDate, status | orders[], cycleDishes[] |
| CycleDish | id, cycleId, dishId (unique [cycleId, dishId]) | cycle, dish |
| Order | id, customerId, cycleId?, planType, status, paymentStatus, totalAmount, deliveryAddress, deliveryDate?, notes? | customer, cycle?, items[], payments[] |
| OrderItem | id, orderId, dishId, quantity, unitPrice | order, dish |
| Payment | id, orderId, method, status, amount, paidAt? | order |
| Subscription | id, customerId, planType, status, startDate, nextRenewal, pausedUntil? | customer |
| DeliveryZone | id, name, fee, description? | — |
| Ingredient | id, name, unit, stockQty, minStock | recipeItems[] |
| RecipeItem | id, dishId, ingredientId, quantity (unique [dishId, ingredientId]) | dish, ingredient |

### 5.2 Validação (Zod Schemas)

Schemas definidos em `packages/contracts/src/`:
- `common.schema.ts` — paginationSchema
- `auth.schema.ts` — loginSchema
- `dish.schema.ts` — createDishSchema, updateDishSchema
- `order.schema.ts` — createOrderSchema, updateOrderStatusSchema
- `customer.schema.ts` — createCustomerSchema, updateCustomerSchema
- `cycle.schema.ts` — createCycleSchema, updateCycleSchema
- `payment.schema.ts` — createPaymentSchema, registerPaymentSchema
- `delivery.schema.ts` — createDeliveryZoneSchema
- `subscription.schema.ts`, `ingredient.schema.ts`, `recipe.schema.ts` — definidos mas sem módulo

---

## 6. Requisitos de Segurança

| ID | Requisito | Implementado? |
|----|-----------|---------------|
| SEC-01 | Autenticação JWT | ✅ |
| SEC-02 | Senhas hash (bcrypt, 12 rounds) | ✅ |
| SEC-03 | RBAC (ADMIN/OPERATOR/VIEWER) | ✅ |
| SEC-04 | CORS configurado | ✅ (origem: env) |
| SEC-05 | Validação de input (Zod) | ✅ |
| SEC-06 | Helmet (headers de segurança) | 🔴 Pendente |
| SEC-07 | Rate limiting | 🔴 Pendente |
| SEC-08 | HTTPS | 🔴 Pendente (infra) |
| SEC-09 | Refresh token / rotação | 🔴 Pendente |
| SEC-10 | Auditoria de ações | 🔴 Pendente |

---

## 7. Requisitos de Infraestrutura

| Requisito | Especificação |
|-----------|--------------|
| Node.js | ≥ 20 |
| PostgreSQL | ≥ 15 |
| pnpm | ≥ 9 |
| Porta API | 3001 (configurável) |
| Porta Web | 3000 (configurável) |
| Deploy | A definir (VPS, Vercel + Railway, ou similar) |
| Domínio | julianagaspar.com.br (a adquirir) |

---

## 8. Restrições Técnicas

1. Monorepo Turborepo — código compartilhado via packages
2. TypeScript strict — sem `any` não justificado
3. Zod para toda validação de entrada
4. NestJS modular — um módulo por domínio
5. Next.js App Router — route groups para landing e admin
6. Tailwind v4 com PostCSS — sem styled-components ou CSS modules
7. Português brasileiro para toda interface e mensagens
