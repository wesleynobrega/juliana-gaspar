# Juliana Gaspar — Plano de Implementação Phase 1

> **Para agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a plataforma completa Juliana Gaspar — landing page, painel admin, e backend API com todos os módulos Phase 1.

**Architecture:** Monorepo Turborepo + pnpm workspaces. Next.js 15 App Router com route groups `(landing)` e `(admin)`, organizado por features. NestJS 11 backend modular. PostgreSQL com Prisma ORM. Docker Compose para ambiente dev e produção.

**Tech Stack:** Next.js 15, NestJS 11, Prisma, PostgreSQL, Tailwind CSS, shadcn/ui, Zod, JWT (passport-jwt), Docker, Turborepo, pnpm

---

## MILESTONE 1: Fundação do Monorepo

### Task 1.1: Inicializar root do monorepo

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Criar `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Criar `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false,
      "dependsOn": ["db:migrate"]
    }
  }
}
```

- [ ] **Step 3: Criar root `package.json`**

```json
{
  "name": "juliana-gaspar",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:migrate": "turbo db:migrate",
    "db:seed": "turbo db:seed",
    "db:reset": "bash scripts/db-reset.sh",
    "setup": "bash scripts/setup.sh",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.7.0"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

- [ ] **Step 4: Criar `.gitignore`**

```gitignore
node_modules/
.turbo/
.next/
dist/
.env
.env.local
*.log
.superpowers/
.DS_Store
```

- [ ] **Step 5: Criar `.env.example`**

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/juliana_gaspar"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=juliana_gaspar

# API
API_PORT=3001
API_URL=http://localhost:3001

# JWT
JWT_SECRET=change-me-in-production-use-random-64-chars
JWT_EXPIRATION=7d

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WHATSAPP_NUMBER=5586999999999

# Cloudinary (Phase 2)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Phase 2)
EMAIL_PROVIDER=mock
SENDGRID_API_KEY=

# Payment Gateway (Phase 2)
PAYMENT_GATEWAY=mock
MERCADO_PAGO_ACCESS_TOKEN=
```

- [ ] **Step 6: Criar `README.md`**

```markdown
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
```

- [ ] **Step 7: Commit**

```bash
cd "/home/wesley/Projetos/Juliana Gaspar"
git init
git add -A
git commit -m "feat: initialize monorepo root with turbo + pnpm workspaces

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 1.2: Criar `packages/config`

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/tsconfig/base.json`
- Create: `packages/config/tsconfig/next.json`
- Create: `packages/config/tsconfig/nest.json`
- Create: `packages/config/eslint/base.js`
- Create: `packages/config/eslint/next.js`
- Create: `packages/config/eslint/nest.js`
- Create: `packages/config/prettier.config.js`

- [ ] **Step 1: Criar `packages/config/package.json`**

```json
{
  "name": "@juliana-gaspar/config",
  "version": "0.0.0",
  "private": true,
  "files": ["tsconfig", "eslint", "prettier.config.js"]
}
```

- [ ] **Step 2: Criar `packages/config/tsconfig/base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 3: Criar `packages/config/tsconfig/next.json`**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 4: Criar `packages/config/tsconfig/nest.json`**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "outDir": "./dist",
    "incremental": true
  }
}
```

- [ ] **Step 5: Criar `packages/config/eslint/base.js`**

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
```

- [ ] **Step 6: Criar `packages/config/eslint/next.js`**

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["./base.js", "next/core-web-vitals"],
};
```

- [ ] **Step 7: Criar `packages/config/eslint/nest.js`**

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["./base.js"],
  env: { node: true },
};
```

- [ ] **Step 8: Criar `packages/config/prettier.config.js`**

```javascript
/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
};
```

- [ ] **Step 9: Commit**

```bash
git add packages/config/
git commit -m "feat: add shared config package (tsconfig, eslint, prettier)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 1.3: Criar `packages/contracts`

**Files:**
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/tsconfig.json`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/common.schema.ts`
- Create: `packages/contracts/src/auth.schema.ts`
- Create: `packages/contracts/src/dish.schema.ts`
- Create: `packages/contracts/src/order.schema.ts`
- Create: `packages/contracts/src/customer.schema.ts`
- Create: `packages/contracts/src/cycle.schema.ts`
- Create: `packages/contracts/src/payment.schema.ts`
- Create: `packages/contracts/src/subscription.schema.ts`
- Create: `packages/contracts/src/delivery.schema.ts`
- Create: `packages/contracts/src/ingredient.schema.ts`
- Create: `packages/contracts/src/recipe.schema.ts`

- [ ] **Step 1: Criar `packages/contracts/package.json`**

```json
{
  "name": "@juliana-gaspar/contracts",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@juliana-gaspar/config": "workspace:*",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Criar `packages/contracts/tsconfig.json`**

```json
{
  "extends": "@juliana-gaspar/config/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Criar `packages/contracts/src/common.schema.ts`**

```typescript
import { z } from 'zod';

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
```

- [ ] **Step 4: Criar `packages/contracts/src/auth.schema.ts`**

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  phone: z.string().min(10, 'Telefone inválido').max(15),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

export const userRoleSchema = z.enum(['ADMIN', 'OPERATOR', 'VIEWER']);

export type UserRole = z.infer<typeof userRoleSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: userRoleSchema,
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
```

- [ ] **Step 5: Criar `packages/contracts/src/dish.schema.ts`**

```typescript
import { z } from 'zod';

export const dishSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string().min(10, 'Descrição muito curta').max(500),
  photoUrl: z.string().url().nullable(),
  ingredients: z.string().min(3, 'Liste os ingredientes'),
  allergens: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  available: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DishDTO = z.infer<typeof dishSchema>;

export const createDishSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string().min(10, 'Descrição muito curta').max(500),
  photoUrl: z.string().url().optional().nullable(),
  ingredients: z.string().min(3, 'Liste os ingredientes'),
  allergens: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  available: z.boolean().default(true),
});

export type CreateDishDTO = z.infer<typeof createDishSchema>;

export const updateDishSchema = createDishSchema.partial();

export type UpdateDishDTO = z.infer<typeof updateDishSchema>;
```

- [ ] **Step 6: Criar `packages/contracts/src/order.schema.ts`**

```typescript
import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'IN_PRODUCTION',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const paymentStatusSchema = z.enum(['PENDING', 'PAID', 'OVERDUE', 'REFUNDED']);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const planTypeSchema = z.enum(['SINGLE', 'WEEKLY', 'MONTHLY']);

export type PlanType = z.infer<typeof planTypeSchema>;

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  dishId: z.string().uuid(),
  dishName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export type OrderItemDTO = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  customerName: z.string(),
  cycleId: z.string().uuid().optional(),
  planType: planTypeSchema,
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  totalAmount: z.number().positive(),
  deliveryAddress: z.string(),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema),
  createdAt: z.string().datetime(),
});

export type OrderDTO = z.infer<typeof orderSchema>;

export const createOrderSchema = z.object({
  customerId: z.string().uuid('Cliente inválido'),
  cycleId: z.string().uuid().optional(),
  planType: planTypeSchema,
  deliveryAddress: z.string().min(10, 'Endereço muito curto').max(500),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        dishId: z.string().uuid('Prato inválido'),
        quantity: z.number().int().min(1, 'Mínimo 1 unidade'),
      }),
    )
    .min(1, 'Pedido deve ter pelo menos 1 prato'),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  notes: z.string().max(500).optional(),
});

export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;
```

- [ ] **Step 7: Criar `packages/contracts/src/customer.schema.ts`**

```typescript
import { z } from 'zod';

export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  address: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
  lgpdConsent: z.boolean(),
  tags: z.array(z.string()),
  notes: z.string().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CustomerDTO = z.infer<typeof customerSchema>;

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().nullable(),
  address: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
  lgpdConsent: z.boolean().refine((v) => v === true, {
    message: 'Consentimento LGPD é obrigatório',
  }),
  notes: z.string().optional().nullable(),
});

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();

export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;

export const customerTagSchema = z.enum(['ACTIVE', 'INACTIVE', 'VIP', 'AT_RISK']);

export type CustomerTag = z.infer<typeof customerTagSchema>;
```

- [ ] **Step 8: Criar `packages/contracts/src/cycle.schema.ts`**

```typescript
import { z } from 'zod';

export const cycleStatusSchema = z.enum(['UPCOMING', 'OPEN', 'CLOSED', 'COMPLETED']);

export type CycleStatus = z.infer<typeof cycleStatusSchema>;

export const weeklyCycleSchema = z.object({
  id: z.string().uuid(),
  openDate: z.string().datetime(),
  closeDate: z.string().datetime(),
  deliveryDate: z.string().datetime(),
  status: cycleStatusSchema,
  dishes: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
});

export type WeeklyCycleDTO = z.infer<typeof weeklyCycleSchema>;

export const createCycleSchema = z.object({
  openDate: z.string().datetime('Data de abertura inválida'),
  closeDate: z.string().datetime('Data de fechamento inválida'),
  deliveryDate: z.string().datetime('Data de entrega inválida'),
  dishIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos 1 prato'),
});

export type CreateCycleDTO = z.infer<typeof createCycleSchema>;

export const updateCycleSchema = createCycleSchema.partial();

export type UpdateCycleDTO = z.infer<typeof updateCycleSchema>;
```

- [ ] **Step 9: Criar `packages/contracts/src/payment.schema.ts`**

```typescript
import { z } from 'zod';

export const paymentMethodSchema = z.enum(['PIX', 'CREDIT_CARD', 'PAYMENT_LINK']);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  method: paymentMethodSchema,
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'REFUNDED']),
  amount: z.number().positive(),
  paidAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
});

export type PaymentDTO = z.infer<typeof paymentSchema>;

export const createPaymentSchema = z.object({
  orderId: z.string().uuid('Pedido inválido'),
  method: paymentMethodSchema,
  amount: z.number().positive('Valor deve ser positivo'),
});

export type CreatePaymentDTO = z.infer<typeof createPaymentSchema>;

export const registerPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  paidAt: z.string().datetime().optional(),
});

export type RegisterPaymentDTO = z.infer<typeof registerPaymentSchema>;
```

- [ ] **Step 10: Criar `packages/contracts/src/subscription.schema.ts`**

```typescript
import { z } from 'zod';

export const subscriptionStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED']);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  planType: z.enum(['WEEKLY', 'MONTHLY']),
  status: subscriptionStatusSchema,
  startDate: z.string().datetime(),
  nextRenewal: z.string().datetime(),
  pausedUntil: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
});

export type SubscriptionDTO = z.infer<typeof subscriptionSchema>;

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid('Cliente inválido'),
  planType: z.enum(['WEEKLY', 'MONTHLY']),
});

export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionSchema>;

export const pauseSubscriptionSchema = z.object({
  pausedUntil: z.string().datetime('Data de retorno inválida'),
});

export type PauseSubscriptionDTO = z.infer<typeof pauseSubscriptionSchema>;
```

- [ ] **Step 11: Criar `packages/contracts/src/delivery.schema.ts`**

```typescript
import { z } from 'zod';

export const deliveryZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  fee: z.number().nonnegative('Taxa não pode ser negativa'),
  description: z.string().optional(),
});

export type DeliveryZoneDTO = z.infer<typeof deliveryZoneSchema>;

export const createDeliveryZoneSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  fee: z.number().nonnegative('Taxa não pode ser negativa'),
  description: z.string().optional(),
});

export type CreateDeliveryZoneDTO = z.infer<typeof createDeliveryZoneSchema>;
```

- [ ] **Step 12: Criar `packages/contracts/src/ingredient.schema.ts`**

```typescript
import { z } from 'zod';

export const ingredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Nome muito curto'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  stockQty: z.number().nonnegative(),
  minStock: z.number().nonnegative(),
  createdAt: z.string().datetime(),
});

export type IngredientDTO = z.infer<typeof ingredientSchema>;

export const createIngredientSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  stockQty: z.number().nonnegative().default(0),
  minStock: z.number().nonnegative().default(0),
});

export type CreateIngredientDTO = z.infer<typeof createIngredientSchema>;
```

- [ ] **Step 13: Criar `packages/contracts/src/recipe.schema.ts`**

```typescript
import { z } from 'zod';

export const recipeItemSchema = z.object({
  id: z.string().uuid(),
  dishId: z.string().uuid(),
  ingredientId: z.string().uuid(),
  ingredientName: z.string(),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unit: z.string(),
});

export type RecipeItemDTO = z.infer<typeof recipeItemSchema>;

export const createRecipeItemSchema = z.object({
  dishId: z.string().uuid('Prato inválido'),
  ingredientId: z.string().uuid('Ingrediente inválido'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
});

export type CreateRecipeItemDTO = z.infer<typeof createRecipeItemSchema>;
```

- [ ] **Step 14: Criar `packages/contracts/src/index.ts`**

```typescript
export * from './common.schema';
export * from './auth.schema';
export * from './dish.schema';
export * from './order.schema';
export * from './customer.schema';
export * from './cycle.schema';
export * from './payment.schema';
export * from './subscription.schema';
export * from './delivery.schema';
export * from './ingredient.schema';
export * from './recipe.schema';
```

- [ ] **Step 15: Commit**

```bash
git add packages/contracts/
git commit -m "feat: add contracts package with Zod schemas and TypeScript DTOs

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---


### Task 1.4: Criar `packages/database` — Prisma Schema completo

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/tsconfig.json`
- Create: `packages/database/prisma/schema.prisma`
- Create: `packages/database/prisma/seed.ts`
- Create: `packages/database/src/index.ts`

- [ ] **Step 1: Criar `packages/database/package.json`**

```json
{
  "name": "@juliana-gaspar/database",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:migrate": "prisma migrate dev --name init",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^6.1.0"
  },
  "devDependencies": {
    "@juliana-gaspar/config": "workspace:*",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.0.0",
    "bcryptjs": "^2.4.3",
    "prisma": "^6.1.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Criar `packages/database/tsconfig.json`**

```json
{
  "extends": "@juliana-gaspar/config/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src", "prisma/seed.ts"]
}
```

- [ ] **Step 3: Criar `packages/database/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         String   @default("ADMIN")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Customer {
  id                  String    @id @default(uuid())
  name                String
  phone               String    @unique
  email               String?
  address             String?
  dietaryRestrictions String?
  preferences         String?
  lgpdConsent         Boolean   @default(false)
  tags                String[]  @default([])
  notes               String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  orders        Order[]
  subscriptions Subscription[]
}

model Dish {
  id          String   @id @default(uuid())
  name        String
  description String
  photoUrl    String?
  ingredients String
  allergens   String?
  price       Float
  available   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]
  cycleDishes CycleDish[]
  recipeItems RecipeItem[]
}

model WeeklyCycle {
  id           String   @id @default(uuid())
  openDate     DateTime
  closeDate    DateTime
  deliveryDate DateTime
  status       String   @default("UPCOMING")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  orders      Order[]
  cycleDishes CycleDish[]
}

model CycleDish {
  id      String @id @default(uuid())
  cycleId String
  dishId  String

  cycle WeeklyCycle @relation(fields: [cycleId], references: [id], onDelete: Cascade)
  dish  Dish        @relation(fields: [dishId], references: [id], onDelete: Cascade)

  @@unique([cycleId, dishId])
}

model Order {
  id              String    @id @default(uuid())
  customerId      String
  cycleId         String?
  planType        String    @default("SINGLE")
  status          String    @default("PENDING")
  paymentStatus   String    @default("PENDING")
  totalAmount     Float
  deliveryAddress String
  deliveryDate    DateTime?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  customer Customer      @relation(fields: [customerId], references: [id])
  cycle    WeeklyCycle?  @relation(fields: [cycleId], references: [id])
  items    OrderItem[]
  payments Payment[]
}

model OrderItem {
  id        String @id @default(uuid())
  orderId   String
  dishId    String
  quantity  Int
  unitPrice Float

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  dish  Dish  @relation(fields: [dishId], references: [id])
}

model Payment {
  id        String    @id @default(uuid())
  orderId   String
  method    String
  status    String    @default("PENDING")
  amount    Float
  paidAt    DateTime?
  createdAt DateTime  @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model Subscription {
  id          String    @id @default(uuid())
  customerId  String
  planType    String
  status      String    @default("ACTIVE")
  startDate   DateTime  @default(now())
  nextRenewal DateTime
  pausedUntil DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  customer Customer @relation(fields: [customerId], references: [id])
}

model Ingredient {
  id        String   @id @default(uuid())
  name      String
  unit      String
  stockQty  Float    @default(0)
  minStock  Float    @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  recipeItems RecipeItem[]
}

model RecipeItem {
  id           String @id @default(uuid())
  dishId       String
  ingredientId String
  quantity     Float

  dish       Dish       @relation(fields: [dishId], references: [id], onDelete: Cascade)
  ingredient Ingredient @relation(fields: [ingredientId], references: [id], onDelete: Cascade)

  @@unique([dishId, ingredientId])
}

model DeliveryZone {
  id          String  @id @default(uuid())
  name        String
  fee         Float   @default(0)
  description String?
}
```

- [ ] **Step 4: Criar `packages/database/prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@julianagaspar.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Juliana Gaspar',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`  ✅ Admin: ${adminEmail}`);

  const dishes = await Promise.all([
    prisma.dish.create({ data: { name: 'Salmão Grelhado com Legumes', description: 'Filé de salmão grelhado ao molho de ervas finas com mix de legumes orgânicos e arroz integral.', ingredients: 'Salmão, abobrinha, cenoura, brócolis, arroz integral, azeite, ervas finas, sal', allergens: 'Peixe', price: 42.90, available: true }}),
    prisma.dish.create({ data: { name: 'Frango à Parmegiana Fit', description: 'Peito de frango empanado com farinha de amêndoas, molho de tomate caseiro e muçarela. Acompanha purê de couve-flor.', ingredients: 'Frango, farinha de amêndoas, tomate, muçarela, couve-flor, alho, cebola, manjericão', allergens: 'Laticínios, Oleaginosas', price: 38.90, available: true }}),
    prisma.dish.create({ data: { name: 'Bowl de Quinoa Vegano', description: 'Quinoa com legumes assados, grão-de-bico crocante, abacate, sementes de abóbora e molho tahine.', ingredients: 'Quinoa, grão-de-bico, abacate, cenoura, beterraba, sementes de abóbora, tahine, limão', allergens: 'Gergelim', price: 32.90, available: true }}),
    prisma.dish.create({ data: { name: 'Espaguete de Abobrinha', description: 'Abobrinha em fitas com camarões ao molho pesto de manjericão fresco e tomate cereja confit.', ingredients: 'Abobrinha, camarão, manjericão, tomate cereja, alho, azeite, pinoli, parmesão', allergens: 'Crustáceos, Laticínios', price: 45.90, available: true }}),
    prisma.dish.create({ data: { name: 'Carne de Panela Low Carb', description: 'Músculo cozido lentamente com cebola caramelizada, legumes rústicos e farofa de coco.', ingredients: 'Músculo bovino, cebola, cenoura, vagem, coco seco, farinha de amêndoas, alho, louro', allergens: 'Oleaginosas', price: 39.90, available: true }}),
    prisma.dish.create({ data: { name: 'Omelete de Forno Especial', description: 'Omelete assada com espinafre, tomate seco e queijo de cabra. Acompanha salada verde.', ingredients: 'Ovos, espinafre, tomate seco, queijo de cabra, folhas verdes, limão, azeite', allergens: 'Ovos, Laticínios', price: 28.90, available: true }}),
  ]);
  console.log(`  ✅ ${dishes.length} pratos criados`);

  await prisma.deliveryZone.createMany({
    data: [
      { name: 'Zona Leste', fee: 5.0, description: 'Bairros da zona leste' },
      { name: 'Zona Norte', fee: 8.0, description: 'Bairros da zona norte' },
      { name: 'Zona Sul', fee: 5.0, description: 'Bairros da zona sul' },
      { name: 'Zona Sudeste', fee: 7.0, description: 'Bairros da zona sudeste' },
      { name: 'Centro', fee: 0.0, description: 'Entrega gratuita' },
    ],
  });
  console.log('  ✅ Zonas de entrega criadas');
  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 5: Criar `packages/database/src/index.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

- [ ] **Step 6: Instalar e rodar migration**

```bash
cd "/home/wesley/Projetos/Juliana Gaspar"
pnpm install
cd packages/database
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

Expected: todas as tabelas criadas, seed com admin + 6 pratos + 5 zonas.

- [ ] **Step 7: Commit**

```bash
git add packages/database/ pnpm-lock.yaml
git commit -m "feat: add database package with Prisma schema, migrations, and seed

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 1.5: Criar Docker Compose

**Files:**
- Create: `docker/docker-compose.yml`
- Create: `docker/Dockerfile.api`
- Create: `docker/Dockerfile.web`

- [ ] **Step 1: Criar `docker/docker-compose.yml`**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: jg-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-juliana_gaspar}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    container_name: jg-api
    restart: unless-stopped
    ports:
      - '3001:3001'
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-juliana_gaspar}
      JWT_SECRET: ${JWT_SECRET:-change-me}
      JWT_EXPIRATION: ${JWT_EXPIRATION:-7d}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile.web
    container_name: jg-web
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      API_URL: http://api:3001
      NEXT_PUBLIC_API_URL: http://api:3001
    depends_on:
      - api

volumes:
  postgres_data:
```

- [ ] **Step 2: Criar `docker/Dockerfile.api`**

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=@juliana-gaspar/api

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

- [ ] **Step 3: Criar `docker/Dockerfile.web`**

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm turbo build --filter=@juliana-gaspar/web

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/web/server.js"]
```

- [ ] **Step 4: Commit**

```bash
git add docker/
git commit -m "feat: add Docker Compose with PostgreSQL, API, and Web services

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## MILESTONE 2: Backend NestJS — Fundação

### Task 2.1: Scaffold NestJS `apps/api`

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/common/pipes/zod-validation.pipe.ts`
- Create: `apps/api/src/common/filters/http-exception.filter.ts`
- Create: `apps/api/src/common/interceptors/transform.interceptor.ts`

- [ ] **Step 1: Criar `apps/api/package.json`**

```json
{
  "name": "@juliana-gaspar/api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@juliana-gaspar/contracts": "workspace:*",
    "@juliana-gaspar/database": "workspace:*",
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "bcryptjs": "^2.4.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@juliana-gaspar/config": "workspace:*",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.0.0",
    "@types/passport-jwt": "^4.0.1",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Criar `apps/api/tsconfig.json`**

```json
{
  "extends": "@juliana-gaspar/config/tsconfig/nest.json",
  "compilerOptions": { "outDir": "./dist", "baseUrl": "./" },
  "include": ["src"]
}
```

- [ ] **Step 3: Criar `apps/api/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

- [ ] **Step 4: Criar `apps/api/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}`);
}
bootstrap();
```

- [ ] **Step 5: Criar `apps/api/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CyclesModule } from './modules/cycles/cycles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveryModule } from './modules/delivery/delivery.module';

@Module({
  imports: [AuthModule, CatalogModule, OrdersModule, CyclesModule, CustomersModule, PaymentsModule, DeliveryModule],
})
export class AppModule {}
```

- [ ] **Step 6: Criar `apps/api/src/common/pipes/zod-validation.pipe.ts`**

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}
  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new BadRequestException({ message: 'Erro de validação', errors: messages });
    }
    return result.data;
  }
}
```

- [ ] **Step 7: Criar `apps/api/src/common/filters/http-exception.filter.ts`**

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : (body as any).message ?? message;
    }

    response.status(status).json({ statusCode: status, message, timestamp: new Date().toISOString() });
  }
}
```

- [ ] **Step 8: Criar `apps/api/src/common/interceptors/transform.interceptor.ts`**

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => ({ data, timestamp: new Date().toISOString() })));
  }
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/api/ pnpm-lock.yaml
git commit -m "feat: scaffold NestJS API with common pipes, filters, interceptors

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2.2: NestJS Auth Module

**Files:**
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Create: `apps/api/src/modules/auth/auth.controller.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
- Create: `apps/api/src/common/guards/jwt-auth.guard.ts`
- Create: `apps/api/src/common/guards/roles.guard.ts`
- Create: `apps/api/src/common/decorators/roles.decorator.ts`
- Create: `apps/api/src/common/decorators/current-user.decorator.ts`

- [ ] **Step 1: Criar `apps/api/src/modules/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION ?? '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 2: Criar `apps/api/src/modules/auth/auth.service.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import prisma from '@juliana-gaspar/database';
import type { LoginDTO, AuthResponse } from '@juliana-gaspar/contracts';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('E-mail ou senha inválidos');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('E-mail ou senha inválidos');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' },
    };
  }
}
```

- [ ] **Step 3: Criar `apps/api/src/modules/auth/auth.controller.ts`**

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { loginSchema, type LoginDTO } from '@juliana-gaspar/contracts';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDTO) {
    return this.authService.login(dto);
  }
}
```

- [ ] **Step 4: Criar `apps/api/src/modules/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    });
  }
  async validate(payload: { sub: string; email: string; role: string }) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

- [ ] **Step 5: Criar `apps/api/src/common/guards/jwt-auth.guard.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 6: Criar `apps/api/src/common/guards/roles.guard.ts`**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(), context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

- [ ] **Step 7: Criar `apps/api/src/common/decorators/roles.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

- [ ] **Step 8: Criar `apps/api/src/common/decorators/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
```

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/
git commit -m "feat: add NestJS auth module with JWT login and RBAC

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## MILESTONE 3: Backend NestJS — Módulos de Negócio

### Task 3.1: Catalog Module (CRUD de pratos)

**Files:**
- Create: `apps/api/src/modules/catalog/catalog.module.ts`
- Create: `apps/api/src/modules/catalog/catalog.controller.ts`
- Create: `apps/api/src/modules/catalog/catalog.service.ts`

- [ ] **Step 1: Criar `apps/api/src/modules/catalog/catalog.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
```

- [ ] **Step 2: Criar `apps/api/src/modules/catalog/catalog.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateDishDTO, UpdateDishDTO, DishDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class CatalogService {
  async findAll(page = 1, limit = 20, search?: string): Promise<{ data: DishDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { description: { contains: search, mode: 'insensitive' as const } }] } : {};
    const [data, total] = await Promise.all([
      prisma.dish.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.dish.count({ where }),
    ]);
    return { data: data.map(d => ({ ...d, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString() })), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<DishDTO> {
    const dish = await prisma.dish.findUnique({ where: { id } });
    if (!dish) throw new NotFoundException('Prato não encontrado');
    return { ...dish, createdAt: dish.createdAt.toISOString(), updatedAt: dish.updatedAt.toISOString() };
  }

  async create(dto: CreateDishDTO): Promise<DishDTO> {
    const dish = await prisma.dish.create({ data: dto });
    return { ...dish, createdAt: dish.createdAt.toISOString(), updatedAt: dish.updatedAt.toISOString() };
  }

  async update(id: string, dto: UpdateDishDTO): Promise<DishDTO> {
    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Prato não encontrado');
    const dish = await prisma.dish.update({ where: { id }, data: dto });
    return { ...dish, createdAt: dish.createdAt.toISOString(), updatedAt: dish.updatedAt.toISOString() };
  }

  async remove(id: string): Promise<void> {
    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Prato não encontrado');
    await prisma.dish.delete({ where: { id } });
  }

  async duplicate(id: string): Promise<DishDTO> {
    const original = await prisma.dish.findUnique({ where: { id } });
    if (!original) throw new NotFoundException('Prato não encontrado');
    const dish = await prisma.dish.create({
      data: { name: `${original.name} (cópia)`, description: original.description, photoUrl: original.photoUrl, ingredients: original.ingredients, allergens: original.allergens, price: original.price, available: original.available },
    });
    return { ...dish, createdAt: dish.createdAt.toISOString(), updatedAt: dish.updatedAt.toISOString() };
  }
}
```

- [ ] **Step 3: Criar `apps/api/src/modules/catalog/catalog.controller.ts`**

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CatalogService } from './catalog.service';
import { createDishSchema, updateDishSchema, type CreateDishDTO, type UpdateDishDTO } from '@juliana-gaspar/contracts';

@Controller('dishes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
    return this.catalogService.findAll(+page, +limit, search);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) {
    return this.catalogService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createDishSchema)) dto: CreateDishDTO) {
    return this.catalogService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateDishSchema)) dto: UpdateDishDTO) {
    return this.catalogService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }

  @Post(':id/duplicate')
  @Roles('ADMIN', 'OPERATOR')
  duplicate(@Param('id') id: string) {
    return this.catalogService.duplicate(id);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/catalog/
git commit -m "feat: add catalog module with dish CRUD, search, and duplicate

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3.2: Orders Module

**Files:**
- Create: `apps/api/src/modules/orders/orders.module.ts`
- Create: `apps/api/src/modules/orders/orders.controller.ts`
- Create: `apps/api/src/modules/orders/orders.service.ts`

- [ ] **Step 1: Criar `apps/api/src/modules/orders/orders.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

- [ ] **Step 2: Criar `apps/api/src/modules/orders/orders.service.ts`**

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateOrderDTO, UpdateOrderStatusDTO, OrderDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class OrdersService {
  async findAll(params: { page: number; limit: number; status?: string; paymentStatus?: string; planType?: string; customerId?: string; dateFrom?: string; dateTo?: string; search?: string }) {
    const { page, limit, status, paymentStatus, planType, customerId, dateFrom, dateTo, search } = params;
    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (planType) where.planType = planType;
    if (customerId) where.customerId = customerId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    if (search) {
      where.customer = { name: { contains: search, mode: 'insensitive' } };
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, phone: true } }, items: { include: { dish: { select: { name: true } } } } },
      }),
      prisma.order.count({ where }),
    ]);

    const mapped: OrderDTO[] = data.map(o => ({
      id: o.id, customerId: o.customerId, customerName: o.customer.name,
      cycleId: o.cycleId, planType: o.planType as any, status: o.status as any,
      paymentStatus: o.paymentStatus as any, totalAmount: o.totalAmount,
      deliveryAddress: o.deliveryAddress, deliveryDate: o.deliveryDate?.toISOString() ?? null,
      notes: o.notes, createdAt: o.createdAt.toISOString(),
      items: o.items.map(i => ({ id: i.id, dishId: i.dishId, dishName: i.dish.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    }));

    return { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<OrderDTO> {
    const o = await prisma.order.findUnique({
      where: { id },
      include: { customer: { select: { name: true, phone: true } }, items: { include: { dish: { select: { name: true } } } } },
    });
    if (!o) throw new NotFoundException('Pedido não encontrado');
    return {
      id: o.id, customerId: o.customerId, customerName: o.customer.name,
      cycleId: o.cycleId, planType: o.planType as any, status: o.status as any,
      paymentStatus: o.paymentStatus as any, totalAmount: o.totalAmount,
      deliveryAddress: o.deliveryAddress, deliveryDate: o.deliveryDate?.toISOString() ?? null,
      notes: o.notes, createdAt: o.createdAt.toISOString(),
      items: o.items.map(i => ({ id: i.id, dishId: i.dishId, dishName: i.dish.name, quantity: i.quantity, unitPrice: i.unitPrice })),
    };
  }

  async create(dto: CreateOrderDTO): Promise<OrderDTO> {
    const customer = await prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new BadRequestException('Cliente não encontrado');

    const dishes = await prisma.dish.findMany({ where: { id: { in: dto.items.map(i => i.dishId) } } });
    if (dishes.length !== dto.items.length) throw new BadRequestException('Um ou mais pratos não encontrados');

    let total = 0;
    for (const item of dto.items) {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish) throw new BadRequestException(`Prato ${item.dishId} não encontrado`);
      total += dish.price * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        customerId: dto.customerId, cycleId: dto.cycleId, planType: dto.planType,
        totalAmount: total, deliveryAddress: dto.deliveryAddress,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        notes: dto.notes,
        items: { create: dto.items.map(i => ({ dishId: i.dishId, quantity: i.quantity, unitPrice: dishes.find(d => d.id === i.dishId)!.price })) },
      },
      include: { customer: { select: { name: true } }, items: { include: { dish: { select: { name: true } } } } },
    });

    return this.findById(order.id);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDTO): Promise<OrderDTO> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pedido não encontrado');
    await prisma.order.update({ where: { id }, data: { status: dto.status, notes: dto.notes ?? existing.notes } });
    return this.findById(id);
  }
}
```

- [ ] **Step 3: Criar `apps/api/src/modules/orders/orders.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { createOrderSchema, updateOrderStatusSchema, type CreateOrderDTO, type UpdateOrderStatusDTO } from '@juliana-gaspar/contracts';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query() query: any) {
    return this.ordersService.findAll({
      page: +query.page || 1, limit: +query.limit || 20,
      status: query.status, paymentStatus: query.paymentStatus, planType: query.planType,
      customerId: query.customerId, dateFrom: query.dateFrom, dateTo: query.dateTo, search: query.search,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) { return this.ordersService.findById(id); }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDTO) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'OPERATOR')
  updateStatus(@Param('id') id: string, @Body(new ZodValidationPipe(updateOrderStatusSchema)) dto: UpdateOrderStatusDTO) {
    return this.ordersService.updateStatus(id, dto);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/orders/
git commit -m "feat: add orders module with CRUD, filtering, and status flow

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3.3: Customers, Cycles, Payments, Delivery Modules

**Files:**
- Create: `apps/api/src/modules/customers/customers.module.ts`
- Create: `apps/api/src/modules/customers/customers.controller.ts`
- Create: `apps/api/src/modules/customers/customers.service.ts`
- Create: `apps/api/src/modules/cycles/cycles.module.ts`
- Create: `apps/api/src/modules/cycles/cycles.controller.ts`
- Create: `apps/api/src/modules/cycles/cycles.service.ts`
- Create: `apps/api/src/modules/payments/payments.module.ts`
- Create: `apps/api/src/modules/payments/payments.controller.ts`
- Create: `apps/api/src/modules/payments/payments.service.ts`
- Create: `apps/api/src/modules/delivery/delivery.module.ts`
- Create: `apps/api/src/modules/delivery/delivery.controller.ts`
- Create: `apps/api/src/modules/delivery/delivery.service.ts`

- [ ] **Step 1: Criar Customers module**

`apps/api/src/modules/customers/customers.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
@Module({ controllers: [CustomersController], providers: [CustomersService], exports: [CustomersService] })
export class CustomersModule {}
```

`apps/api/src/modules/customers/customers.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateCustomerDTO, UpdateCustomerDTO, CustomerDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class CustomersService {
  async findAll(page = 1, limit = 20, search?: string, tag?: string) {
    const where: any = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }];
    if (tag) where.tags = { has: tag };
    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<CustomerDTO> {
    const c = await prisma.customer.findUnique({ where: { id }, include: { orders: { select: { id: true, totalAmount: true, status: true, createdAt: true } } } });
    if (!c) throw new NotFoundException('Cliente não encontrado');
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(), tags: c.tags as any };
  }

  async create(dto: CreateCustomerDTO): Promise<CustomerDTO> {
    const c = await prisma.customer.create({ data: { ...dto, tags: [] } });
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(), tags: c.tags as any };
  }

  async update(id: string, dto: UpdateCustomerDTO): Promise<CustomerDTO> {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    const c = await prisma.customer.update({ where: { id }, data: dto as any });
    return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(), tags: c.tags as any };
  }
}
```

`apps/api/src/modules/customers/customers.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CustomersService } from './customers.service';
import { createCustomerSchema, updateCustomerSchema, type CreateCustomerDTO, type UpdateCustomerDTO } from '@juliana-gaspar/contracts';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string, @Query('tag') tag?: string) {
    return this.customersService.findAll(+page, +limit, search, tag);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) { return this.customersService.findById(id); }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createCustomerSchema)) dto: CreateCustomerDTO) { return this.customersService.create(dto); }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateCustomerSchema)) dto: UpdateCustomerDTO) {
    return this.customersService.update(id, dto);
  }
}
```

- [ ] **Step 2: Criar Cycles module**

`apps/api/src/modules/cycles/cycles.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { CyclesController } from './cycles.controller';
import { CyclesService } from './cycles.service';
@Module({ controllers: [CyclesController], providers: [CyclesService], exports: [CyclesService] })
export class CyclesModule {}
```

`apps/api/src/modules/cycles/cycles.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateCycleDTO, UpdateCycleDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class CyclesService {
  async findAll(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      prisma.weeklyCycle.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { cycleDishes: { include: { dish: { select: { id: true, name: true, price: true } } } } } }),
      prisma.weeklyCycle.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const cycle = await prisma.weeklyCycle.findUnique({ where: { id }, include: { cycleDishes: { include: { dish: true } }, orders: true } });
    if (!cycle) throw new NotFoundException('Ciclo não encontrado');
    const revenue = cycle.orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0);
    return { ...cycle, orderCount: cycle.orders.length, revenue };
  }

  async create(dto: CreateCycleDTO) {
    const cycle = await prisma.weeklyCycle.create({
      data: {
        openDate: new Date(dto.openDate), closeDate: new Date(dto.closeDate), deliveryDate: new Date(dto.deliveryDate),
        cycleDishes: { create: dto.dishIds.map(dishId => ({ dishId })) },
      },
      include: { cycleDishes: { include: { dish: true } } },
    });
    return cycle;
  }

  async update(id: string, dto: UpdateCycleDTO) {
    const existing = await prisma.weeklyCycle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ciclo não encontrado');
    const data: any = {};
    if (dto.openDate) data.openDate = new Date(dto.openDate);
    if (dto.closeDate) data.closeDate = new Date(dto.closeDate);
    if (dto.deliveryDate) data.deliveryDate = new Date(dto.deliveryDate);

    await prisma.weeklyCycle.update({ where: { id }, data });

    if (dto.dishIds) {
      await prisma.cycleDish.deleteMany({ where: { cycleId: id } });
      await prisma.cycleDish.createMany({ data: dto.dishIds.map(dishId => ({ cycleId: id, dishId })) });
    }
    return this.findById(id);
  }
}
```

`apps/api/src/modules/cycles/cycles.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CyclesService } from './cycles.service';
import { createCycleSchema, updateCycleSchema, type CreateCycleDTO, type UpdateCycleDTO } from '@juliana-gaspar/contracts';

@Controller('cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CyclesController {
  constructor(private cyclesService: CyclesService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) { return this.cyclesService.findAll(+page, +limit); }

  @Get(':id')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findById(@Param('id') id: string) { return this.cyclesService.findById(id); }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createCycleSchema)) dto: CreateCycleDTO) { return this.cyclesService.create(dto); }

  @Put(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateCycleSchema)) dto: UpdateCycleDTO) {
    return this.cyclesService.update(id, dto);
  }
}
```

- [ ] **Step 3: Criar Payments module**

`apps/api/src/modules/payments/payments.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
@Module({ controllers: [PaymentsController], providers: [PaymentsService], exports: [PaymentsService] })
export class PaymentsModule {}
```

`apps/api/src/modules/payments/payments.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreatePaymentDTO, RegisterPaymentDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class PaymentsService {
  async findAll(page = 1, limit = 20, status?: string, method?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (method) where.method = method;
    const [data, total] = await Promise.all([
      prisma.payment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { order: { select: { id: true, customer: { select: { name: true } } } } } }),
      prisma.payment.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(dto: CreatePaymentDTO) {
    const order = await prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return prisma.payment.create({ data: dto });
  }

  async register(id: string, dto: RegisterPaymentDTO) {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');

    const updated = await prisma.payment.update({ where: { id }, data: { status: 'PAID', paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date() } });
    await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'PAID' } });
    return updated;
  }
}
```

`apps/api/src/modules/payments/payments.controller.ts`:
```typescript
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { createPaymentSchema, registerPaymentSchema, type CreatePaymentDTO, type RegisterPaymentDTO } from '@juliana-gaspar/contracts';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  findAll(@Query() query: any) { return this.paymentsService.findAll(+query.page || 1, +query.limit || 20, query.status, query.method); }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body(new ZodValidationPipe(createPaymentSchema)) dto: CreatePaymentDTO) { return this.paymentsService.create(dto); }

  @Patch(':id/register')
  @Roles('ADMIN', 'OPERATOR')
  register(@Param('id') id: string, @Body(new ZodValidationPipe(registerPaymentSchema)) dto: RegisterPaymentDTO) {
    return this.paymentsService.register(id, dto);
  }
}
```

- [ ] **Step 4: Criar Delivery module**

`apps/api/src/modules/delivery/delivery.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
@Module({ controllers: [DeliveryController], providers: [DeliveryService], exports: [DeliveryService] })
export class DeliveryModule {}
```

`apps/api/src/modules/delivery/delivery.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';
import type { CreateDeliveryZoneDTO } from '@juliana-gaspar/contracts';

@Injectable()
export class DeliveryService {
  async findAllZones() { return prisma.deliveryZone.findMany(); }

  async createZone(dto: CreateDeliveryZoneDTO) { return prisma.deliveryZone.create({ data: dto }); }

  async updateZone(id: string, dto: Partial<CreateDeliveryZoneDTO>) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Zona de entrega não encontrada');
    return prisma.deliveryZone.update({ where: { id }, data: dto });
  }

  async deleteZone(id: string) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Zona de entrega não encontrada');
    return prisma.deliveryZone.delete({ where: { id } });
  }

  async getManifest(zoneId?: string, date?: string) {
    const where: any = { status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY'] } };
    if (date) where.deliveryDate = new Date(date);
    const orders = await prisma.order.findMany({
      where, orderBy: { deliveryAddress: 'asc' },
      include: { customer: { select: { name: true, phone: true, address: true } }, items: { include: { dish: { select: { name: true, allergens: true } } } } },
    });
    return { date: date ?? new Date().toISOString().split('T')[0], orderCount: orders.length, orders };
  }
}
```

`apps/api/src/modules/delivery/delivery.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DeliveryService } from './delivery.service';
import { createDeliveryZoneSchema, type CreateDeliveryZoneDTO } from '@juliana-gaspar/contracts';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('zones')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  getZones() { return this.deliveryService.findAllZones(); }

  @Post('zones')
  @Roles('ADMIN')
  createZone(@Body(new ZodValidationPipe(createDeliveryZoneSchema)) dto: CreateDeliveryZoneDTO) { return this.deliveryService.createZone(dto); }

  @Put('zones/:id')
  @Roles('ADMIN')
  updateZone(@Param('id') id: string, @Body() dto: Partial<CreateDeliveryZoneDTO>) { return this.deliveryService.updateZone(id, dto); }

  @Delete('zones/:id')
  @Roles('ADMIN')
  deleteZone(@Param('id') id: string) { return this.deliveryService.deleteZone(id); }

  @Get('manifest')
  @Roles('ADMIN', 'OPERATOR', 'VIEWER')
  getManifest(@Query('zoneId') zoneId?: string, @Query('date') date?: string) { return this.deliveryService.getManifest(zoneId, date); }
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/customers/ apps/api/src/modules/cycles/ apps/api/src/modules/payments/ apps/api/src/modules/delivery/
git commit -m "feat: add customers, cycles, payments, and delivery modules

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## MILESTONE 4: Frontend Next.js — Fundação

### Task 4.1: Scaffold Next.js `apps/web`

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/src/styles/globals.css`
- Create: `apps/web/src/lib/utils.ts`
- Create: `apps/web/src/lib/api-client.ts`
- Create: `apps/web/src/lib/formatters.ts`
- Create: `apps/web/src/lib/constants.ts`
- Create: `apps/web/src/server/db.ts`
- Create: `apps/web/src/app/(landing)/layout.tsx`
- Create: `apps/web/src/app/(landing)/page.tsx`
- Create: `apps/web/src/app/(admin)/layout.tsx`
- Create: `apps/web/src/app/auth/login/page.tsx`

- [ ] **Step 1: Criar `apps/web/package.json`**

```json
{
  "name": "@juliana-gaspar/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@juliana-gaspar/contracts": "workspace:*",
    "@juliana-gaspar/database": "workspace:*",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.0",
    "sonner": "^1.7.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@juliana-gaspar/config": "workspace:*",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Criar `apps/web/next.config.ts`**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    formats: ['image/webp'],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Criar `apps/web/tsconfig.json`**

```json
{
  "extends": "@juliana-gaspar/config/tsconfig/next.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Criar `apps/web/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Oliva & Botânico palette
        brand: {
          50: '#F7F3E8',
          100: '#EBE5CF',
          200: '#D4DAA5', // accent light
          300: '#B3C482',
          400: '#8FA86E', // mid green
          500: '#5A7D3C', // primary green
          600: '#4A6B30',
          700: '#3B5E2B', // dark green
          800: '#2E4A22',
          900: '#1E3116',
        },
        warm: {
          50: '#FEFDFB',
          100: '#FDF9F0',
          200: '#FAF0DC',
          300: '#F5E6C8',
          400: '#E8D5A8',
          500: '#D4B87A',
        },
      },
      fontFamily: {
        heading: ['Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

- [ ] **Step 5: Criar `apps/web/postcss.config.mjs`**

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
export default config;
```

- [ ] **Step 6: Criar `apps/web/src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 46 25% 97%;
    --foreground: 98 30% 15%;
    --card: 46 25% 97%;
    --card-foreground: 98 30% 15%;
    --primary: 90 30% 35%;
    --primary-foreground: 46 25% 97%;
    --secondary: 46 20% 88%;
    --secondary-foreground: 98 30% 15%;
    --muted: 46 15% 90%;
    --muted-foreground: 98 15% 40%;
    --accent: 70 30% 75%;
    --accent-foreground: 98 30% 15%;
    --destructive: 0 65% 45%;
    --destructive-foreground: 46 25% 97%;
    --border: 98 15% 80%;
    --input: 98 15% 80%;
    --ring: 90 30% 35%;
    --radius: 0.75rem;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground font-body;
    font-size: 16px;
    -webkit-tap-highlight-color: transparent;
  }
}
```

- [ ] **Step 7: Criar `apps/web/src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 8: Criar `apps/web/src/lib/api-client.ts`**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type RequestConfig = {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
};

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${API_URL}/api${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }

  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    const res = await fetch(this.buildUrl(path, config?.params), {
      headers: { Authorization: `Bearer ${this.getToken()}`, ...config?.headers },
    });
    if (!res.ok) { const err = await res.json().catch(() => ({ message: 'Erro de rede' })); throw new Error(err.message); }
    const json = await res.json();
    return json.data ?? json;
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const res = await fetch(this.buildUrl(path), {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.getToken()}` }, body: JSON.stringify(body),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({ message: 'Erro de rede' })); throw new Error(err.message); }
    const json = await res.json();
    return json.data ?? json;
  }

  async put<T>(path: string, body?: any): Promise<T> {
    const res = await fetch(this.buildUrl(path), {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.getToken()}` }, body: JSON.stringify(body),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({ message: 'Erro de rede' })); throw new Error(err.message); }
    const json = await res.json();
    return json.data ?? json;
  }

  async patch<T>(path: string, body?: any): Promise<T> {
    const res = await fetch(this.buildUrl(path), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.getToken()}` }, body: JSON.stringify(body),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({ message: 'Erro de rede' })); throw new Error(err.message); }
    const json = await res.json();
    return json.data ?? json;
  }

  async delete(path: string): Promise<void> {
    const res = await fetch(this.buildUrl(path), {
      method: 'DELETE', headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    if (!res.ok) { const err = await res.json().catch(() => ({ message: 'Erro de rede' })); throw new Error(err.message); }
  }
}

export const apiClient = new ApiClient();
```

- [ ] **Step 9: Criar `apps/web/src/lib/formatters.ts`**

```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  if (cleaned.length === 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return phone;
}

export function formatWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const base = `https://wa.me/55${cleaned}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
```

- [ ] **Step 10: Criar `apps/web/src/lib/constants.ts`**

```typescript
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5586999999999';

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  IN_PRODUCTION: 'Em produção',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Vencido',
  REFUNDED: 'Reembolsado',
};

export const PLAN_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Pedido único',
  WEEKLY: 'Kit semanal',
  MONTHLY: 'Assinatura mensal',
};
```

- [ ] **Step 11: Criar `apps/web/src/server/db.ts`**

```typescript
import 'server-only';
import { PrismaClient } from '@juliana-gaspar/database';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

- [ ] **Step 12: Commit**

```bash
git add apps/web/ pnpm-lock.yaml
git commit -m "feat: scaffold Next.js app with Tailwind, shadcn/ui deps, and utilities

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4.2: Criar componentes shadcn/ui essenciais

**Files:**
- Create: `apps/web/src/components/ui/button.tsx`
- Create: `apps/web/src/components/ui/input.tsx`
- Create: `apps/web/src/components/ui/label.tsx`
- Create: `apps/web/src/components/ui/card.tsx`
- Create: `apps/web/src/components/ui/badge.tsx`
- Create: `apps/web/src/components/ui/skeleton.tsx`
- Create: `apps/web/src/components/ui/sheet.tsx`
- Create: `apps/web/src/components/ui/dialog.tsx`
- Create: `apps/web/src/components/ui/select.tsx`
- Create: `apps/web/src/components/ui/textarea.tsx`
- Create: `apps/web/src/components/ui/tabs.tsx`
- Create: `apps/web/src/components/ui/accordion.tsx`
- Create: `apps/web/src/components/ui/table.tsx`
- Create: `apps/web/src/components/ui/data-table.tsx`
- Create: `apps/web/src/components/ui/empty-state.tsx`
- Create: `apps/web/src/components/ui/pagination.tsx`
- Create: `apps/web/src/lib/hooks/use-media-query.ts`

- [ ] **Step 1: Criar `apps/web/src/components/ui/button.tsx`**

```typescript
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-brand-500 text-brand-500 hover:bg-brand-50 active:bg-brand-100',
        ghost: 'hover:bg-muted active:bg-muted',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-brand-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2 text-xs',
        lg: 'h-14 px-8 py-4 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

- [ ] **Step 2: Criar outros componentes shadcn/ui**

`apps/web/src/components/ui/input.tsx`:
```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} className={cn('flex h-12 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)} ref={ref} {...props} />
  ),
);
Input.displayName = 'Input';
export { Input };
```

`apps/web/src/components/ui/label.tsx`:
```typescript
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />
  ),
);
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
```

`apps/web/src/components/ui/card.tsx`:
```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-2xl border bg-card text-card-foreground shadow-sm', className)} {...props} />
  ),
);
Card.displayName = 'Card';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-4 md:p-6', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

export { Card, CardContent };
```

`apps/web/src/components/ui/badge.tsx`:
```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        destructive: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

`apps/web/src/components/ui/skeleton.tsx`:
```typescript
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-xl bg-muted', className)} {...props} />;
}

export { Skeleton };
```

`apps/web/src/components/ui/empty-state.tsx`:
```typescript
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="text-4xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="h-12 px-6 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 active:bg-brand-700 transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Criar `use-media-query.ts`**

```typescript
'use client';
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/ui/ apps/web/src/lib/hooks/
git commit -m "feat: add shadcn/ui components (button, input, card, badge, skeleton, empty-state)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---


## MILESTONE 5: Landing Page Completa

### Task 5.1: Layout público + SEO + Schema LD+JSON

**Files:**
- Create: `apps/web/src/app/(landing)/layout.tsx`
- Create: `apps/web/src/app/(landing)/loading.tsx`
- Create: `apps/web/src/app/(landing)/error.tsx`
- Create: `apps/web/src/app/(landing)/not-found.tsx`

- [ ] **Step 1: Criar `apps/web/src/app/(landing)/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Juliana Gaspar — Comida Afetiva e Saudável em Teresina',
    template: '%s | Juliana Gaspar',
  },
  description: 'Comida artesanal saudável entregue na sua casa em Teresina. Cardápio semanal, ingredientes selecionados, delivery programado. Peça pelo WhatsApp!',
  keywords: ['comida saudável Teresina', 'comida artesanal', 'assinatura de comida', 'delivery saudável', 'Juliana Gaspar'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Juliana Gaspar',
    title: 'Juliana Gaspar — Comida Afetiva e Saudável',
    description: 'Comida artesanal saudável entregue na sua casa em Teresina. Cardápio semanal, ingredientes selecionados, delivery programado.',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Juliana Gaspar — Comida afetiva e saudável' }],
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <!-- Meta Pixel / GA4 placeholder --> */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Juliana Gaspar',
            description: 'Comida artesanal saudável entregue em casa. Cardápio semanal com ingredientes selecionados.',
            image: 'https://julianagaspar.com.br/images/logo.svg',
            address: { '@type': 'PostalAddress', streetAddress: '', addressLocality: 'Teresina', addressRegion: 'PI', postalCode: '', addressCountry: 'BR' },
            telephone: '+55' + process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '',
            priceRange: 'R$28-R$46',
            servesCuisine: 'Saudável, Artesanal, Brasileira',
            openingHours: 'Mo-Fr 08:00-18:00',
          }),
        }}
      />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
```

- [ ] **Step 2: Criar `apps/web/src/app/(landing)/loading.tsx`**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export default function LandingLoading() {
  return (
    <div className="space-y-8 p-4">
      <Skeleton className="h-[300px] w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/
git commit -m "feat: add landing layout with SEO, Open Graph, and LocalBusiness LD+JSON

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5.2: Feature Landing — todos os componentes

**Files:**
- Create: `apps/web/src/features/landing/types/index.ts`
- Create: `apps/web/src/features/landing/index.ts`
- Create: `apps/web/src/features/landing/components/hero.tsx`
- Create: `apps/web/src/features/landing/components/como-funciona.tsx`
- Create: `apps/web/src/features/landing/components/cardapio-semanal.tsx`
- Create: `apps/web/src/features/landing/components/cardapio-card.tsx`
- Create: `apps/web/src/features/landing/components/diferenciais.tsx`
- Create: `apps/web/src/features/landing/components/depoimentos.tsx`
- Create: `apps/web/src/features/landing/components/faq.tsx`
- Create: `apps/web/src/features/landing/components/cta-section.tsx`
- Create: `apps/web/src/features/landing/components/footer.tsx`
- Create: `apps/web/src/features/landing/components/floating-whatsapp.tsx`
- Create: `apps/web/src/features/landing/services/landing.service.ts`
- Create: `apps/web/src/app/(landing)/page.tsx`

- [ ] **Step 1: Criar `types/index.ts`**

```typescript
export type DishCard = {
  id: string;
  name: string;
  description: string;
  price: number;
  photoUrl: string | null;
  allergens: string | null;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  text: string;
  stars: number;
};

export type FAQItem = {
  question: string;
  answer: string;
};
```

- [ ] **Step 2: Criar `components/hero.tsx`**

```typescript
'use client';
import { Button } from '@/components/ui/button';
import { formatWhatsAppLink } from '@/lib/formatters';
import { WHATSAPP_NUMBER } from '@/lib/constants';

export function Hero() {
  const whatsappMessage = 'Olá, Juliana! Gostaria de ver o cardápio da semana.';
  return (
    <section className="relative min-h-[90dvh] flex items-center justify-center px-4 py-16 md:py-24 bg-gradient-to-b from-brand-50 to-warm-100">
      <div className="max-w-3xl text-center space-y-6">
        <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
          Teresina, PI
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-800 leading-tight">
          Comida afetiva e saudável para resolver sua semana.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Ingredientes selecionados, cardápio que muda toda semana e entrega programada na sua casa.
          Coma bem sem perder tempo na cozinha.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="text-base w-full sm:w-auto" asChild>
            <a href="#cardapio">Ver cardápio da semana</a>
          </Button>
          <Button size="lg" variant="outline" className="text-base w-full sm:w-auto border-brand-600 text-brand-600 hover:bg-brand-50" asChild>
            <a href={formatWhatsAppLink(WHATSAPP_NUMBER, whatsappMessage)} target="_blank" rel="noopener noreferrer">
              Pedir pelo WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Criar `components/como-funciona.tsx`**

```typescript
const steps = [
  { number: 1, title: 'Escolha o cardápio', description: 'Veja os pratos da semana. Tem opção de pedido único, kit semanal ou assinatura mensal.' },
  { number: 2, title: 'Faça seu pedido', description: 'Escolha os pratos e faça o pedido antes do prazo. Toda semana abrimos a janela de pedidos.' },
  { number: 3, title: 'Receba em casa', description: 'Entregamos no dia programado, com todo o cuidado e carinho que sua comida merece.' },
  { number: 4, title: 'Aqueça e aproveite', description: 'Pronto em minutos. É só aquecer e desfrutar de uma refeição caseira e deliciosa.' },
];

export function ComoFunciona() {
  return (
    <section className="py-16 md:py-24 px-4 bg-warm-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-800 text-center mb-4">
          Como funciona?
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">
          Simples assim: você escolhe, a gente cozinha e entrega na sua porta
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step) => (
            <div key={step.number} className="text-center space-y-3 p-4">
              <div className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                {step.number}
              </div>
              <h3 className="font-semibold text-brand-800 text-sm md:text-base">{step.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Criar `components/cardapio-card.tsx`**

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import type { DishCard } from '../types';

type CardapioCardProps = { dish: DishCard };

export function CardapioCard({ dish }: CardapioCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] bg-warm-200 flex items-center justify-center text-4xl">
        🍽️
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-sm md:text-base text-brand-800">{dish.name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{dish.description}</p>
        {dish.allergens && (
          <p className="text-2xs text-brand-600 font-medium">⚠️ Alérgenos: {dish.allergens}</p>
        )}
        <p className="text-lg font-bold text-brand-700">{formatCurrency(dish.price)}</p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Criar `components/cardapio-semanal.tsx`**

```typescript
'use client';
import { useState, useEffect } from 'react';
import { CardapioCard } from './cardapio-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { landingService } from '../services/landing.service';
import { formatWhatsAppLink } from '@/lib/formatters';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import type { DishCard } from '../types';

const planOptions = [
  { type: 'SINGLE', title: 'Pedido Único', description: 'Escolha os pratos que quiser', price: 'a partir de R$28,90' },
  { type: 'WEEKLY', title: 'Kit Semanal', description: '5 pratos por semana', price: 'a partir de R$149,90/mês' },
  { type: 'MONTHLY', title: 'Assinatura Mensal', description: '20 pratos por mês', price: 'a partir de R$559,90/mês' },
];

export function CardapioSemanal() {
  const [dishes, setDishes] = useState<DishCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    landingService.getDishes().then(setDishes).finally(() => setLoading(false));
  }, []);

  const msg = 'Olá, Juliana! Quero fazer meu pedido.';
  const whatsappLink = formatWhatsAppLink(WHATSAPP_NUMBER, msg);

  return (
    <section id="cardapio" className="py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-800 text-center mb-4">
          Cardápio da Semana
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-md mx-auto">
          Pratos preparados com ingredientes frescos e muito carinho. Cardápio novo toda semana.
        </p>

        {/* Plan options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {planOptions.map((plan) => (
            <div key={plan.type} className="border border-brand-200 rounded-2xl p-6 text-center space-y-3 hover:border-brand-400 transition-colors">
              <h3 className="font-semibold text-brand-800">{plan.title}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <p className="text-xl font-bold text-brand-700">{plan.price}</p>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="w-full">Escolher</Button>
              </a>
            </div>
          ))}
        </div>

        {/* Dish cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dishes.map((dish) => <CardapioCard key={dish.id} dish={dish} />)}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Criar `components/diferenciais.tsx`**

```typescript
const diffs = [
  { icon: '🥬', title: 'Ingredientes premium', description: 'Selecionamos os melhores ingredientes locais, frescos e de fornecedores que conhecemos pessoalmente.' },
  { icon: '📋', title: 'Ficha técnica profissional', description: 'Cada prato tem receita padronizada e porções calculadas por nutricionista para uma alimentação equilibrada.' },
  { icon: '🚫', title: 'Zero conservantes', description: 'Nada de químicos, corantes ou conservantes. Comida de verdade, feita como na sua casa.' },
  { icon: '👩‍🍳', title: 'Produção artesanal', description: 'Cada prato é preparado em pequenos lotes, garantindo sabor caseiro e atenção aos detalhes.' },
  { icon: '🚚', title: 'Entrega programada', description: 'Você sabe exatamente quando sua comida chega. Sem surpresas, sem esperas.' },
];

export function Diferenciais() {
  return (
    <section className="py-16 md:py-24 px-4 bg-brand-700 text-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-4">
          Por que escolher a Juliana?
        </h2>
        <p className="text-brand-200 text-center mb-12 max-w-md mx-auto">
          Não é só comida. É cuidado, qualidade e praticidade em cada detalhe.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diffs.map((d) => (
            <div key={d.title} className="flex gap-4 items-start p-4">
              <span className="text-3xl flex-shrink-0">{d.icon}</span>
              <div>
                <h3 className="font-semibold text-white mb-1">{d.title}</h3>
                <p className="text-sm text-brand-200 leading-relaxed">{d.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Criar `components/depoimentos.tsx`**

```typescript
import type { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  { id: '1', name: 'Dra. Camila Rocha', role: 'Nutricionista', text: 'Recomendo a Juliana para meus pacientes porque sei que a comida é de verdade: ingredientes frescos, sem conservantes e com porções equilibradas. É uma extensão da prescrição nutricional.', stars: 5 },
  { id: '2', name: 'Ana Clara Moura', role: 'Empresária', text: 'Minha semana mudou depois que conheci a Juliana. Não me preocupo mais com almoço e janta, e ainda como muito melhor do que quando eu cozinhava.', stars: 5 },
  { id: '3', name: 'Dra. Patrícia Soares', role: 'Médica', text: 'Como médica, tenho pouco tempo mas não abro mão de comer bem. A Juliana resolve minha semana com comida saudável e deliciosa. É minha escolha desde 2024.', stars: 5 },
  { id: '4', name: 'Marina Alves', role: 'Mãe e advogada', text: 'Depois que virei mãe, cozinhar virou um luxo. A comida da Juliana salva minha semana e ainda me sinto bem sabendo que estou comendo comida caseira de verdade.', stars: 5 },
];

export function Depoimentos() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-800 text-center mb-4">
          Quem ama a Juliana
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">
          Clientes reais que confiam na nossa comida toda semana.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {testimonials.map((t) => (
            <div key={t.id} className="snap-start border border-brand-100 rounded-2xl p-6 space-y-3 bg-white flex-shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-1 text-amber-500">{'★'.repeat(t.stars)}</div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="font-semibold text-brand-800 text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Criar `components/faq.tsx`**

```typescript
'use client';
import { useState } from 'react';
import type { FAQItem } from '../types';

const faqs: FAQItem[] = [
  { question: 'Como funciona a assinatura?', answer: 'Você escolhe entre o plano semanal (5 pratos) ou mensal (20 pratos). Toda semana você confirma ou ajusta seu pedido. A entrega acontece no dia programado.' },
  { question: 'Posso pausar minha assinatura?', answer: 'Sim! Você pode pausar por até 4 semanas. É só avisar pelo WhatsApp. Quando voltar, sua assinatura é reativada normalmente.' },
  { question: 'Qual a área de entrega?', answer: 'Entregamos em toda Teresina, PI. Bairros mais distantes podem ter taxa adicional. Consulte a disponibilidade para seu endereço.' },
  { question: 'Como armazenar a comida?', answer: 'As refeições devem ser mantidas refrigeradas (2°C a 8°C) e consumidas em até 5 dias. Cada embalagem tem a data de validade e instruções de aquecimento.' },
  { question: 'Tem opções para restrições alimentares?', answer: 'Sim! Trabalhamos com opções sem glúten, sem lactose, low carb e vegetarianas. Informe suas restrições ao fazer o pedido que adaptamos os pratos.' },
  { question: 'Qual o prazo para pedir?', answer: 'A janela de pedidos abre toda segunda-feira e fecha na quarta às 18h. A entrega é na sexta-feira seguinte. Pedidos após o prazo entram na próxima semana.' },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 px-4 bg-warm-50">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-800 text-center mb-4">
          Perguntas frequentes
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-brand-100 rounded-xl bg-white overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 md:p-5 text-left min-h-[48px] hover:bg-brand-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="font-medium text-sm md:text-base text-brand-800 pr-4">{faq.question}</span>
                <span className={`text-lg transition-transform duration-200 flex-shrink-0 ${openIndex === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openIndex === i && (
                <div className="px-4 md:px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Criar `components/cta-section.tsx`**

```typescript
import { Button } from '@/components/ui/button';
import { formatWhatsAppLink } from '@/lib/formatters';
import { WHATSAPP_NUMBER } from '@/lib/constants';

export function CTASection() {
  const msg = 'Olá, Juliana! Quero começar meu pedido.';
  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-brand-700 to-brand-800 text-white">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="font-heading text-2xl md:text-3xl font-bold">
          Pronta para resolver sua semana?
        </h2>
        <p className="text-brand-200 text-base max-w-md mx-auto">
          Fale com a Juliana agora mesmo pelo WhatsApp e garanta suas refeições da semana.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="bg-white text-brand-800 hover:bg-warm-100 text-base w-full sm:w-auto" asChild>
            <a href="#cardapio">Ver cardápio da semana</a>
          </Button>
          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white text-base w-full sm:w-auto" asChild>
            <a href={formatWhatsAppLink(WHATSAPP_NUMBER, msg)} target="_blank" rel="noopener noreferrer">
              🟢 Pedir pelo WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 10: Criar `components/footer.tsx` e `floating-whatsapp.tsx`**

`footer.tsx`:
```typescript
import { formatWhatsAppLink } from '@/lib/formatters';
import { WHATSAPP_NUMBER } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-brand-900 text-brand-300">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h4 className="font-heading text-white text-lg font-bold mb-3">Juliana Gaspar</h4>
          <p className="text-sm leading-relaxed">Comida afetiva e saudável em Teresina, PI.</p>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Contato</h5>
          <ul className="space-y-2 text-sm">
            <li><a href={formatWhatsAppLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a></li>
            <li><a href="https://instagram.com/julianagaspar" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Informações</h5>
          <ul className="space-y-2 text-sm">
            <li>Entrega: Teresina, PI</li>
            <li>Seg-Sex: 08h às 18h</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Legal</h5>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-white transition-colors cursor-pointer">Política de Privacidade</span></li>
            <li><span className="hover:text-white transition-colors cursor-pointer">Termos de Serviço</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-brand-800 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} Juliana Gaspar. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
```

`floating-whatsapp.tsx`:
```typescript
import { formatWhatsAppLink } from '@/lib/formatters';
import { WHATSAPP_NUMBER } from '@/lib/constants';

export function FloatingWhatsApp() {
  return (
    <a
      href={formatWhatsAppLink(WHATSAPP_NUMBER, 'Olá, Juliana!')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 active:bg-green-700 transition-all hover:scale-110 active:scale-95"
      aria-label="Falar no WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}
```

- [ ] **Step 11: Criar `services/landing.service.ts`**

```typescript
import { apiClient } from '@/lib/api-client';
import type { DishCard } from '../types';

export const landingService = {
  getDishes: () => apiClient.get<DishCard[]>('/dishes?limit=100'),
};
```

- [ ] **Step 12: Criar `index.ts` (barrel)**

```typescript
export { Hero } from './components/hero';
export { ComoFunciona } from './components/como-funciona';
export { CardapioSemanal } from './components/cardapio-semanal';
export { Diferenciais } from './components/diferenciais';
export { Depoimentos } from './components/depoimentos';
export { FAQ } from './components/faq';
export { CTASection } from './components/cta-section';
export { Footer } from './components/footer';
export { FloatingWhatsApp } from './components/floating-whatsapp';
export type { DishCard, Testimonial, FAQItem } from './types';
```

- [ ] **Step 13: Criar a página `app/(landing)/page.tsx`**

```typescript
import { Hero, ComoFunciona, CardapioSemanal, Diferenciais, Depoimentos, FAQ, CTASection, Footer, FloatingWhatsApp } from '@/features/landing';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ComoFunciona />
      <CardapioSemanal />
      <Diferenciais />
      <CTASection />
      <Depoimentos />
      <FAQ />
      <CTASection />
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
```

- [ ] **Step 14: Commit**

```bash
git add apps/web/src/features/landing/ apps/web/src/app/(landing)/page.tsx
git commit -m "feat: add complete landing page with all sections

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## MILESTONE 6: Painel Admin

### Task 6.1: Admin Layout com navegação adaptativa

**Files:**
- Create: `apps/web/src/app/(admin)/layout.tsx`
- Create: `apps/web/src/features/admin/layout/admin-layout.tsx`
- Create: `apps/web/src/features/admin/layout/admin-sidebar.tsx`
- Create: `apps/web/src/features/admin/layout/admin-header.tsx`
- Create: `apps/web/src/features/admin/layout/index.ts`

- [ ] **Step 1: Criar `admin-layout.tsx`**

```typescript
'use client';
import { useState } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

const navItems = [
  { label: 'Painel', href: '/painel', icon: '📊' },
  { label: 'Catálogo', href: '/catalogo', icon: '🍽️' },
  { label: 'Pedidos', href: '/pedidos', icon: '📦' },
  { label: 'Clientes', href: '/clientes', icon: '👥' },
  { label: 'Ciclos', href: '/ciclos', icon: '📅' },
  { label: 'Pagamentos', href: '/pagamentos', icon: '💰' },
  { label: 'Entregas', href: '/entregas', icon: '🚚' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const isTablet = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onMenuToggle={() => setDrawerOpen(true)} />

      {/* Mobile drawer */}
      {!isDesktop && drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <nav className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 flex flex-col overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-heading font-bold text-brand-700">Juliana Gaspar</span>
              <button onClick={() => setDrawerOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted" aria-label="Fechar menu">✕</button>
            </div>
            <div className="p-2 space-y-1">
              {navItems.map((item) => (
                <a key={item.href} href={item.href}
                  className="flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-medium hover:bg-brand-50 text-foreground transition-colors"
                  onClick={() => setDrawerOpen(false)}>
                  <span>{item.icon}</span> {item.label}
                </a>
              ))}
              <hr className="my-2" />
              <a href="/auth/login"
                className="flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => { localStorage.removeItem('token'); setDrawerOpen(false); }}>
                🚪 Sair
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* Tablet sidebar (collapsible) */}
      {isTablet && !isDesktop && (
        <aside
          className={`fixed left-0 top-14 bottom-0 z-40 bg-white border-r transition-all duration-200 ${sidebarExpanded ? 'w-60' : 'w-16'}`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <nav className="p-2 space-y-1">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}
                className="flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-medium hover:bg-brand-50 text-foreground transition-colors overflow-hidden whitespace-nowrap">
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={sidebarExpanded ? 'opacity-100' : 'opacity-0'}>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>
      )}

      {/* Desktop sidebar */}
      {isDesktop && (
        <AdminSidebar items={navItems} />
      )}

      {/* Main content */}
      <main className={`transition-all ${isDesktop ? 'ml-60' : isTablet ? 'ml-16' : ''} pt-14`}>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Criar `admin-header.tsx`**

```typescript
'use client';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

type Props = { onMenuToggle: () => void };

export function AdminHeader({ onMenuToggle }: Props) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center px-4 gap-4 z-30">
      {!isDesktop && (
        <button onClick={onMenuToggle} className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted" aria-label="Abrir menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      )}
      <span className="font-heading font-bold text-brand-700 text-lg">JG</span>
      <span className="text-sm text-muted-foreground hidden sm:block">Painel Administrativo</span>
    </header>
  );
}
```

- [ ] **Step 3: Criar `admin-sidebar.tsx`**

```typescript
type Props = { items: { label: string; href: string; icon: string }[] };

export function AdminSidebar({ items }: Props) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r z-40">
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-heading font-bold text-brand-700 text-lg">Juliana Gaspar</span>
      </div>
      <nav className="p-2 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <a key={item.href} href={item.href}
            className="flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-medium hover:bg-brand-50 text-foreground transition-colors">
            <span>{item.icon}</span> {item.label}
          </a>
        ))}
        <hr className="my-2" />
        <a href="/auth/login"
          className="flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          onClick={() => localStorage.removeItem('token')}>
          🚪 Sair
        </a>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: Criar `app/(admin)/layout.tsx`**

```typescript
'use client';
import { AdminLayout } from '@/features/admin/layout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/admin/layout/ apps/web/src/app/\(admin\)/layout.tsx
git commit -m "feat: add admin layout with responsive navigation (drawer/sidebar)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6.2: Tela de Login + Auth Feature

**Files:**
- Create: `apps/web/src/features/auth/index.ts`
- Create: `apps/web/src/features/auth/types/index.ts`
- Create: `apps/web/src/features/auth/services/auth.service.ts`
- Create: `apps/web/src/features/auth/hooks/use-auth.ts`
- Create: `apps/web/src/app/auth/login/page.tsx`
- Create: `apps/web/src/features/auth/components/login-form.tsx`

- [ ] **Step 1: Criar `auth.service.ts`**

```typescript
import { apiClient } from '@/lib/api-client';
import type { LoginDTO, AuthResponse } from '@juliana-gaspar/contracts';

export const authService = {
  login: async (dto: LoginDTO): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', dto);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
};
```

- [ ] **Step 2: Criar `login-form.tsx` e `app/auth/login/page.tsx`**

`login-form.tsx`:
```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '../services/auth.service';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login({ email, password });
      router.push('/painel');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-2xl font-bold text-brand-800">Entrar</h1>
          <p className="text-sm text-muted-foreground">Painel Administrativo Juliana Gaspar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="admin@julianagaspar.com.br" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive bg-red-50 p-3 rounded-xl">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

`app/auth/login/page.tsx`:
```typescript
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/auth/ apps/web/src/app/auth/
git commit -m "feat: add auth feature with login form and JWT token storage

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6.3: Admin Dashboard

**Files:**
- Create: `apps/web/src/features/admin/painel/index.ts`
- Create: `apps/web/src/features/admin/painel/types/index.ts`
- Create: `apps/web/src/features/admin/painel/services/painel.service.ts`
- Create: `apps/web/src/features/admin/painel/hooks/use-painel.ts`
- Create: `apps/web/src/features/admin/painel/components/kpi-cards.tsx`
- Create: `apps/web/src/features/admin/painel/components/pedidos-recentes.tsx`
- Create: `apps/web/src/app/(admin)/painel/page.tsx`

- [ ] **Step 1: Criar `components/kpi-cards.tsx`**

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

type KPICardsProps = { data: { revenue: number; orderCount: number; pendingOrders: number; pendingPayments: number } | null };

export function KPICards({ data }: KPICardsProps) {
  if (!data) return null;
  const items = [
    { label: 'Faturamento', value: formatCurrency(data.revenue), icon: '💰', color: 'bg-green-50 text-green-700' },
    { label: 'Pedidos ativos', value: String(data.orderCount), icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Pendentes', value: String(data.pendingOrders), icon: '⏳', color: 'bg-amber-50 text-amber-700' },
    { label: 'Pgto pendente', value: String(data.pendingPayments), icon: '💳', color: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4 space-y-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.color}`}>{item.icon}</div>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Criar `components/pedidos-recentes.tsx`**

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

type RecentOrder = { id: string; customerName: string; status: string; totalAmount: number; createdAt: string };

type Props = { orders: RecentOrder[]; isLoading: boolean };

const variantByStatus: Record<string, 'default' | 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning', CONFIRMED: 'default', IN_PRODUCTION: 'default', OUT_FOR_DELIVERY: 'warning', DELIVERED: 'success', CANCELLED: 'destructive',
};

export function PedidosRecentes({ orders, isLoading }: Props) {
  const isTablet = useMediaQuery('(min-width: 768px)');

  if (isLoading) {
    return <Card className="mt-6"><CardContent className="p-4"><div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}</div></CardContent></Card>;
  }

  if (orders.length === 0) {
    return <Card className="mt-6"><CardContent className="p-4 py-12"><p className="text-center text-muted-foreground">Nenhum pedido recente</p></CardContent></Card>;
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <h3 className="font-semibold text-brand-800 mb-4">Pedidos Recentes</h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 py-2 border-b border-muted last:border-0">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{o.customerName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
              </div>
              <Badge variant={variantByStatus[o.status] ?? 'default'} className="text-2xs">{ORDER_STATUS_LABELS[o.status] ?? o.status}</Badge>
              <span className="font-semibold text-sm flex-shrink-0">{formatCurrency(o.totalAmount)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Criar `app/(admin)/painel/page.tsx`**

```typescript
'use client';
import { useEffect, useState } from 'react';
import { KPICards } from '@/features/admin/painel/components/kpi-cards';
import { PedidosRecentes } from '@/features/admin/painel/components/pedidos-recentes';
import { painelService } from '@/features/admin/painel/services/painel.service';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    painelService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800 mb-6">Painel</h1>
      <KPICards data={data} />
      <PedidosRecentes orders={data?.recentOrders ?? []} isLoading={loading} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/admin/painel/ apps/web/src/app/\(admin\)/painel/
git commit -m "feat: add admin dashboard with KPI cards and recent orders

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6.4: Admin Catálogo — CRUD de Pratos

**Files:**
- Create: `apps/web/src/features/admin/catalogo/index.ts`
- Create: `apps/web/src/features/admin/catalogo/types/index.ts`
- Create: `apps/web/src/features/admin/catalogo/services/catalogo.service.ts`
- Create: `apps/web/src/features/admin/catalogo/hooks/use-catalogo.ts`
- Create: `apps/web/src/features/admin/catalogo/components/pratos-lista.tsx`
- Create: `apps/web/src/features/admin/catalogo/components/prato-card.tsx`
- Create: `apps/web/src/features/admin/catalogo/components/pratos-tabela.tsx`
- Create: `apps/web/src/features/admin/catalogo/components/prato-form.tsx`
- Create: `apps/web/src/app/(admin)/catalogo/page.tsx`
- Create: `apps/web/src/app/(admin)/catalogo/novo/page.tsx`
- Create: `apps/web/src/app/(admin)/catalogo/[dishId]/page.tsx`

- [ ] **Step 1: Criar `services/catalogo.service.ts`**

```typescript
import { apiClient } from '@/lib/api-client';
import type { CreateDishDTO, UpdateDishDTO, PaginatedResponse } from '@juliana-gaspar/contracts';
import type { PratoListItem } from '../types';

export const catalogoService = {
  list: (page = 1, search?: string) => apiClient.get<PaginatedResponse<PratoListItem>>('/dishes', { params: { page, limit: 20, search } }),
  getById: (id: string) => apiClient.get<PratoListItem>(`/dishes/${id}`),
  create: (dto: CreateDishDTO) => apiClient.post<PratoListItem>('/dishes', dto),
  update: (id: string, dto: UpdateDishDTO) => apiClient.put<PratoListItem>(`/dishes/${id}`, dto),
  remove: (id: string) => apiClient.delete(`/dishes/${id}`),
  duplicate: (id: string) => apiClient.post<PratoListItem>(`/dishes/${id}/duplicate`),
};
```

- [ ] **Step 2: Criar `components/prato-card.tsx` (mobile card)**

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import type { PratoListItem } from '../types';

type Props = { prato: PratoListItem; onPress: (id: string) => void };

export function PratoCard({ prato, onPress }: Props) {
  return (
    <Card className="cursor-pointer active:bg-muted/50 min-h-[88px] transition-colors" onClick={() => onPress(prato.id)} role="button" tabIndex={0} aria-label={prato.name}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-warm-200 flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{prato.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{prato.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={prato.available ? 'success' : 'destructive'} className="text-2xs">
            {prato.available ? 'Disponível' : 'Indisponível'}
          </Badge>
          <span className="font-bold text-brand-700">{formatCurrency(prato.price)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Criar páginas**

`app/(admin)/catalogo/page.tsx`:
```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PratosLista } from '@/features/admin/catalogo/components/pratos-lista';

export default function CatalogoPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-800">Catálogo</h1>
        <Button onClick={() => router.push('/catalogo/novo')}>+ Novo prato</Button>
      </div>
      <div className="mb-4">
        <Input placeholder="Buscar pratos..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <PratosLista search={search} onSelect={(id) => router.push(`/catalogo/${id}`)} />
    </div>
  );
}
```

`app/(admin)/catalogo/novo/page.tsx`:
```typescript
'use client';
import { PratoForm } from '@/features/admin/catalogo/components/prato-form';

export default function NovoPratoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800 mb-6">Novo Prato</h1>
      <PratoForm />
    </div>
  );
}
```

`app/(admin)/catalogo/[dishId]/page.tsx`:
```typescript
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PratoForm } from '@/features/admin/catalogo/components/prato-form';
import { catalogoService } from '@/features/admin/catalogo/services/catalogo.service';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditarPratoPage() {
  const { dishId } = useParams<{ dishId: string }>();
  const [prato, setPrato] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogoService.getById(dishId).then(setPrato).finally(() => setLoading(false));
  }, [dishId]);

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800 mb-6">Editar Prato</h1>
      <PratoForm initialData={prato} dishId={dishId} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/admin/catalogo/ apps/web/src/app/\(admin\)/catalogo/
git commit -m "feat: add admin catalog with dish CRUD, card/table listing, create and edit pages

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6.5: Admin Pedidos — Listagem e detalhes

**Files:**
- Create: `apps/web/src/features/admin/pedidos/index.ts`
- Create: `apps/web/src/features/admin/pedidos/types/index.ts`
- Create: `apps/web/src/features/admin/pedidos/services/pedidos.service.ts`
- Create: `apps/web/src/features/admin/pedidos/hooks/use-pedidos.ts`
- Create: `apps/web/src/features/admin/pedidos/components/pedidos-lista.tsx`
- Create: `apps/web/src/features/admin/pedidos/components/pedido-card.tsx`
- Create: `apps/web/src/features/admin/pedidos/components/pedidos-tabela.tsx`
- Create: `apps/web/src/features/admin/pedidos/components/pedido-detalhes-sheet.tsx`
- Create: `apps/web/src/features/admin/pedidos/components/pedido-status-badge.tsx`
- Create: `apps/web/src/features/admin/pedidos/components/filtros-pedidos.tsx`
- Create: `apps/web/src/app/(admin)/pedidos/page.tsx`
- Create: `apps/web/src/app/(admin)/pedidos/[orderId]/page.tsx`

- [ ] **Step 1: Criar `types/index.ts`**

```typescript
import type { OrderStatus, PaymentStatus, PlanType } from '@juliana-gaspar/contracts';

export type PedidoFilter = {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus;
  planType?: PlanType;
  search?: string;
};

export type PedidoListItem = {
  id: string;
  customerName: string;
  customerPhone: string;
  planType: PlanType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  deliveryDate: string | null;
  createdAt: string;
};
```

- [ ] **Step 2: Criar `components/pedido-status-badge.tsx`**

```typescript
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

const variantByStatus: Record<string, 'default' | 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning', CONFIRMED: 'default', IN_PRODUCTION: 'default',
  OUT_FOR_DELIVERY: 'warning', DELIVERED: 'success', CANCELLED: 'destructive',
};

export function PedidoStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variantByStatus[status] ?? 'default'} className="text-2xs whitespace-nowrap">
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
```

- [ ] **Step 3: Criar páginas `app/(admin)/pedidos/`**

`pedidos/page.tsx`:
```typescript
'use client';
import { useState } from 'react';
import { PedidosLista } from '@/features/admin/pedidos/components/pedidos-lista';
import { FiltrosPedidos } from '@/features/admin/pedidos/components/filtros-pedidos';
import { PedidoDetalhesSheet } from '@/features/admin/pedidos/components/pedido-detalhes-sheet';
import type { PedidoFilter } from '@/features/admin/pedidos/types';

export default function PedidosPage() {
  const [filters, setFilters] = useState<PedidoFilter>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <h1 className="text-2xl font-bold text-brand-800 mb-4">Pedidos</h1>
      <FiltrosPedidos filters={filters} onChange={setFilters} />
      <div className="flex-1 overflow-y-auto">
        <PedidosLista filters={filters} onSelectPedido={setSelectedId} />
      </div>
      <PedidoDetalhesSheet pedidoId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
```

`pedidos/[orderId]/page.tsx`:
```typescript
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PedidoStatusBadge } from '@/features/admin/pedidos/components/pedido-status-badge';
import { Badge } from '@/components/ui/badge';
import { pedidosService } from '@/features/admin/pedidos/services/pedidos.service';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PLAN_TYPE_LABELS } from '@/lib/constants';
import type { OrderDTO } from '@juliana-gaspar/contracts';

export default function PedidoDetalhePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [pedido, setPedido] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { pedidosService.getById(orderId).then(setPedido).finally(() => setLoading(false)); }, [orderId]);

  const handleStatus = async (status: string) => {
    setUpdating(true);
    await pedidosService.updateStatus(orderId, status);
    setPedido((p) => p ? { ...p, status: status as any } : p);
    setUpdating(false);
  };

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!pedido) return <p>Pedido não encontrado.</p>;

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Voltar</Button>
      <h1 className="text-2xl font-bold text-brand-800 mb-6">Pedido de {pedido.customerName}</h1>

      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Status</span><PedidoStatusBadge status={pedido.status} /></div>
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Pagamento</span><Badge>{PAYMENT_STATUS_LABELS[pedido.paymentStatus]}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Plano</span><span className="text-sm">{PLAN_TYPE_LABELS[pedido.planType]}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Valor</span><span className="font-bold">{formatCurrency(pedido.totalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Entrega</span><span className="text-sm">{pedido.deliveryDate ? formatDate(pedido.deliveryDate) : '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Endereço</span><span className="text-sm">{pedido.deliveryAddress}</span></div>
          {pedido.notes && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Observações</span><span className="text-sm">{pedido.notes}</span></div>}
        </CardContent>
      </Card>

      <h2 className="font-semibold text-brand-800 mb-3">Itens do pedido</h2>
      <div className="space-y-2 mb-6">
        {pedido.items.map((item) => (
          <Card key={item.id}><CardContent className="p-4 flex justify-between items-center">
            <div><p className="font-medium text-sm">{item.dishName}</p><p className="text-xs text-muted-foreground">{item.quantity}× {formatCurrency(item.unitPrice)}</p></div>
            <span className="font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</span>
          </CardContent></Card>
        ))}
      </div>

      <h2 className="font-semibold text-brand-800 mb-3">Atualizar status</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <Button key={value} size="sm" variant={pedido.status === value ? 'default' : 'outline'} disabled={updating || pedido.status === value} onClick={() => handleStatus(value)} className="text-xs h-10">{label}</Button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/admin/pedidos/ apps/web/src/app/\(admin\)/pedidos/
git commit -m "feat: add admin orders with card/table listing, detail page, and status update

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6.6: Admin — Clientes, Pagamentos, Ciclos, Entregas (páginas básicas)

**Files:**
- Create: `apps/web/src/app/(admin)/clientes/page.tsx`
- Create: `apps/web/src/app/(admin)/pagamentos/page.tsx`
- Create: `apps/web/src/app/(admin)/ciclos/page.tsx`
- Create: `apps/web/src/app/(admin)/entregas/page.tsx`
- Create: `apps/web/src/features/admin/clientes/index.ts`
- Create: `apps/web/src/features/admin/pagamentos/index.ts`
- Create: `apps/web/src/features/admin/ciclos/index.ts`
- Create: `apps/web/src/features/admin/entregas/index.ts`

- [ ] **Step 1: Criar páginas básicas para cada módulo**

`app/(admin)/clientes/page.tsx`:
```typescript
'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPhone } from '@/lib/formatters';
import { apiClient } from '@/lib/api-client';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function ClientesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isTablet = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    apiClient.get<any>('/customers', { params: { limit: 100, search } }).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [search]);

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  if (!data.length) return <EmptyState title="Nenhum cliente" description="Nenhum cliente cadastrado ainda." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800 mb-4">Clientes</h1>
      <Input placeholder="Buscar clientes..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4" />
      <div className="space-y-3">
        {data.map((c: any) => (
          <Card key={c.id} className="cursor-pointer active:bg-muted/50 min-h-[88px]">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between"><h3 className="font-semibold text-sm">{c.name}</h3><Badge variant="default">{formatPhone(c.phone)}</Badge></div>
              {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
              {c.tags?.length > 0 && <div className="flex gap-1">{c.tags.map((t: string) => <Badge key={t} variant="default" className="text-2xs">{t}</Badge>)}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

`app/(admin)/pagamentos/page.tsx`:
```typescript
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { apiClient } from '@/lib/api-client';

export default function PagamentosPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any>('/payments', { params: { limit: 100 } }).then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const handleRegister = async (id: string) => {
    await apiClient.patch(`/payments/${id}/register`, { paymentId: id });
    apiClient.get<any>('/payments', { params: { limit: 100 } }).then(r => setData(r.data));
  };

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  if (!data.length) return <EmptyState title="Nenhum pagamento" description="Nenhum pagamento registrado ainda." />;

  const variantByStatus: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = { PAID: 'success', PENDING: 'warning', OVERDUE: 'destructive', REFUNDED: 'default' };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800 mb-4">Pagamentos</h1>
      <div className="space-y-3">
        {data.map((p: any) => (
          <Card key={p.id} className="min-h-[88px]">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{p.order?.customer?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{p.method} · {formatCurrency(p.amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={variantByStatus[p.status]}>{PAYMENT_STATUS_LABELS[p.status]}</Badge>
                  {p.status === 'PENDING' && <Button size="sm" onClick={() => handleRegister(p.id)}>Registrar pagamento</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

`app/(admin)/ciclos/page.tsx` (placeholder — CRUD básico via API):
```typescript
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { apiClient } from '@/lib/api-client';

export default function CiclosPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any>('/cycles', { params: { limit: 50 } }).then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!data.length) return <EmptyState title="Nenhum ciclo" description="Crie o primeiro ciclo semanal." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800 mb-4">Ciclos Semanais</h1>
      <div className="space-y-3">
        {data.map((c: any) => (
          <Card key={c.id}><CardContent className="p-4 space-y-2">
            <div className="flex justify-between"><h3 className="font-semibold text-sm">{formatDate(c.openDate)} — {formatDate(c.closeDate)}</h3><Badge>{c.status}</Badge></div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Entrega: {formatDate(c.deliveryDate)}</span>
              <span>{c.orderCount ?? 0} pedidos · {formatCurrency(c.revenue ?? 0)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{c.cycleDishes?.length ?? 0} pratos no cardápio</p>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
```

`app/(admin)/entregas/page.tsx`:
```typescript
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/formatters';
import { apiClient } from '@/lib/api-client';

export default function EntregasPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any[]>('/delivery/zones').then(setZones).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!zones.length) return <EmptyState title="Nenhuma zona de entrega" description="Cadastre as zonas de entrega." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800 mb-4">Entregas</h1>
      <h2 className="font-semibold text-brand-700 mb-3">Zonas de entrega</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {zones.map((z: any) => (
          <Card key={z.id}><CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-sm">{z.name}</h3>
            {z.description && <p className="text-xs text-muted-foreground">{z.description}</p>}
            <Badge variant={z.fee === 0 ? 'success' : 'default'}>{z.fee === 0 ? 'Grátis' : `Taxa: ${formatCurrency(z.fee)}`}</Badge>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/\(admin\)/clientes/ apps/web/src/app/\(admin\)/pagamentos/ apps/web/src/app/\(admin\)/ciclos/ apps/web/src/app/\(admin\)/entregas/
git add apps/web/src/features/admin/clientes/ apps/web/src/features/admin/pagamentos/ apps/web/src/features/admin/ciclos/ apps/web/src/features/admin/entregas/
git commit -m "feat: add clientes, pagamentos, ciclos, and entregas admin pages

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## MILESTONE 7: Integração e Finalização

### Task 7.1: Scripts de setup e reset do banco

**Files:**
- Create: `scripts/setup.sh`
- Create: `scripts/db-reset.sh`

- [ ] **Step 1: Criar `scripts/setup.sh`**

```bash
#!/bin/bash
set -e

echo "🛠️  Juliana Gaspar — Setup"
echo "=========================="

# Verificar requisitos
command -v node >/dev/null 2>&1 || { echo "❌ Node.js não encontrado. Instale Node 20+."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm não encontrado. Instale com: npm i -g pnpm@9"; exit 1; }

# Copiar .env se não existir
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env criado a partir de .env.example"
fi

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# Iniciar banco
echo "🐘 Iniciando PostgreSQL..."
pnpm docker:up

# Aguardar banco
echo "⏳ Aguardando banco de dados..."
sleep 3

# Migrations
echo "🔄 Rodando migrations..."
cd packages/database
npx prisma migrate dev --name init
cd ../..

# Seed
echo "🌱 Rodando seed..."
cd packages/database
npx tsx prisma/seed.ts
cd ../..

echo ""
echo "✅ Setup concluído!"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:3001"
echo "   Admin:    http://localhost:3000/auth/login"
echo "   Email:    admin@julianagaspar.com.br"
echo "   Senha:    admin123"
```

- [ ] **Step 2: Criar `scripts/db-reset.sh`**

```bash
#!/bin/bash
set -e

echo "🗑️  Resetando banco de dados..."
cd packages/database
npx prisma migrate reset --force
npx tsx prisma/seed.ts
cd ../..
echo "✅ Banco resetado e populado."
```

- [ ] **Step 3: Commit**

```bash
chmod +x scripts/setup.sh scripts/db-reset.sh
git add scripts/
git commit -m "feat: add setup and db-reset scripts

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7.2: Verificação final — instalar, rodar, validar

- [ ] **Step 1: Instalar dependências**

```bash
cd "/home/wesley/Projetos/Juliana Gaspar"
pnpm install
```

Expected: Instala sem erros. Todos workspace packages resolvem corretamente.

- [ ] **Step 2: Rodar typecheck em todos os pacotes**

```bash
pnpm typecheck 2>&1 || true
```

Expected: Zero erros de tipo (ou erros fáceis de corrigir com ajustes pontuais).

- [ ] **Step 3: Subir banco de dados**

```bash
pnpm docker:up
```

Expected: PostgreSQL rodando na porta 5432.

- [ ] **Step 4: Rodar migrations e seed**

```bash
cd packages/database
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
cd ../..
```

Expected: Migration aplicada. Admin criado (admin@julianagaspar.com.br / admin123).

- [ ] **Step 5: Iniciar API e testar endpoint de saúde**

```bash
cd apps/api && pnpm dev &
sleep 5
curl http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@julianagaspar.com.br","password":"admin123"}'
```

Expected: Token JWT retornado no response.

- [ ] **Step 6: Iniciar frontend**

```bash
cd apps/web && pnpm dev
```

Expected: Next.js roda em http://localhost:3000. Landing page visível. Login em /auth/login funcional.

- [ ] **Step 7: Commit final**

```bash
git add -A
git commit -m "chore: final integration fixes and verification

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Resumo de Arquivos Criados (Phase 1)

| Milestone | Arquivos | Descrição |
|-----------|----------|-----------|
| 1. Foundation | 30+ | Monorepo root, packages (config, contracts, database), Docker |
| 2. Backend Foundation | 20+ | NestJS scaffold, auth module, guards, decorators, pipes |
| 3. Backend Modules | 20+ | Catalog, Orders, Customers, Cycles, Payments, Delivery |
| 4. Frontend Foundation | 25+ | Next.js scaffold, Tailwind, shadcn/ui, lib, server |
| 5. Landing Page | 15+ | Hero, ComoFunciona, Cardapio, Diferenciais, Depoimentos, FAQ, CTA, Footer, WhatsApp |
| 6. Admin Panel | 30+ | Layout, Dashboard, Catálogo CRUD, Pedidos, Clientes, Pagamentos, Ciclos, Entregas |
| 7. Finalização | 5+ | Scripts, verificações |

**Total estimado:** ~150 arquivos criados, cobrindo toda a Phase 1.

---

**Fim do plano de implementação.**
