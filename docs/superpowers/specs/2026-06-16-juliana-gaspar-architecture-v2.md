# Juliana Gaspar — Especificação de Arquitetura v2

**Versão:** 2.0 — Production-Ready
**Data:** 2026-06-16
**Stack:** Next.js 15 + NestJS 11 + Prisma + PostgreSQL + Turborepo + pnpm
**Direção Visual:** Oliva & Botânico (verdes naturais + fundo creme)
**Paradigma:** Mobile-first obrigatório (baseline 320px)
**Público-alvo primário:** Mulheres acessando via smartphone (WhatsApp → landing page)
**Idioma da interface:** Português (Brasil)
**Idioma do código:** Português para domínio de negócio, Inglês para infraestrutura técnica

---

## Convenção de Nomenclatura

### Regra geral
| Camada | Idioma | Exemplo |
|--------|--------|---------|
| Rotas de negócio (URLs) | Português | `/pedidos`, `/clientes`, `/catalogo` |
| Features (pastas, arquivos) | Português | `features/admin/pedidos/`, `pedido-card.tsx` |
| Schemas de domínio | Português | `pedido.schema.ts`, `prato.schema.ts` |
| Tipos de domínio | Português | `PedidoStatus`, `ClienteListItem` |
| Packages técnicos | Inglês | `packages/contracts/`, `packages/database/` |
| Contracts (schemas Zod + DTOs) | Inglês nas chaves técnicas, Português nas mensagens de erro | `orderStatusSchema`, mensagem: `"Status inválido"` |
| NestJS módulos (pastas) | Inglês | `modules/orders/`, `modules/catalog/` |
| NestJS services, controllers | Inglês | `orders.service.ts`, `CatalogController` |
| Componentes genéricos `ui/` | Inglês | `data-table.tsx`, `empty-state.tsx` |
| `lib/`, `server/`, hooks genéricos | Inglês | `use-media-query.ts`, `api-client.ts` |
| Mensagens de erro de API | Português | `"Cliente não encontrado"` |

### Por que NestJS em inglês?
Os módulos NestJS alinham-se com `packages/contracts` e `packages/database`, que são pacotes técnicos. Manter controllers/services em inglês elimina atrito com decorators, guards, e convenções do framework. As mensagens de erro voltam ao usuário em português.

### Por que rotas e features em português?
O usuário final (admin e cliente) vê português na URL, nos labels, nos breadcrumbs. As URLs devem ser legíveis e significativas: `/pedidos/123` é melhor que `/orders/123` para o público brasileiro.

---

## Seção 1 — Árvore Completa do Monorepo

```
juliana-gaspar/
├── apps/
│   ├── web/                          # Next.js 15 App Router
│   │   ├── app/                      # Rotas, layouts, loading, error boundaries
│   │   ├── features/                 # Lógica de negócio por domínio
│   │   ├── components/ui/           # shadcn/ui + componentes visuais genéricos
│   │   ├── lib/                      # Utilitários transversais cliente
│   │   ├── server/                   # Código server-only
│   │   ├── styles/globals.css        # Tailwind + design tokens
│   │   ├── public/                   # Assets estáticos
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # NestJS 11
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/               # Guards, filters, interceptors, pipes
│       │   ├── modules/              # Um módulo por domínio
│       │   └── integrations/         # Interfaces abstratas de serviços externos
│       ├── test/
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── contracts/                    # Zod schemas + TypeScript DTOs compartilhados
│   ├── database/                     # Prisma schema + migrations + seed
│   └── config/                       # ESLint, TSConfig, Prettier compartilhados
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
│   │   ├── page.tsx                  # → features/landing/components/*
│   │   ├── layout.tsx                # Header + Footer públicos, meta tags, schema LD+JSON
│   │   ├── loading.tsx               # Skeleton full-page
│   │   ├── error.tsx                 # Erro com CTA "Tentar novamente"
│   │   └── not-found.tsx
│   │
│   ├── (cliente)/                    # Área do cliente autenticada
│   │   ├── layout.tsx                # Header simplificado + proteção auth
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── meus-pedidos/
│   │   │   ├── page.tsx              # → features/cliente/pedidos
│   │   │   └── [orderId]/
│   │   │       └── page.tsx
│   │   ├── minhas-assinaturas/
│   │   │   └── page.tsx              # → features/cliente/assinaturas
│   │   ├── perfil/
│   │   │   └── page.tsx              # → features/cliente/perfil
│   │   └── pagamento/
│   │       └── page.tsx
│   │
│   ├── (admin)/
│   │   ├── layout.tsx                # Auth gate + sidebar/drawer + header
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── painel/
│   │   │   └── page.tsx              # → features/admin/dashboard
│   │   ├── catalogo/
│   │   │   ├── page.tsx              # Lista de pratos
│   │   │   ├── novo/
│   │   │   │   └── page.tsx          # Criar prato
│   │   │   └── [dishId]/
│   │   │       └── page.tsx          # Editar prato
│   │   ├── pedidos/
│   │   │   ├── page.tsx
│   │   │   └── [orderId]/
│   │   │       └── page.tsx
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
│   │
│   └── auth/
│       ├── login/
│       │   └── page.tsx              # Login (admin + cliente)
│       ├── cadastro/
│       │   └── page.tsx              # Cadastro público (cliente)
│       └── recuperar-senha/
│           └── page.tsx
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
│   │   │   ├── footer.tsx
│   │   │   └── floating-whatsapp.tsx
│   │   ├── hooks/
│   │   │   └── use-intersection-observer.ts
│   │   ├── services/
│   │   │   └── landing.service.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── cadastro-form.tsx
│   │   │   ├── recuperar-senha-form.tsx
│   │   │   └── auth-guard.tsx
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   ├── schemas/
│   │   │   ├── login.schema.ts
│   │   │   └── cadastro.schema.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── admin/
│   │   ├── painel/
│   │   │   ├── components/ (kpi-cards, receita-chart, pedidos-recentes)
│   │   │   ├── hooks/use-painel.ts
│   │   │   ├── services/painel.service.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── catalogo/
│   │   │   ├── components/
│   │   │   │   ├── pratos-lista.tsx
│   │   │   │   ├── prato-card.tsx
│   │   │   │   ├── pratos-tabela.tsx
│   │   │   │   ├── prato-form.tsx
│   │   │   │   ├── prato-form-passo-1-basico.tsx
│   │   │   │   ├── prato-form-passo-2-ingredientes.tsx
│   │   │   │   ├── prato-form-passo-3-foto.tsx
│   │   │   │   ├── prato-image-upload.tsx
│   │   │   │   └── filtros-catalogo.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-catalogo.ts
│   │   │   │   └── use-prato-form.ts
│   │   │   ├── schemas/prato-form.schema.ts
│   │   │   ├── services/catalogo.service.ts
│   │   │   ├── actions/catalogo.actions.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── pedidos/
│   │   │   ├── components/
│   │   │   │   ├── pedidos-lista.tsx
│   │   │   │   ├── pedidos-tabela.tsx
│   │   │   │   ├── pedido-card.tsx
│   │   │   │   ├── pedido-detalhes-sheet.tsx
│   │   │   │   ├── pedido-status-badge.tsx
│   │   │   │   ├── pedido-status-select.tsx
│   │   │   │   ├── filtros-pedidos.tsx
│   │   │   │   └── pedido-empty-state.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-pedidos.ts
│   │   │   │   └── use-pedido-filtros.ts
│   │   │   ├── schemas/pedido.schema.ts
│   │   │   ├── services/pedidos.service.ts
│   │   │   ├── actions/pedidos.actions.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── clientes/
│   │   │   ├── components/
│   │   │   │   ├── clientes-lista.tsx
│   │   │   │   ├── cliente-card.tsx
│   │   │   │   ├── clientes-tabela.tsx
│   │   │   │   ├── cliente-detalhes-sheet.tsx
│   │   │   │   ├── cliente-form.tsx
│   │   │   │   └── cliente-historico-pedidos.tsx
│   │   │   ├── hooks/use-clientes.ts
│   │   │   ├── schemas/cliente.schema.ts
│   │   │   ├── services/clientes.service.ts
│   │   │   ├── actions/clientes.actions.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── pagamentos/
│   │   │   ├── components/
│   │   │   │   ├── pagamentos-lista.tsx
│   │   │   │   ├── pagamento-card.tsx
│   │   │   │   ├── pagamentos-tabela.tsx
│   │   │   │   ├── pagamento-registro-form.tsx
│   │   │   │   ├── reconciliacao-view.tsx
│   │   │   │   └── pagamento-empty-state.tsx
│   │   │   ├── hooks/use-pagamentos.ts
│   │   │   ├── schemas/pagamento.schema.ts
│   │   │   ├── services/pagamentos.service.ts
│   │   │   ├── actions/pagamentos.actions.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── ciclos/
│   │   │   ├── components/
│   │   │   │   ├── ciclos-lista.tsx
│   │   │   │   ├── ciclo-card.tsx
│   │   │   │   ├── ciclo-form.tsx
│   │   │   │   ├── ciclo-dashboard.tsx
│   │   │   │   └── ciclo-pratos-select.tsx
│   │   │   ├── hooks/use-ciclos.ts
│   │   │   ├── schemas/ciclo.schema.ts
│   │   │   ├── services/ciclos.service.ts
│   │   │   ├── actions/ciclos.actions.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── entregas/
│   │   │   ├── components/
│   │   │   │   ├── entregas-lista.tsx
│   │   │   │   ├── entrega-card.tsx
│   │   │   │   ├── entregas-tabela.tsx
│   │   │   │   ├── zona-form.tsx
│   │   │   │   ├── rota-manifesto.tsx
│   │   │   │   └── entrega-empty-state.tsx
│   │   │   ├── hooks/use-entregas.ts
│   │   │   ├── schemas/entrega.schema.ts
│   │   │   ├── services/entregas.service.ts
│   │   │   ├── actions/entregas.actions.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── producao/
│   │   │   ├── components/
│   │   │   │   ├── producao-lista.tsx
│   │   │   │   ├── producao-card.tsx
│   │   │   │   ├── producao-mapa-montagem.tsx
│   │   │   │   ├── producao-consolidado.tsx
│   │   │   │   └── producao-etiquetas.tsx
│   │   │   ├── hooks/use-producao.ts
│   │   │   ├── services/producao.service.ts
│   │   │   ├── actions/producao.actions.ts
│   │   │   └── types/index.ts
│   │   │
│   │   ├── assinaturas/
│   │   │   ├── components/
│   │   │   │   ├── assinaturas-lista.tsx
│   │   │   │   ├── assinatura-card.tsx
│   │   │   │   ├── assinaturas-tabela.tsx
│   │   │   │   └── assinatura-acoes.tsx
│   │   │   ├── hooks/use-assinaturas.ts
│   │   │   ├── schemas/assinatura.schema.ts
│   │   │   ├── services/assinaturas.service.ts
│   │   │   ├── actions/assinaturas.actions.ts
│   │   │   └── types/index.ts
│   │   │
│   │   └── relatorios/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   │
│   └── cliente/
│       ├── pedidos/
│       │   ├── components/
│       │   │   ├── meus-pedidos-lista.tsx
│       │   │   ├── meu-pedido-card.tsx
│       │   │   ├── pedido-detalhe-sheet.tsx
│       │   │   └── pedido-status-timeline.tsx
│       │   ├── hooks/use-meus-pedidos.ts
│       │   ├── services/pedidos.service.ts
│       │   └── types/index.ts
│       │
│       ├── assinaturas/
│       │   ├── components/
│       │   │   ├── minhas-assinaturas-lista.tsx
│       │   │   ├── assinatura-card.tsx
│       │   │   ├── pausar-assinatura-dialog.tsx
│       │   │   └── cancelar-assinatura-dialog.tsx
│       │   ├── hooks/use-minhas-assinaturas.ts
│       │   ├── services/assinaturas.service.ts
│       │   └── types/index.ts
│       │
│       ├── perfil/
│       │   ├── components/
│       │   │   ├── perfil-form.tsx
│       │   │   └── endereco-form.tsx
│       │   ├── hooks/use-perfil.ts
│       │   ├── schemas/perfil.schema.ts
│       │   ├── services/perfil.service.ts
│       │   └── types/index.ts
│       │
│       └── pagamento/
│           ├── components/
│           ├── hooks/
│           ├── services/
│           └── types/
│
├── components/
│   └── ui/
│       ├── primitives/
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
│       │   ├── data-table.tsx           # Tabela genérica com fallback para cards
│       │   ├── pagination.tsx
│       │   └── empty-state.tsx
│       ├── form/
│       │   ├── form.tsx
│       │   ├── multi-step-form.tsx
│       │   └── image-upload.tsx
│       ├── feedback/
│       │   ├── toast.tsx
│       │   ├── sonner.tsx
│       │   └── confirm-dialog.tsx
│       └── brand/
│           └── whatsapp-button.tsx
│
├── lib/
│   ├── utils.ts                        # cn(), mergeRefs()
│   ├── api-client.ts                   # fetch wrapper com auth + tipagem
│   ├── auth-client.ts                  # NextAuth helpers (useSession wrapper)
│   ├── formatters.ts                   # formatCurrency, formatDate, formatPhone
│   ├── validators.ts                   # helpers genéricos Zod (cpf, phone br)
│   ├── constants.ts                    # App-wide constants
│   └── hooks/
│       ├── use-media-query.ts          # Hook: está em qual breakpoint?
│       ├── use-debounce.ts
│       └── use-intersection-observer.ts
│
├── server/
│   ├── auth.ts                         # NextAuth v5 config
│   ├── db.ts                           # Prisma client singleton (import 'server-only')
│   └── cloudinary.ts                   # Cloudinary server helpers
│
├── styles/
│   └── globals.css                     # Tailwind directives + design tokens CSS
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

---

## Seção 3 — Estrutura de Feature (Exemplo: `pedidos`)

### 3.1 — Regra geral

Toda feature em `features/admin/<dominio>/` e `features/cliente/<dominio>/` DEVE conter no mínimo:

```
features/<scope>/<dominio>/
├── components/        # Pelo menos 1 componente
├── types/
│   └── index.ts       # Tipos internos da feature
└── index.ts           # Barrel export público
```

PODE conter adicionalmente:
```
├── hooks/             # Hooks específicos do domínio
├── schemas/           # Schemas Zod de formulários
├── services/          # Chamadas à API do backend
└── actions/           # Server Actions (Next.js)
```

### 3.2 — `features/admin/pedidos/index.ts` (barrel)

```typescript
// Somente exports públicos. Nada de lógica aqui.
export { PedidosLista } from './components/pedidos-lista';
export { PedidosTabela } from './components/pedidos-tabela';
export { PedidoCard } from './components/pedido-card';
export { PedidoDetalhesSheet } from './components/pedido-detalhes-sheet';
export { PedidoStatusBadge } from './components/pedido-status-badge';
export { FiltrosPedidos } from './components/filtros-pedidos';
export { usePedidos } from './hooks/use-pedidos';
export { usePedidoFiltros } from './hooks/use-pedido-filtros';
export type { PedidoListItem, PedidoFilter } from './types';
```

### 3.3 — `features/admin/pedidos/types/index.ts`

```typescript
import type {
  OrderStatus,
  PaymentStatus,
  PlanType,
} from '@juliana-gaspar/contracts';

// Tipos INTERNOS do frontend admin. Estes NÃO vão para contracts
// porque representam o estado de UI, não o contrato de API.

export type PedidoFilter = {
  status?: OrderStatus[];
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
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  deliveryDate: string;
  createdAt: string;
};

// Re-export para conveniência do barrel
export type { OrderStatus, PaymentStatus, PlanType };
```

### 3.4 — `features/admin/pedidos/schemas/pedido.schema.ts`

```typescript
import { z } from 'zod';

// Schema para o formulário de atualização de status (ADMIN somente).
// Validado no CLIENTE antes de enviar à API.
// DIFERENTE do contract — a API valida com NestJS DTO (usando contracts).

export const pedidoStatusUpdateSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'IN_PRODUCTION',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ], { required_error: 'Selecione o novo status do pedido' }),
  notas: z
    .string()
    .max(500, 'Máximo de 500 caracteres')
    .optional(),
});

export type PedidoStatusUpdateForm = z.infer<typeof pedidoStatusUpdateSchema>;
```

### 3.5 — `features/admin/pedidos/services/pedidos.service.ts`

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

  updateStatus: async (id: string, status: string, notas?: string) => {
    return apiClient.patch<PedidoListItem>(`${BASE}/${id}/status`, {
      status,
      notas,
    });
  },
};
```

### 3.6 — `features/admin/pedidos/hooks/use-pedidos.ts`

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
  refetch: () => Promise<void>;
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
    } catch {
      setError('Erro ao carregar pedidos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

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

### 3.7 — `features/admin/pedidos/components/pedido-card.tsx`

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

const paymentLabel: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  OVERDUE: 'Vencido',
  REFUNDED: 'Reembolsado',
};

const paymentVariant: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
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
      aria-label={`Pedido de ${pedido.customerName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress(pedido.id);
        }
      }}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">{pedido.customerName}</h3>
          <PedidoStatusBadge status={pedido.status} />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {pedido.itemCount} {pedido.itemCount === 1 ? 'prato' : 'pratos'}
          </span>
          <Badge variant={paymentVariant[pedido.paymentStatus] ?? 'default'}>
            {paymentLabel[pedido.paymentStatus] ?? pedido.paymentStatus}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-sm">
            {formatCurrency(pedido.totalAmount)}
          </span>
          <span className="text-muted-foreground">{formatDate(pedido.deliveryDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.8 — `features/admin/pedidos/components/pedidos-lista.tsx`

```typescript
'use client';

import { usePedidos } from '../hooks/use-pedidos';
import { PedidoCard } from './pedido-card';
import { PedidosTabela } from './pedidos-tabela';
import { PedidoEmptyState } from './pedido-empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import type { PedidoFilter } from '../types';

type PedidosListaProps = {
  filters: PedidoFilter;
  onSelectPedido: (id: string) => void;
};

export function PedidosLista({ filters, onSelectPedido }: PedidosListaProps) {
  const { pedidos, isLoading, error, page, totalPages, setPage } =
    usePedidos(filters);
  const isTablet = useMediaQuery('(min-width: 768px)');

  // ---- Loading ----
  if (isLoading) {
    return (
      <div className="space-y-3 px-4" role="status" aria-label="Carregando pedidos">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <PedidoEmptyState
        icon="alert-triangle"
        title="Erro ao carregar pedidos"
        description={error}
        action={{ label: 'Tentar novamente', href: '#' }}
      />
    );
  }

  // ---- Empty ----
  if (pedidos.length === 0) {
    return (
      <PedidoEmptyState
        icon="package"
        title="Nenhum pedido encontrado"
        description="Ajuste os filtros ou aguarde novos pedidos."
      />
    );
  }

  // ---- Mobile: cards ----
  if (!isTablet) {
    return (
      <div className="space-y-3 px-4 pb-24">
        {pedidos.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} onPress={onSelectPedido} />
        ))}
      </div>
    );
  }

  // ---- Tablet+: tabela ----
  return <PedidosTabela pedidos={pedidos} onSelect={onSelectPedido} />;
}
```

### 3.9 — Página: `app/(admin)/pedidos/page.tsx`

```typescript
import { Suspense } from 'react';
import { PedidosPageContent } from './page-content';

// ⚠️ A página NUNCA contém lógica de negócio, fetching, ou estado.
// Ela APENAS orquestra imports de features/ e repassa props.
export default function PedidosPage() {
  return (
    <Suspense fallback={<PedidosPageSkeleton />}>
      <PedidosPageContent />
    </Suspense>
  );
}
```

```typescript
// page-content.tsx — em arquivo separado para o Suspense funcionar
'use client';

import { useState } from 'react';
import { PedidosLista, PedidoDetalhesSheet, FiltrosPedidos } from '@/features/admin/pedidos';
import type { PedidoFilter } from '@/features/admin/pedidos';

export function PedidosPageContent() {
  const [filters, setFilters] = useState<PedidoFilter>({});
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <FiltrosPedidos filters={filters} onChange={setFilters} />
      <PedidosLista filters={filters} onSelectPedido={setSelectedPedidoId} />
      <PedidoDetalhesSheet
        pedidoId={selectedPedidoId}
        onClose={() => setSelectedPedidoId(null)}
      />
    </div>
  );
}
```

---

## Seção 4 — Regras de Importação (NÃO NEGOCIÁVEIS)

### 4.1 — Hierarquia de camadas

```
┌──────────────────────────────────────────────┐
│  app/           ← Pode importar de:          │
│                   features/, components/ui/, │
│                   lib/, server/               │
├──────────────────────────────────────────────┤
│  features/      ← Pode importar de:          │
│                   components/ui/, lib/,      │
│                   packages/contracts/         │
│                   NUNCA de outras features/   │
├──────────────────────────────────────────────┤
│  components/ui/ ← Pode importar de:          │
│                   lib/ APENAS                 │
│                   NUNCA de features/          │
│                   NUNCA de server/            │
├──────────────────────────────────────────────┤
│  lib/           ← Pode importar de:          │
│                   packages/contracts/         │
│                   NUNCA de features/          │
│                   NUNCA de server/            │
├──────────────────────────────────────────────┤
│  server/        ← Pode importar de:          │
│                   packages/database/          │
│                   packages/contracts/         │
│                   NUNCA de features/          │
│                   NUNCA de components/ui/     │
│                   NUNCA de lib/ (cliente)     │
├──────────────────────────────────────────────┤
│  packages/      ← Pode importar de:          │
│  contracts/       NADA (folha)               │
├──────────────────────────────────────────────┤
│  packages/      ← Pode importar de:          │
│  database/        NADA (folha)               │
└──────────────────────────────────────────────┘
```

### 4.2 — Importações PROIBIDAS

| Violação | Exemplo | Correção |
|----------|---------|----------|
| Feature → Feature | `import { PedidoCard } from '@/features/admin/pedidos'` dentro de `features/admin/catalogo/` | Extrair para `components/ui/` ou criar hook compartilhado em `lib/` |
| `app/` com lógica de negócio | `const [pedidos, setPedidos] = useState()` dentro de `page.tsx` | Mover para `features/<dominio>/hooks/` |
| `components/ui/` importando de `features/` | `import { PedidoStatus } from '@/features/admin/pedidos'` em `badge.tsx` | Tipos de domínio NÃO pertencem a `ui/` |
| `components/ui/` importando de `server/` | `import { db } from '@/server/db'` em `data-table.tsx` | `ui/` é cliente; `server/` é server-only |
| `lib/` importando de `features/` | `import { formatPedidoStatus } from '@/features/admin/pedidos'` em `formatters.ts` | Formatters são genéricos; não podem depender de domínio |
| `lib/` importando de `server/` | `import { db } from '@/server/db'` em `api-client.ts` | `lib/` roda no cliente; `server/` é server-only |
| `server/` importando de `features/` ou `lib/` | Qualquer import de `@/features/` ou `@/lib/` em `server/` | `server/` é folha de infraestrutura |
| `packages/contracts/` importando de qualquer lugar | `import { prisma } from '@juliana-gaspar/database'` | Contracts são folha pura |

### 4.3 — Regra de compartilhamento entre features

Se DUAS features diferentes precisam do mesmo componente, hook, ou utilitário:

1. **É um componente visual genérico?** → Extrair para `components/ui/`
2. **É um hook ou utilitário de lógica?** → Extrair para `lib/`
3. **É um tipo ou schema que trafega na API?** → Extrair para `packages/contracts/`
4. **Nenhum dos anteriores?** → Reavaliar se as features não deveriam ser uma só

### 4.4 — `components/ui/` vs `features/*/components/`

| `components/ui/` | `features/*/components/` |
|------------------|--------------------------|
| Genérico, reutilizável em 2+ features | Específico do domínio |
| Não sabe o que é "Pedido", "Cliente", "Prato" | Conhece as entidades do domínio |
| Props são tipos primitivos ou genéricos | Props incluem tipos do domínio (`PedidoListItem`) |
| Exemplo: `<DataTable columns={...} data={...} />` | Exemplo: `<PedidosTabela pedidos={...} />` |
| Exemplo: `<EmptyState icon="package" title="..." />` | Exemplo: `<PedidoEmptyState />` |
| Exemplo: `<ConfirmDialog open title cancel onConfirm/>` | Exemplo: `<CancelarPedidoDialog pedidoId />` |

### 4.5 — Schema Zod: `packages/contracts` vs `features/*/schemas/`

| `packages/contracts/` | `features/*/schemas/` |
|-----------------------|----------------------|
| Schema que representa o CONTRATO da API | Schema de formulário interno do frontend |
| Usado pelo NestJS (DTO validation) E pelo frontend | Usado SOMENTE no frontend |
| Define a forma exata do request/response body | Define regras de formulário (confirmação de senha, etc.) |
| Exemplo: `CreateOrderDTO` com `customerId`, `items`, `planType` | Exemplo: formulário multi-step que quebra `CreateOrderDTO` em partes |
| Deve ser idêntico no front e no back | Pode ter campos extras (confirmPassword, currentStep) |

**Regra:** Se o NestJS valida o mesmo schema, ele DEVE estar em `packages/contracts/`. Se é validação puramente de UI (ex: wizard step), fica em `features/*/schemas/`.

---

## Seção 5 — Estratégia de Validação Backend ↔ Frontend

### 5.1 — Pipeline de validação

```
┌─────────────────────────────────────────────────────────┐
│                   Request Flow                           │
├─────────────────────────────────────────────────────────┤
│  1. Cliente (browser)                                   │
│     └─ features/*/schemas/ + contracts  → Zod no client │
│        (validação de formulário ANTES de enviar)         │
│                                                         │
│  2. Next.js API Route (proxy)                           │
│     └─ NÃO valida — apenas encaminha                    │
│                                                         │
│  3. NestJS Controller                                   │
│     └─ ZodValidationPipe usa contracts/ para validar    │
│                                                         │
│  4. NestJS Service                                      │
│     └─ Regras de negócio adicionais                     │
│                                                         │
│  5. Prisma                                              │
│     └─ Validação de schema do banco                     │
└─────────────────────────────────────────────────────────┘
```

### 5.2 — NestJS DTOs usam contracts diretamente

```typescript
// packages/contracts/src/order.schema.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.string().uuid('Cliente inválido'),
  items: z.array(z.object({
    dishId: z.string().uuid('Prato inválido'),
    quantity: z.number().int().min(1, 'Mínimo 1 unidade'),
  })).min(1, 'Pedido deve ter pelo menos 1 prato'),
  planType: z.enum(['SINGLE', 'WEEKLY', 'MONTHLY']),
  deliveryAddress: z.string().min(10, 'Endereço muito curto').max(500),
  notes: z.string().max(500).optional(),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
```

```typescript
// apps/api/src/modules/orders/dto/create-order.dto.ts
// ✅ Não redefine o schema. Apenas re-exporta o tipo.
// O controller usa ZodValidationPipe + createOrderSchema diretamente.
export type { CreateOrderDTO } from '@juliana-gaspar/contracts';
export { createOrderSchema } from '@juliana-gaspar/contracts';
```

```typescript
// apps/api/src/modules/orders/orders.controller.ts
import { createOrderSchema, type CreateOrderDTO } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  @Post()
  create(
    @Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDTO,
  ) {
    return this.ordersService.create(dto);
  }
}
```

**NUNCA duplique schemas Zod.** O `packages/contracts` é a fonte única de verdade para contratos de API.

---

## Seção 6 — Proxy `app/api/` no Next.js

### 6.1 — Por que existe?

O Next.js está na frente (roteamento, SSR, auth cookies). O NestJS roda em porta separada. Em produção, o Nginx/reverse proxy do EasyPanel resolve. Em desenvolvimento, o Next.js atua como proxy reverso para o NestJS.

### 6.2 — Implementação

```typescript
// app/api/[...route]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function GET(req: NextRequest) {
  return proxy(req, 'GET');
}

export async function POST(req: NextRequest) {
  return proxy(req, 'POST');
}

export async function PATCH(req: NextRequest) {
  return proxy(req, 'PATCH');
}

export async function DELETE(req: NextRequest) {
  return proxy(req, 'DELETE');
}

async function proxy(req: NextRequest, method: string) {
  const path = req.nextUrl.pathname.replace('/api', '');
  const url = `${API_URL}${path}${req.nextUrl.search}`;

  const headers = new Headers();
  // Encaminha o cookie de autenticação
  const cookie = req.headers.get('cookie');
  if (cookie) headers.set('cookie', cookie);
  headers.set('content-type', 'application/json');

  const body = method !== 'GET' ? await req.text() : undefined;

  const res = await fetch(url, { method, headers, body });

  return new NextResponse(res.body, {
    status: res.status,
    headers: { 'content-type': 'application/json' },
  });
}
```

### 6.3 — Regras do proxy

- O proxy NUNCA valida dados (validação é responsabilidade do NestJS)
- O proxy NUNCA contém regras de negócio
- O proxy NUNCA acessa banco de dados
- O proxy APENAS encaminha requisições e cookies
- Em produção com reverse proxy (Nginx, Caddy), o proxy pode ser bypass

---

## Seção 7 — Checklist Mobile-First Expandido

### 7.1 — Landing Page (18 itens)

| # | Item | Regra |
|---|------|-------|
| L01 | Hero CTA acima da dobra | Headline + CTA DEVEM estar visíveis em viewport 320x568 sem scroll |
| L02 | Botões touch | Altura MÍNIMA 48px, largura MÍNIMA 120px |
| L03 | Espaçamento entre CTAs empilhados | MÍNIMO 16px |
| L04 | Imagens responsivas | `srcset` + `sizes` OBRIGATÓRIO. Formato WebP. |
| L05 | Lazy loading | `loading="lazy"` em TODAS imagens abaixo da dobra |
| L06 | FAQ accordion | Área de toque 48px no header. Animação ≤ 200ms. |
| L07 | Floating WhatsApp | 56×56px fixo, bottom: 20px, right: 16px, z-index: 50 |
| L08 | Depoimentos | Swipe horizontal com `touch-action: pan-y`. Dots indicadores. |
| L09 | Como funciona | 2×2 grid no mobile, 4 colunas em md+ |
| L10 | Cardápio cards | 1 card por linha no mobile, scroll vertical |
| L11 | CTA repetido | MÍNIMO 3 CTAs: hero, pós-cardápio, pré-footer |
| L12 | Contraste | TODOS textos ≥ 4.5:1 contra fundo (WCAG AA) |
| L13 | Tipografia base | 16px body (sem zoom necessário) |
| L14 | HTML semântico | `<header>`, `<main>`, `<section>`, `<footer>` obrigatórios |
| L15 | Open Graph | `og:title`, `og:description`, `og:image`, `og:type` |
| L16 | Schema LD+JSON | `LocalBusiness` com endereço Teresina-PI |
| L17 | Analytics placeholder | Comentário `{/* <!-- Meta Pixel + GA4 --> */}` visível |
| L18 | LGPD | Link no footer + banner de cookies com opção de recusar |

### 7.2 — Área do Cliente (14 itens)

| # | Item | Regra |
|---|------|-------|
| C01 | Login | Formulário centralizado, max-w 400px. Funciona em 320px. |
| C02 | Cadastro | Multi-step se 5+ campos. Senão, single-page com campos stacked. |
| C03 | Lista de pedidos | CARDS obrigatórios no mobile. Cada card mostra: data, status, valor, nº itens. |
| C04 | Detalhe do pedido | Timeline vertical de status. Pratos listados com foto e nome. |
| C05 | Status do pedido | Badge colorido + descrição textual em português |
| C06 | Rastreio de entrega | Timeline simplificada com 3-5 etapas visíveis |
| C07 | Assinaturas | Cards com: plano, status, próxima renovação, valor. Ações: pausar, cancelar. |
| C08 | Pausar/Cancelar assinatura | Dialog de confirmação com motivo e data |
| C09 | Perfil | Formulário stacked. Campos: nome, telefone, e-mail, restrições. |
| C10 | Endereço | Formulário stacked com CEP (busca automática opcional) |
| C11 | Pagamento | Status visível. Link de pagamento acessível com 1 toque. |
| C12 | WhatsApp | Botão "Falar com a Juliana" fixo no bottom, 48px altura |
| C13 | Logout | Acessível no header ou menu, 48px touch target |
| C14 | Estados vazios | "Você ainda não tem pedidos" com CTA "Ver cardápio" |

### 7.3 — Painel Admin (22 itens)

| # | Item | Regra |
|---|------|-------|
| A01 | Login admin | Formulário centralizado, max-w 400px |
| A02 | Header mobile | 56px altura fixa, hamburger esquerda, título centro |
| A03 | Drawer navigation | Abre da esquerda com overlay. Swipe-to-close. |
| A04 | Itens do menu | 48px altura, ícone 24px + label 14px, gap 12px |
| A05 | Listagens mobile | CARDS obrigatórios. NUNCA tabelas em < 768px. |
| A06 | Card tocável | Área inteira tocável, min-height 88px, `role="button"` |
| A07 | Filtros mobile | Sheet vindo de baixo (85vh max). Botão "Aplicar" sticky no bottom. |
| A08 | Formulários longos | 5+ campos → multi-step obrigatório com indicador de progresso |
| A09 | Skeletons | Toda listagem DEVE mostrar skeleton durante carregamento |
| A10 | Estados vazios | Ícone + título + descrição em PT-BR + CTA contextual |
| A11 | Erros | Mensagem em PT-BR + botão "Tentar novamente" |
| A12 | Toast feedback | Sucesso: verde. Erro: vermelho. Duração 4s. Posição bottom. |
| A13 | Confirmação destrutiva | Dialog obrigatório antes de cancelar/excluir |
| A14 | Sidebar tablet | 64px colapsada com ícones. Expansível a 240px. |
| A15 | Sidebar desktop | 240px fixa com ícones + labels |
| A16 | Breadcrumb | OCULTO em mobile. Visível apenas tablet+. |
| A17 | Paginação mobile | Botões "Anterior" e "Próximo" grandes. Números ocultos. |
| A18 | Busca | Input full-width 48px, debounce 300ms |
| A19 | KPIs | 2 cards por linha mobile, 3 tablet, 4 desktop |
| A20 | Logout | 2 toques máximos: menu > "Sair" |
| A21 | Scroll horizontal | PROIBIDO para dados transacionais. Permitido só para galerias. |
| A22 | Ações em lote | Só tablet+. Mobile: ações individuais por card. |

---

## Seção 8 — Comportamento Responsivo Obrigatório

### 8.1 — Listagens: quando card, quando tabela?

| Breakpoint | Listagem | Regra |
|------------|----------|-------|
| < 768px | **Card** | OBRIGATÓRIO. Tabela PROIBIDA para listagem de dados. |
| ≥ 768px | **Tabela** | Tabela com colunas priorizadas (máximo 5). Linha inteira clicável. |
| ≥ 1024px | **Tabela completa** | Todas as colunas visíveis. Ordenação por clique no header. |

**Exceções onde tabela é permitida em < 768px:**
- Nenhuma. Tabelas NUNCA são a experiência primária em mobile para dados transacionais (pedidos, clientes, pagamentos, catálogo, assinaturas, entregas).

### 8.2 — Metadados obrigatórios no card mobile

| Entidade | Campos visíveis no card (mobile) |
|----------|----------------------------------|
| Pedido | Nome do cliente, status (badge), nº itens, valor total, data de entrega |
| Cliente | Nome, telefone, total de pedidos, tags, última compra |
| Prato | Foto, nome, preço, disponível (toggle), ciclo atual |
| Pagamento | Pedido #, cliente, método, valor, status |
| Assinatura | Cliente, plano, status, próxima renovação, valor |
| Entrega | Pedido #, cliente, zona, status, data |

### 8.3 — Filtros por breakpoint

| Breakpoint | Comportamento | Implementação |
|------------|---------------|---------------|
| < 768px | Sheet bottom | `<Sheet>` com 85vh max. Overlay escuro. Handle de arraste visível. "Aplicar" sticky no bottom. "Limpar" no topo. |
| 768–1023px | Drawer direita | `<Drawer>` 400px com overlay lateral. Mesmos controles internos. |
| ≥ 1024px | Barra inline | Filtros em linha horizontal acima da tabela. Status como tabs clicáveis. |

**Regras adicionais:**
- Contador de filtros ativos no botão "Filtros" (badge numérico)
- Contador de resultados: "12 pedidos encontrados"
- Filtros aplicados DEVEM ser visíveis como chips removíveis abaixo da barra (tablet+)
- Data: usar `<input type="date">` nativo como primeira opção

### 8.4 — Paginação por breakpoint

| Breakpoint | Comportamento |
|------------|---------------|
| < 768px | Botões "← Anterior" / "Próximo →" com texto "Página X de Y" entre eles. 48px altura. |
| ≥ 768px | Números de página visíveis (máx 5 + elipses). Página atual destacada. |

**Regras:**
- Primeira página: "Anterior" desabilitado (NUNCA escondido)
- Última página: "Próximo" desabilitado (NUNCA escondido)
- Loading entre páginas: skeleton, NUNCA tela branca

### 8.5 — Busca por breakpoint

| Breakpoint | Comportamento |
|------------|---------------|
| < 768px | Input full-width, 48px altura, abaixo do header. Ícone lupa à esquerda. |
| ≥ 768px | Mesmo comportamento, max-w 320px alinhado à direita. |

**Regras:**
- Debounce 300ms obrigatório. NUNCA buscar a cada tecla.
- Ícone de limpar (X) visível quando campo preenchido
- Placeholder: "Buscar pedidos...", "Buscar clientes..." (contextual)

### 8.6 — Drawers, Sheets, Dialogs: quando usar cada um?

| Componente | Quando usar | Breakpoint |
|------------|-------------|------------|
| **Sheet** (bottom) | Filtros mobile, detalhes rápidos mobile | < 768px |
| **Drawer** (lateral) | Filtros tablet, detalhes completos, navegação admin | ≥ 768px |
| **Dialog** (centro) | Confirmações (cancelar, excluir), formulários rápidos, alertas | Todos |
| **Página dedicada** (`/pedidos/[id]`) | Detalhes complexos com sub-ações, formulários longos de edição | ≥ 1024px |

**Regra de ouro:** Sheet no mobile NUNCA compete com Dialog. Sheet é para navegação/filtros. Dialog é para confirmações/ações.

### 8.7 — Regras PROIBIDAS em smartphone

| # | Prática proibida | Motivo |
|---|-----------------|--------|
| 1 | Tabela horizontal com scroll | Ilegível, requer zoom e pan |
| 2 | Hover como interação principal | Não existe em touch |
| 3 | Dropdown com submenu aninhado | Impossível de usar com polegar |
| 4 | Links/botões com < 44px de altura | WCAG 2.2 AA: área de toque insuficiente |
| 5 | Texto < 14px para conteúdo | Requer zoom para leitura |
| 6 | Modal com scroll interno + scroll externo | Usuário perde o contexto |
| 7 | Placeholder como único label | Some ao digitar. Acessibilidade falha. |
| 8 | Carrossel sem dots/swipe indicators | Usuário não sabe quantos itens existem |
| 9 | Accordions aninhados > 2 níveis | Confusão de navegação |
| 10 | Loading sem skeleton | "Carregando..." texto puro é inaceitável |

---

## Seção 9 — Touch Targets e Zonas de Toque (NÃO NEGOCIÁVEL)

| Elemento | Altura Mínima | Largura Mínima | Gap entre pares |
|----------|--------------|----------------|-----------------|
| Botão primário (CTA) | 48px | 120px | 16px |
| Botão secundário | 44px | 44px | 12px |
| Botão de ação em card (ícone) | 44px | 44px | 12px |
| Input / Select / Textarea | 48px | preenchimento disponível | 16px |
| Checkbox / Radio (área clicável) | 44px | 44px | 8px |
| Card inteiro tocável | 88px (altura total) | preenchimento disponível | 12px |
| Item de menu | 48px | preenchimento disponível | 0 |
| Ícone de ação isolado (edit, delete) | 44px | 44px | 12px |
| Floating Action Button | 56px | 56px | — |
| Link inline | 44px (área de toque) | — | — |

### Zonas thumb-friendly (mobile, uso com uma mão)

```
┌─────────────────────────┐
│  Zona difícil (estica)  │  ← 0–15% da tela (topo)
│  Header fixo 56px       │
├─────────────────────────┤
│                         │
│  Zona natural           │  ← 15–50% da tela
│  (alcance confortável)  │     Conteúdo principal
│                         │     Scroll vertical
│                         │
├─────────────────────────┤
│  Zona fácil (polegar)   │  ← 50–100% da tela (bottom)
│                         │     Ações principais
│  Bottom actions sticky  │     CTAs
│  Floating WhatsApp 56px │     Navegação inferior (se usar)
└─────────────────────────┘
```

**Regras de zona:**
1. Ações primárias DEVEM estar na metade inferior do card/tela quando possível
2. Botões destrutivos (cancelar, excluir) NUNCA devem ser a ação mais fácil de alcançar
3. Em formulários multi-step, o botão "Continuar" DEVE ser sticky no bottom
4. Floating WhatsApp DEVE estar fixo no bottom-right (z-index mais alto que qualquer outro elemento)

---

## Seção 10 — Estados de UI Obrigatórios

Todo componente de listagem DEVE implementar:

| Estado | Implementação | Exemplo visual |
|--------|---------------|----------------|
| **Loading** | Skeleton com mesma estrutura do conteúdo | Cards "fantasma" com altura igual ao conteúdo real |
| **Empty (inicial)** | Ícone + "Nenhum X encontrado" + CTA | "Nenhum pedido. Crie seu primeiro cardápio para receber pedidos." |
| **Empty (filtro)** | Ícone + "Nenhum resultado" + "Limpar filtros" | "Nenhum pedido com esses filtros. [Limpar filtros]" |
| **Error** | Ícone de erro + mensagem PT-BR + "Tentar novamente" | "Erro ao carregar pedidos. [Tentar novamente]" |
| **Success feedback** | Toast verde, 4s, bottom | "Pedido #123 confirmado com sucesso" |
| **Disabled** | Opacidade reduzida (50%), `cursor-not-allowed` | Botão cinza sem interação |

**Estados de formulário:**

| Estado | Regra |
|--------|-------|
| **Submitting** | Botão mostra spinner + "Salvando..." com `disabled` |
| **Validation error** | Mensagem inline abaixo do campo, borda vermelha, ícone de erro |
| **Server error** | Toast vermelho com mensagem do servidor em PT-BR |
| **Success redirect** | Toast verde + redirecionamento após 1s |

---

## Seção 11 — Navegação Admin por Breakpoint

### Mobile (< 768px)

```
┌──────────────────────────────────┐
│ ☰  │  Pedidos              │  🔔 │  ← Header 56px fixo, z-40
├──────────────────────────────────┤
│                                  │
│  [Conteúdo principal]            │  ← Scroll vertical
│                                  │
│                                  │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│  [Filtros]                (3)    │  ← Botão filtros sticky, z-30
└──────────────────────────────────┘

Drawer (aberto pelo ☰):
┌─────────────┐
│ 🏠 Painel   │  ← 48px altura por item
│ 🍽️ Catálogo │
│ 📦 Pedidos  │  ← Item ativo: bg destacado
│ 👥 Clientes │
│ 💰 Pagamentos│
│ 🚚 Entregas │
│ 📊 Relatórios│
│ ⚙️ Config.  │
│             │
│ ─────────── │  ← Separador
│ 🚪 Sair     │
└─────────────┘
```

### Tablet (768px – 1023px)

```
┌──┬──────────────────────────────────────┐
│🏠 │  Painel > Pedidos            │  🔔  │
│  ├──────────────────────────────────────┤
│🍽 │                                      │
│  │  [Conteúdo principal]                │
│📦 │                                      │
│  │                                      │
│👥 │                                      │
│  │                                      │
│💰 │                                      │
│  │                                      │
│📊 │                                      │
│  ├──────────────────────────────────────┤
│⚙ │  ←1 2 3 4 5...8 Próximo→           │
└──┴──────────────────────────────────────┘
Sidebar: 64px colapsada (ícones)
Expansível a 240px ao clicar no toggle »
```

### Desktop (≥ 1024px)

```
┌──────────────────┬──────────────────────────────────────┐
│ 🏠 Painel        │  Painel > Pedidos            │  🔔  │
│ 🍽️ Catálogo     ├──────────────────────────────────────┤
│ 📦 Pedidos       │                                      │
│ 👥 Clientes      │  [Filtros inline]                    │
│ 💰 Pagamentos    │  [Tabela completa]                   │
│ 🚚 Entregas      │                                      │
│ ─────────────    │                                      │
│ 📊 Relatórios    │                                      │
│ ⚙️ Configurações │                                      │
│                  ├──────────────────────────────────────┤
│ 🚪 Sair          │  ← Ant 1 2 [3] 4 5...8 Próx →      │
└──────────────────┴──────────────────────────────────────┘
Sidebar: 240px fixa, ícones + labels, grupos com títulos
```

---

## Seção 12 — Dashboards por Breakpoint

### KPI Cards

| Breakpoint | Layout | Máximo de cards |
|------------|--------|-----------------|
| < 640px | 2 colunas | 4 |
| 640–1023px | 3 colunas | 6 |
| ≥ 1024px | 4 colunas | 8 |

### Métricas priorizadas no mobile (ordem de importância)

1. Faturamento do ciclo atual (R$)
2. Total de pedidos ativos
3. Pedidos pendentes (requer ação)
4. Pagamentos pendentes

### Gráficos

| Breakpoint | Regra |
|------------|-------|
| < 768px | Altura 200px. Máximo 2 gráficos. Barras horizontais preferíveis a verticais. Gráfico de pizza PROIBIDO (ilegível em tela pequena). |
| 768–1023px | Altura 280px. Até 3 gráficos. |
| ≥ 1024px | Altura 350px. Layout de grade com seções expansíveis. |

- Se um gráfico não couber ou não for legível em mobile, substituir por KPI textual (número grande + variação percentual)
- Tooltips em gráficos DEVEM funcionar com toque (não hover)
- Scroll horizontal em gráficos: permitido APENAS se o gráfico for mais largo que a tela

---

## Seção 13 — Formulários por Breakpoint

### Regras universais

- Labels SEMPRE acima do input (nunca inline)
- Inputs com altura mínima 48px
- Validação inline: mensagem abaixo do campo, borda vermelha
- Campos obrigatórios com asterisco vermelho + texto "(obrigatório)"

### Multi-step (obrigatório se 5+ campos no mobile)

```
┌──────────────────────────────────┐
│  ● ○ ○  Passo 1 de 3            │  ← Indicador de progresso
├──────────────────────────────────┤
│                                  │
│  [Campos do passo atual]         │
│                                  │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│  [Voltar]        [Continuar →]  │  ← Sticky bottom
└──────────────────────────────────┘
```

| Breakpoint | Campos visíveis por step |
|------------|--------------------------|
| < 768px | Máximo 5 campos |
| ≥ 768px | Sem limite (single page) |

### Comportamento do submit

| Breakpoint | Botão submit |
|------------|-------------|
| < 768px | Full-width, sticky no bottom, 48px altura |
| ≥ 768px | Largura automática, inline no formulário |

---

## Seção 14 — Alinhamento Backend ↔ Contracts

### 14.1 — Fluxo de dependência

```
packages/contracts  (schemas Zod + tipos TypeScript)
       ↓
       ├──→ apps/api/src/modules/*/dto/  (re-exporta tipos)
       │         ↓
       │    NestJS usa ZodValidationPipe + contract schema
       │
       └──→ apps/web/features/*/services/  (importa tipos)
                 ↓
            api-client.ts usa tipos para tipar respostas
```

### 14.2 — O que NÃO fazer

```typescript
// ❌ PROIBIDO: Duplicar schema Zod no NestJS
// apps/api/src/modules/orders/dto/create-order.dto.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  // ... copiado de contracts/
});
// ❌ Isso quebra o single source of truth.
```

```typescript
// ✅ CORRETO: Re-exportar de contracts
// apps/api/src/modules/orders/dto/create-order.dto.ts
export { createOrderSchema, type CreateOrderDTO } from '@juliana-gaspar/contracts';
```

### 14.3 — Packages independência

- `packages/contracts/` — NUNCA importa de outros pacotes ou apps
- `packages/database/` — NUNCA importa de outros pacotes ou apps
- `packages/config/` — Arquivos de configuração estáticos, sem imports

---

## Seção 15 — Governança de Arquitetura

### 15.1 — Adicionar uma nova feature

Para criar uma nova feature (ex: `admin/estoque`):

1. Criar estrutura mínima em `features/admin/estoque/`:
   ```
   features/admin/estoque/
   ├── components/
   │   └── estoque-lista.tsx
   ├── types/
   │   └── index.ts
   └── index.ts
   ```
2. Criar rota em `app/(admin)/estoque/page.tsx`
3. Adicionar item no menu de navegação
4. Adicionar módulo NestJS em `apps/api/src/modules/inventory/`
5. Se houver contratos compartilhados, adicionar schema em `packages/contracts/src/inventory.schema.ts`
6. Criar migration Prisma se houver novas tabelas

### 15.2 — Mínimo que toda feature DEVE conter

| Arquivo | Obrigatório? | Descrição |
|---------|-------------|-----------|
| `components/` | ✅ Sim | Pelo menos 1 componente |
| `types/index.ts` | ✅ Sim | Tipos internos da feature |
| `index.ts` (barrel) | ✅ Sim | Export público da feature |
| `hooks/` | Opcional | Se houver estado ou data fetching |
| `schemas/` | Opcional | Se houver formulários |
| `services/` | Opcional | Se houver chamadas à API |
| `actions/` | Opcional | Se houver server actions |

### 15.3 — Quando extrair de uma feature para shared

| Situação | Destino |
|----------|---------|
| Componente visual usado em 2+ features | `components/ui/` |
| Hook/utilitário usado em 2+ features | `lib/` |
| Tipo ou schema usado pelo front E back | `packages/contracts/` |
| Modelo de dados usado por NestJS E Prisma | `packages/database/` |

### 15.4 — Anti-padrões PROIBIDOS

| # | Anti-padrão | Exemplo | Penalidade |
|---|------------|---------|------------|
| 1 | Feature importa de outra feature | `import { PedidoCard } from '@/features/admin/pedidos'` em `features/admin/catalogo/` | Code review bloqueia |
| 2 | `app/` contém lógica de negócio | `useState`, `useEffect`, `fetch` dentro de `page.tsx` | Code review bloqueia |
| 3 | `components/ui/` contém lógica de domínio | Componente `DataTable` que sabe o que é `Pedido` | Code review bloqueia |
| 4 | `lib/` ou `server/` genérico demais | `shared/utils.ts` virando dumping ground | Refatorar ou dividir |
| 5 | Mobile como afterthought CSS | Componente desenhado desktop-first com media queries para corrigir mobile | Rejeitado; refazer mobile-first |
| 6 | Scroll horizontal para dados | `<div class="overflow-x-auto"><table>` como solução de responsividade | Rejeitado; usar cards |
| 7 | Schema Zod duplicado | Mesmo schema em `contracts/` e `features/*/schemas/` | Code review bloqueia |
| 8 | Hover como única forma de revelar ação | Menu dropdown só aparece no hover | Rejeitado; usar click/tap |
| 9 | Texto placeholder como label | Input sem `<label>` associado | Falha auditoria a11y |
| 10 | `@/server/` importado de `'use client'` | `import { db } from '@/server/db'` em componente cliente | Erro de build |

---

## Seção 16 — Definition of Ready (DoR) — Nova Tela

Antes de começar a codificar uma tela, todos os itens DEVEM estar atendidos:

- [ ] Rota definida em `app/` com `page.tsx` e `layout.tsx` quando aplicável
- [ ] Estrutura da feature criada em `features/<scope>/<dominio>/` (mínimo: `components/`, `types/`, `index.ts`)
- [ ] Tipos internos definidos em `types/index.ts`
- [ ] Contracts de API revisados. Se faltar algo em `packages/contracts/`, criado ANTES.
- [ ] Design mobile (320px) definido (Figma, esboço ou wireframe aprovado)
- [ ] Estados definidos: loading, empty, error, success
- [ ] Regras de validação documentadas (campos obrigatórios, formatos)
- [ ] Permissões de acesso definidas (qual role pode ver/editar)

## Seção 17 — Definition of Done (DoD) — Feature Responsiva

Antes de marcar uma feature como concluída:

- [ ] Funciona em 320px, 375px, 414px, 768px, 1024px, 1440px
- [ ] Listagens usam cards em < 768px, tabela em ≥ 768px
- [ ] Nenhum scroll horizontal para dados
- [ ] Todos touch targets ≥ 44px (ações) ou ≥ 48px (inputs/CTAs)
- [ ] Skeleton loading implementado
- [ ] Estado vazio implementado com CTA contextual
- [ ] Estado de erro com "Tentar novamente" implementado
- [ ] Toast de feedback após ações
- [ ] Contraste WCAG AA verificado (cores de texto ≥ 4.5:1)
- [ ] Navegação por teclado funcional (Tab, Enter, Escape)
- [ ] `aria-label` em botões sem texto visível
- [ ] Sem imports de `@/server/` em componentes `'use client'`
- [ ] Sem imports de features irmãs
- [ ] Formulários com validação inline em PT-BR
- [ ] HTML semântico (`<main>`, `<section>`, `<nav>`, `<header>`)

## Seção 18 — QA Checklist Mobile (Validação Antes de Aprovar Tela)

O revisor DEVE validar em dispositivo real ou DevTools no modo responsivo (320px e 375px):

| # | Verificação | Método |
|---|------------|--------|
| Q01 | A tela carrega completamente sem scroll horizontal? | Reduzir viewport para 320px |
| Q02 | O conteúdo crítico está visível sem scroll? | Ver hero/CTA no landing; cards principais no admin |
| Q03 | Todos botões têm pelo menos 48px de altura? | Medir no DevTools |
| Q04 | É possível tocar em qualquer ação com o polegar sem zoom? | Testar touch em modo responsivo |
| Q05 | Textos são legíveis sem zoom? | Tamanho mínimo 14px para conteúdo |
| Q06 | Contraste suficiente em luz ambiente clara? | Simular com brilho máximo |
| Q07 | Formulário mostra validação inline ao submeter vazio? | Submeter sem preencher |
| Q08 | Skeleton aparece antes dos dados carregarem? | Throttle network para Slow 3G |
| Q09 | Estado vazio mostra mensagem útil e CTA? | Acessar tela sem dados |
| Q10 | Erro de rede mostra mensagem e botão "Tentar novamente"? | Simular offline |
| Q11 | Filtros abrem em sheet (mobile) e são aplicáveis com 1 toque? | Testar abertura e aplicação |
| Q12 | Paginação funciona com botões Anterior/Próximo (mobile)? | Navegar entre páginas |
| Q13 | Dialog de confirmação aparece antes de ação destrutiva? | Tentar cancelar/excluir |
| Q14 | Toast de sucesso/erro aparece após ação? | Executar uma ação |
| Q15 | Teclado não obscurece campos de formulário? | Focar em input no mobile |

---

## Apêndice A — Breakpoints Tailwind

```typescript
// tailwind.config.ts — breakpoints padrão
{
  theme: {
    screens: {
      'sm': '640px',   // Smartphone landscape
      'md': '768px',   // Tablet portrait
      'lg': '1024px',  // Desktop / notebook
      'xl': '1280px',  // Desktop grande
      '2xl': '1536px', // Monitor wide
    }
  }
}
```

**Regra de uso:** Todo estilo começa mobile (sem prefixo). Media queries adicionam comportamento para cima (`md:`, `lg:`).

---

## Apêndice B — Glossário de Termos

| Português (UI) | Inglês (código técnico) | Contexto |
|----------------|------------------------|----------|
| Pedido | Order | NestJS module, Prisma model, contracts |
| Cliente | Customer | NestJS module, Prisma model, contracts |
| Prato | Dish | NestJS module, Prisma model, contracts |
| Cardápio | Menu/Catalog | Feature admin |
| Ciclo semanal | WeeklyCycle | NestJS module, Prisma model |
| Assinatura | Subscription | NestJS module, Prisma model |
| Pagamento | Payment | NestJS module, Prisma model |
| Entrega | Delivery | NestJS module, Prisma model |
| Produção | Production | NestJS module, Prisma model |
| Estoque | Inventory | NestJS module, Prisma model |
| Ingrediente | Ingredient | Prisma model |
| Ficha técnica | RecipeItem | Prisma model |
| Relatório | Report | NestJS module |
| Painel | Dashboard | Feature admin |
| Zona de entrega | DeliveryZone | Prisma model |
| Perfil | Profile | Feature cliente |

---

*Fim da especificação de arquitetura v2. Pronto para revisão e transição ao plano de implementação.*
