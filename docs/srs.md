# SRS — Software Requirements Specification

**Última atualização:** 2026-06-26
**Versão:** 2.1
**Sistema:** Juliana Gaspar Platform

---

## 1. Introdução

### 1.1 Escopo

Este documento especifica os requisitos de software para a plataforma Juliana Gaspar — um sistema web para gestão de negócio de comida caseira por assinatura, composto por:

- **Landing page pública:** Vitrine do negócio com cardápio semanal
- **Painel administrativo:** Gestão completa do negócio (cardápio, pedidos, clientes, pagamentos, ciclos, entregas, estoque)
- **API REST:** Backend que serve ambos os frontends

### 1.2 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Monorepo | Turborepo + pnpm workspaces | — |
| Frontend | Next.js (App Router) | 15.2 |
| UI | React + shadcn/ui + Tailwind CSS | React 19 / Tailwind v4 |
| Backend | NestJS | 11 |
| ORM | Prisma | 6.19 |
| Banco | PostgreSQL | 16 |
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
├── docs/             # Documentação
└── graphify-out/     # Knowledge graph do projeto
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
│  JWT     │   │  • Menu      │
│  RBAC    │   │  • Orders    │
│  bcrypt  │   │  • Customers │
└──────────┘   │  • Cycles    │
               │  • Payments  │
               │  • Delivery  │
               │  • Ingredients│
               │  • Meals     │
               │  • Dashboard │
               │  • Capacity  │
               │  • NutritionPdf│
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

Módulos implementados: auth, menu (catálogo), orders, customers, payments, cycles, delivery, ingredients, meals, dashboard, capacity, nutrition-pdf.

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
│   ├── cardapio/
│   │   └── page.tsx              # Catálogo de pratos com ficha técnica
│   ├── pedidos/
│   │   ├── page.tsx              # Lista + criação de pedidos por refeição
│   │   └── [orderId]/
│   │       └── page.tsx          # Detalhe do pedido
│   ├── clientes/
│   │   └── page.tsx              # CRUD de clientes com dados completos
│   ├── pagamentos/
│   │   └── page.tsx              # CRUD completo de pagamentos
│   ├── ciclos/
│   │   └── page.tsx              # Lista de ciclos
│   ├── entregas/
│   │   └── page.tsx              # Zonas e manifesto de entrega
│   └── ingredientes/
│       └── page.tsx              # Estoque + sugestão de compras
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

### 3.2 Catálogo de Pratos (Menu)

**RF-CAT-01 — Listar pratos**
- Endpoint: `GET /api/dishes?page=1&limit=20&search=termo&nutrientType=PROTEINA`
- Busca por nome ou descrição (case-insensitive)
- Filtro por tipo de nutriente (PROTEINA, CARBOIDRATO, FIBRA, GORDURA)
- Resposta paginada: `{ data: DishDTO[], total, page, limit, totalPages }`

**RF-CAT-02 — Criar prato**
- Endpoint: `POST /api/dishes`
- Body validado por `createDishSchema`: name, description, ingredients, price, photoUrl?, allergens?, available?, nutrientType
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

**RF-CAT-06 — Ficha Técnica (Technical Sheet)**
- Endpoint: `GET /api/dishes/:id/technical-sheet`
- Retorna ficha técnica com: preparationMethod, preparationTime, equipment[], notes, price, ingredients[]
- Ingredientes incluem: ingredientId, ingredientName, ingredientUnit, quantity
- Endpoint: `PUT /api/dishes/:id/technical-sheet` (upsert)
- Ao salvar, substitui todos os ingredientes vinculados (deleteMany + createMany)
- Roles: ADMIN, OPERATOR

### 3.3 Pedidos

**RF-PED-01 — Listar pedidos com filtros**
- Endpoint: `GET /api/orders?page=1&limit=20&status=CONFIRMED&paymentStatus=PENDING&planType=SINGLE&search=joao&dateFrom=2026-01-01&dateTo=2026-01-31`
- Todos os filtros são opcionais
- Busca por nome do cliente (case-insensitive)
- Include: customer, meals com components e menuItem

**RF-PED-02 — Criar pedido tradicional**
- Endpoint: `POST /api/orders`
- Valida existência do cliente e pratos
- Calcula `totalAmount` pela soma de `dish.price × item.quantity`
- Cria `OrderItem` para cada item do pedido

**RF-PED-03 — Criar pedido por refeições (meal-based)**
- Endpoint: `POST /api/orders/meal-based`
- Body validado por `createMealBasedOrderSchema`:
  - `customerId`: UUID do cliente
  - `mealCount`: 7 ou 14 (número de refeições)
  - `meals`: array de meal templates, cada um com:
    - `slot`: número da refeição (1 a mealCount)
    - `proteinId`: UUID do prato de proteína (obrigatório)
    - `carboId`: UUID do prato de carboidrato (obrigatório)
    - `fiberId`: UUID do prato de fibra (obrigatório)
    - `fatId`: UUID do prato de gordura (opcional)
    - `notes`: observações da refeição (opcional)
    - `copyFromSlot`: copiar composição de outro slot (opcional)
- Resolve `copyFromSlot` copiando os IDs da refeição de origem
- Busca todos os pratos para obter preços das fichas técnicas
- Calcula `totalAmount` pela soma dos preços das fichas técnicas
- Cria Order + Meal[] + OrderComponent[] em uma transação Prisma
- Roles: ADMIN, OPERATOR

**RF-PED-04 — Refeições anteriores do cliente**
- Endpoint: `GET /api/orders/previous-meals/:customerId`
- Retorna refeições de pedidos anteriores do cliente (últimos 5 pedidos)
- Include: meals com components e menuItem (name, nutrientType)
- Usado para reaproveitar composição de refeições em novos pedidos

**RF-PED-05 — Atualizar status**
- Endpoint: `PATCH /api/orders/:id/status`
- Status válidos: PENDING, CONFIRMED, IN_PRODUCTION, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
- Opcionalmente atualiza `notes`
- **Regra de negócio:** Ao transicionar para DELIVERED, dispara `deductStock()` automaticamente

**RF-PED-06 — Baixa de estoque automática**
- `OrdersService.deductStock(order)` é chamado quando status → DELIVERED
- Para cada meal do pedido, para cada component, acessa `menuItem.technicalSheet.ingredients[]`
- Agrega quantidades necessárias por ingredientId
- Deduz do `Ingredient.stockQty` via `prisma.ingredient.update({ stockQty: { decrement: qty } })`
- Coleta warnings para ingredientes com estoque insuficiente
- Retorna lista de warnings (não bloqueia a operação)

**RF-PED-07 — Status de pagamento**
- Sincronizado automaticamente quando pagamento é registrado
- Valores: PENDING, PAID

### 3.4 Clientes

**RF-CLI-01 — CRUD de clientes**
- `GET /api/customers?page=1&limit=20&search=termo&tag=VIP` — listar com busca por nome/telefone, filtro por tag
- `GET /api/customers/:id` — detalhes com histórico de pedidos
- `POST /api/customers` — criar (name, phone obrigatórios)
- `PUT /api/customers/:id` — atualizar

**RF-CLI-02 — Campos do cadastro**
- Obrigatórios: name, phone
- Opcionais: email, street, number, neighborhood, city, zipCode, instagram, whatsapp, dietaryRestrictions, preferences, notes, tags[]
- LGPD: lgpdConsent (boolean)

**RF-CLI-03 — Tags**
- Array de strings: `["VIP", "alergico", "vegetariano"]`
- Filtro por tag no endpoint de listagem

**RF-CLI-04 — Refeições favoritas**
- `GET /api/customers/:id/favorites` — listar favoritos do cliente
- `POST /api/customers/:id/favorites` — criar favorito:
  - `label`: nome do favorito (ex: "Meu combo favorito")
  - `proteinId`, `carboId`, `fiberId`: UUIDs dos pratos (obrigatórios)
  - `fatId`: UUID do prato de gordura (opcional)
- `DELETE /api/customers/:id/favorites/:favId` — remover favorito
- Valida que o cliente existe e que o favorito pertence ao cliente

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

**RF-PAG-01 — CRUD completo de pagamentos**
- `GET /api/payments?page=1&limit=20&status=PENDING&method=PIX` — listar com filtros
- `GET /api/payments/:id` — detalhes do pagamento
- `POST /api/payments` — criar vinculado a `orderId`
- `PUT /api/payments/:id` — editar método, valor e/ou status
- `DELETE /api/payments/:id` — excluir pagamento (ADMIN apenas)

**RF-PAG-02 — Registrar pagamento**
- `PATCH /api/payments/:id/register` — marcar como PAID
- Body: `{ paidAt?: string }`
- Efeito colateral: sincroniza `order.paymentStatus = 'PAID'`

**RF-PAG-03 — Reembolso**
- `POST /api/payments/:id/refund`
- Body: `{ reason?: string }`
- Atualiza status para REFUNDED
- Registra `refundReason` e `refundedAt` no banco
- Efeito colateral: sincroniza `order.paymentStatus = 'REFUNDED'`

**RF-PAG-04 — Sincronização com pedido**
- Ao registrar pagamento como PAID: `order.paymentStatus = 'PAID'`
- Ao reembolsar: `order.paymentStatus = 'REFUNDED'`
- Ao criar pagamento: `order.paymentStatus = 'PENDING'` (se ainda não pago)

### 3.7 Entregas

**RF-ENT-01 — Zonas de entrega**
- CRUD completo: `GET/POST/PUT/DELETE /api/delivery/zones`
- Zona: name, fee, description?

**RF-ENT-02 — Manifesto de entrega**
- `GET /api/delivery/manifest?zoneId=X&date=2026-06-16`
- Lista pedidos com status ativo (CONFIRMED, IN_PRODUCTION, OUT_FOR_DELIVERY)
- Include: customer (name, phone, address), items com dish (name, allergens)
- Ordenado por endereço de entrega

### 3.8 Ingredientes e Estoque

**RF-ING-01 — CRUD de ingredientes**
- `GET /api/ingredients?page=1&limit=20&search=termo` — listar
- `POST /api/ingredients` — criar (name, unit, stockQty, minStock)
- `PUT /api/ingredients/:id` — atualizar
- `DELETE /api/ingredients/:id` — remover

**RF-ING-02 — Sugestão de compras**
- `GET /api/ingredients/purchase-suggestion`
- Algoritmo:
  1. Busca todos os pedidos com status CONFIRMED
  2. Para cada pedido, navega: meals → components → menuItem → technicalSheet → ingredients
  3. Agrega quantidade necessária por ingredientId
  4. Busca detalhes de cada ingrediente (name, unit, stockQty)
  5. Calcula `suggestedPurchase = max(0, requiredQty - stockQty)`
  6. Retorna array com: ingredientId, ingredientName, unit, stockQty, requiredQty, suggestedPurchase
- Itens com suggestedPurchase > 0 são destacados como "Precisa comprar"
- Itens com suggestedPurchase = 0 são marcados como "Estoque suficiente"

---

## 4. Requisitos de Interface

### 4.1 API REST

**Formato de resposta padrão:**
```json
{
  "data": { ... },
  "timestamp": "2026-06-26T12:00:00.000Z"
}
```

**Formato de erro:**
```json
{
  "statusCode": 404,
  "message": "Prato não encontrado",
  "timestamp": "2026-06-26T12:00:00.000Z"
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
- Navbar fixa: padding-top global (pt-20) no main para evitar sobreposição

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

Modelos principais:

| Model | Campos principais | Relacionamentos |
|-------|------------------|-----------------|
| User | id, name, email, passwordHash, role | — |
| Customer | id, name, phone, email?, street?, number?, neighborhood?, city?, zipCode?, instagram?, whatsapp?, dietaryRestrictions?, preferences?, notes?, tags[], lgpdConsent | orders[], favoriteMeals[] |
| MenuItem | id, name, description, photoUrl?, ingredients, allergens?, price, available, nutrientType | orderComponents[], technicalSheet?, favoriteAsProtein[], favoriteAsCarbo[], favoriteAsFiber[], favoriteAsFat[] |
| TechnicalSheet | id, menuItemId, preparationMethod, preparationTime, equipment[], notes?, price | menuItem, ingredients[] |
| TechnicalSheetIngredient | id, technicalSheetId, ingredientId, quantity (@@unique [technicalSheetId, ingredientId]) | technicalSheet, ingredient |
| Ingredient | id, name, unit, stockQty, minStock | technicalSheetIngredients[] |
| Order | id, customerId, cycleId?, planType, status, paymentStatus, totalAmount, deliveryAddress, deliveryDate?, notes? | customer, cycle?, meals[], payments[] |
| Meal | id, orderId, slot | order, components[] |
| OrderComponent | id, mealId, menuItemId, nutrientType, notes? | meal, menuItem |
| FavoriteMeal | id, customerId, label, proteinId, carboId, fiberId, fatId? | customer, protein, carbo, fiber, fat |
| WeeklyCycle | id, openDate, closeDate, deliveryDate, status | orders[], cycleDishes[] |
| CycleDish | id, cycleId, dishId (unique [cycleId, dishId]) | cycle, dish |
| Payment | id, orderId, customerId, method, status, amount, paidAt?, refundReason?, refundedAt? | order, customer |
| Subscription | id, customerId, planType, status, startDate, nextRenewal, pausedUntil? | customer |
| DeliveryZone | id, name, fee, description? | — |

### 5.2 Enumerações

- **OrderStatus:** PENDING, CONFIRMED, IN_PRODUCTION, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
- **PaymentStatus:** PENDING, PAID, OVERDUE, REFUNDED
- **PaymentMethod:** PIX, DINHEIRO, CARTAO
- **NutrientType:** PROTEINA, CARBOIDRATO, FIBRA, GORDURA
- **PlanType:** SINGLE, WEEKLY, MONTHLY
- **UserRole:** ADMIN, OPERATOR, VIEWER

### 5.3 Validação (Zod Schemas)

Schemas definidos em `packages/contracts/src/`:
- `common.schema.ts` — paginationSchema
- `auth.schema.ts` — loginSchema
- `menu.schema.ts` — createMenuItemSchema, updateMenuItemSchema, technicalSheetSchema, createTechnicalSheetSchema, technicalSheetIngredientSchema
- `order.schema.ts` — createOrderSchema, updateOrderStatusSchema, createMealBasedOrderSchema, mealTemplateSchema, purchaseSuggestionSchema
- `customer.schema.ts` — createCustomerSchema, updateCustomerSchema
- `meal.schema.ts` — createMealSchema, favoriteMealSchema, createFavoriteMealSchema, mealTemplateSchema
- `cycle.schema.ts` — createCycleSchema, updateCycleSchema
- `payment.schema.ts` — createPaymentSchema, registerPaymentSchema, updatePaymentSchema
- `delivery.schema.ts` — createDeliveryZoneSchema
- `ingredient.schema.ts` — createIngredientSchema, updateIngredientSchema

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
| PostgreSQL | ≥ 16 |
| pnpm | ≥ 9 |
| Porta API | 3001 (configurável) |
| Porta Web | 3000 (configurável) |
| Deploy | Docker (docker-compose) |
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
8. DTO mapper pattern — todo service retorna DTOs tipados, serialize Date → .toISOString()
