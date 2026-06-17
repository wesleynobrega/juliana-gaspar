# System Flows — Juliana Gaspar Platform

**Última atualização:** 2026-06-16
**Versão:** 1.0

---

## 1. Fluxo de Autenticação

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Cliente │         │  Next.js │         │  NestJS  │
│ (Browser)│         │  (Web)   │         │  (API)   │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                     │                    │
     │  Acessa /login      │                    │
     │────────────────────>│                    │
     │                     │                    │
     │  Preenche email +    │                    │
     │  senha e submete    │                    │
     │────────────────────>│                    │
     │                     │  POST /api/auth/   │
     │                     │  login             │
     │                     │───────────────────>│
     │                     │                    │
     │                     │                    │ Busca user por email
     │                     │                    │ Compara bcrypt hash
     │                     │                    │ Assina JWT (7d)
     │                     │                    │
     │                     │  { accessToken,    │
     │                     │    user }          │
     │                     │<───────────────────│
     │                     │                    │
     │                     │ Salva token + user │
     │                     │ em localStorage    │
     │   Redireciona para  │                    │
     │   /painel           │                    │
     │<────────────────────│                    │
     │                     │                    │
     │  GET /painel        │                    │
     │────────────────────>│                    │
     │                     │ AuthGuard verifica │
     │                     │ localStorage token │
     │                     │ (presente → render │
     │                     │  página)           │
     │                     │                    │
```

### 1.1 Fluxo de Logout

```
Cliente clica "Sair" no header
  → Header chama handleLogout():
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
  → Sem chamada ao servidor
  → Token JWT continua válido até expirar (7d)
```

---

## 2. Fluxo de Pedido (Order Lifecycle)

```
┌──────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DO PEDIDO                        │
│                                                                   │
│  PENDING ──→ CONFIRMED ──→ IN_PRODUCTION ──→ OUT_FOR_DELIVERY   │
│     │                                                         │   │
│     │                                                         ▼   │
│     └──→ CANCELLED                              DELIVERED  ◄──┘  │
│                                                                   │
│  Fluxo normal:                                                     │
│  1. Admin/Operador cria pedido → status = PENDING                  │
│  2. Pagamento confirmado → status = CONFIRMED                      │
│  3. Cozinha inicia produção → status = IN_PRODUCTION               │
│  4. Pedido sai para entrega → status = OUT_FOR_DELIVERY            │
│  5. Entrega concluída → status = DELIVERED                         │
│                                                                   │
│  Cancelamento:                                                     │
│  • A qualquer momento antes de DELIVERED                           │
│  • Pedidos CANCELLED são excluídos dos cálculos de receita         │
└──────────────────────────────────────────────────────────────────┘
```

### 2.1 Criação de Pedido (Fluxo Detalhado)

```
Admin/Operador → Página /pedidos → Clica "Novo Pedido" (ou API direta)
  │
  ▼
POST /api/orders
Body: {
  customerId, planType, deliveryAddress, deliveryDate?, cycleId?, notes?,
  items: [{ dishId, quantity }]
}
  │
  ▼
OrdersService.create()
  │
  ├─ 1. Busca cliente: prisma.customer.findUnique(customerId)
  │     └─ Não encontrado → 400 "Cliente não encontrado"
  │
  ├─ 2. Busca pratos: prisma.dish.findMany({ dishIds })
  │     └─ Quantidade divergente → 400 "Um ou mais pratos não encontrados"
  │
  ├─ 3. Calcula totalAmount:
  │     for each item: total += dish.price × item.quantity
  │
  ├─ 4. Cria pedido: prisma.order.create({
  │     data: { customerId, cycleId, planType, totalAmount, ... },
  │     items: { create: [{ dishId, quantity, unitPrice }] }
  │   })
  │
  └─ 5. Retorna pedido completo (via findById)
       └─ Include: customer, items com dish
```

### 2.2 Atualização de Status

```
Admin/Operador → Detalhe do pedido → Clica botão de status
  │
  ▼
PATCH /api/orders/:id/status
Body: { status: "IN_PRODUCTION", notes?: "Iniciando preparo" }
  │
  ▼
OrdersService.updateStatus()
  │
  ├─ 1. Verifica existência do pedido → 404 se não encontrado
  │
  ├─ 2. Atualiza: prisma.order.update({ status, notes })
  │
  └─ 3. Retorna pedido atualizado completo
```

---

## 3. Fluxo de Pagamento

```
┌──────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DO PAGAMENTO                     │
│                                                                   │
│                    PENDING ──────→ PAID                           │
│                                                                   │
│  1. Admin cria pagamento vinculado a pedido: status = PENDING     │
│  2. Cliente paga (PIX, dinheiro, cartão)                          │
│  3. Admin registra pagamento → status = PAID                      │
│     └─ Efeito colateral: order.paymentStatus = 'PAID'             │
└──────────────────────────────────────────────────────────────────┘
```

### 3.1 Registro de Pagamento (Fluxo Detalhado)

```
Admin → Página /pagamentos → Encontra pagamento PENDING → Clica "Registrar"
  │
  ▼
PATCH /api/payments/:id/register
Body: { paidAt?: "2026-06-16T10:00:00Z" }
  │
  ▼
PaymentsService.register()
  │
  ├─ 1. Busca pagamento → 404 se não encontrado
  │
  ├─ 2. Atualiza pagamento:
  │     prisma.payment.update({ status: 'PAID', paidAt })
  │
  └─ 3. Sincroniza pedido:
        prisma.order.update({ paymentStatus: 'PAID' })
```

---

## 4. Fluxo de Ciclo Semanal

```
┌──────────────────────────────────────────────────────────────────┐
│                    CICLO SEMANAL                                  │
│                                                                   │
│  Segunda ──── Criar ciclo + definir pratos                       │
│                 │                                                 │
│  Terça-Sexta ── Clientes fazem pedidos (via admin ou sistema)    │
│                 │                                                 │
│  Sexta ──────── Fechar ciclo (manual)                            │
│                 │                                                 │
│  Sábado ─────── Cozinha: IN_PRODUCTION                           │
│                 │                                                 │
│  Domingo ────── Entregas: OUT_FOR_DELIVERY → DELIVERED           │
│                 │                                                 │
│  Segunda ────── Registrar pagamentos pendentes                   │
│                 │                                                 │
│                 └── Novo ciclo começa                              │
└──────────────────────────────────────────────────────────────────┘
```

### 4.1 Criação de Ciclo (Fluxo Detalhado)

```
Admin → Página /ciclos → Clica "Novo Ciclo"
  │
  ▼
POST /api/cycles
Body: {
  openDate: "2026-06-16T00:00:00Z",
  closeDate: "2026-06-20T23:59:59Z",
  deliveryDate: "2026-06-22T00:00:00Z",
  dishIds: ["id1", "id2", "id3", "id4"]
}
  │
  ▼
CyclesService.create()
  │
  ├─ 1. Cria ciclo: prisma.weeklyCycle.create({
  │     data: { openDate, closeDate, deliveryDate },
  │     cycleDishes: { create: dishIds.map(id => ({ dishId: id })) }
  │   })
  │
  └─ 2. Retorna ciclo com pratos vinculados
```

### 4.2 Edição de Ciclo

```
PUT /api/cycles/:id
Body: { openDate?, closeDate?, deliveryDate?, dishIds? }
  │
  ▼
CyclesService.update()
  │
  ├─ 1. Verifica existência do ciclo
  │
  ├─ 2. Atualiza campos de data (se fornecidos)
  │
  ├─ 3. Se dishIds fornecidos:
  │     ├─ Delete todos os CycleDish existentes
  │     └─ Create novos CycleDish com os dishIds
  │
  └─ 4. Retorna ciclo atualizado completo (via findById)
```

---

## 5. Fluxo de Entrega

```
Admin → Página /entregas → Visualiza manifesto do dia
  │
  ▼
GET /api/delivery/manifest?date=2026-06-22&zoneId=zone-1
  │
  ▼
DeliveryService.getManifest()
  │
  ├─ 1. Filtra pedidos com status ativo:
  │     status IN ['CONFIRMED', 'IN_PRODUCTION', 'OUT_FOR_DELIVERY']
  │
  ├─ 2. Filtra por data (se fornecida)
  │
  ├─ 3. Include: customer (name, phone, address), items com dish (name, allergens)
  │
  ├─ 4. Ordena por deliveryAddress (ASC) para roteirização
  │
  └─ Retorna: { date, orderCount, orders[] }
```

### 5.1 Gestão de Zonas

```
Admin → Página /entregas
  │
  ├─ GET /api/delivery/zones → Lista zonas com nome, taxa, descrição
  │
  ├─ POST /api/delivery/zones → Criar nova zona
  │    Body: { name: "Zona Oeste", fee: 10.0, description?: "Bairros da zona oeste" }
  │
  ├─ PUT /api/delivery/zones/:id → Editar zona
  │
  └─ DELETE /api/delivery/zones/:id → Remover zona (ADMIN apenas)
```

---

## 6. Fluxo de Dados do Dashboard

```
Admin acessa /painel
  │
  ▼
DashboardPage monta → useEffect chama load()
  │
  ├─ Promise.all([
  │     api.get('/orders?limit=5'),          → pedidos recentes
  │     api.get('/customers?limit=1'),       → count clientes
  │     api.get('/dishes?limit=1'),          → count pratos
  │     api.get('/orders?limit=100'),        → todos pedidos (p/ revenue)
  │   ])
  │
  ├─ Calcula totalRevenue client-side:
  │   allOrders.data
  │     .filter(o => o.status !== 'CANCELLED')
  │     .reduce((sum, o) => sum + o.totalAmount, 0)
  │
  └─ Renderiza 4 KPI cards + tabela de pedidos recentes
```

**⚠️ Problema conhecido:** O dashboard faz 4 chamadas API. A chamada `limit=100` para cálculo de receita é ineficiente e quebra com >100 pedidos. Deveria existir um endpoint `GET /api/dashboard/summary` que retorna todos os KPIs em uma única chamada com agregação no banco (`prisma.order.aggregate`).

---

## 7. Fluxo de Dados Genérico (API Client)

```
┌─────────────────────────────────────────────────────────────────┐
│                   REQUEST LIFE CYCLE                             │
│                                                                  │
│  Componente React                                                │
│     │                                                            │
│     ▼                                                            │
│  api.get/post/put/patch/delete('/path', body?)                   │
│     │                                                            │
│     ├─ 1. Lê token do localStorage                               │
│     │                                                            │
│     ├─ 2. Monta headers:                                          │
│     │    Content-Type: application/json                          │
│     │    Authorization: Bearer <token> (se existir)              │
│     │                                                            │
│     ├─ 3. fetch(`${API_URL}/path`, { method, headers, body })    │
│     │                                                            │
│     ├─ 4. Se !res.ok → throw ApiError(status, message, errors)  │
│     │                                                            │
│     └─ 5. json = await res.json()                                │
│           return json.data    ← desembrulha o wrapper da API     │
│                                                                  │
│  API responde: { data: T, timestamp: string }                    │
│  Interceptor (TransformInterceptor) empacota                      │
│  api-client desempacota → componente recebe T direto             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Fluxo de Autorização (RBAC)

```
Requisição recebida em rota protegida
  │
  ▼
JwtAuthGuard (extends AuthGuard('jwt'))
  │
  ├─ Extrai token do header Authorization
  ├─ Valida assinatura JWT
  ├─ Decodifica payload { sub, email, role }
  └─ Anexa user ao request: req.user = { id: sub, email, role }
  │
  ▼
RolesGuard
  │
  ├─ Lê metadados @Roles('ADMIN', 'OPERATOR') do handler/class
  ├─ Se não há @Roles → acesso permitido (rota pública autenticada)
  ├─ Compara req.user.role com requiredRoles
  │   ├─ Incluído → permite
  │   └─ Não incluído → nega (403 Forbidden implícito)
  │
  ▼
Controller handler executa
  │
  ▼
ZodValidationPipe (se houver @Body(new ZodValidationPipe(schema)))
  │
  ├─ schema.safeParse(value)
  │   ├─ Sucesso → retorna result.data
  │   └─ Falha → 400 { message: "Erro de validação", errors: [...] }
  │
  ▼
Service executa lógica de negócio
  │
  ▼
Resposta é interceptada pelo TransformInterceptor
  └─ Transforma return value → { data: value, timestamp: now }
```

---

## 9. Fluxo de Erro

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                                 │
│                                                                  │
│  Service lança exceção                                           │
│     │                                                            │
│     ├─ NotFoundException    → 404 { message }                    │
│     ├─ BadRequestException  → 400 { message }                    │
│     ├─ UnauthorizedException → 401 { message }                  │
│     ├─ ForbiddenException   → 403 { message }                   │
│     └─ Outras exceções      → 500 { message: "Erro interno" }   │
│                                                                  │
│  HttpExceptionFilter intercepta TODAS as exceções                │
│  Formata resposta: { statusCode, message, timestamp }           │
│                                                                  │
│  Frontend (api-client):                                          │
│    !res.ok → throw ApiError(status, message, errors?)           │
│                                                                  │
│  Componente React:                                               │
│    try { await api.get(...) } catch (err) {                      │
│      if (err instanceof ApiError) {                              │
│        setError(err.message)                                     │
│      }                                                           │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Fluxo de Seed (Desenvolvimento)

```
pnpm prisma db seed
  │
  ▼
prisma/seed.ts → main()
  │
  ├─ 1. Cria admin user (email, bcrypt hash, role=ADMIN)
  │
  ├─ 2. Cria 6 pratos de exemplo
  │     • Salmão Grelhado com Legumes (R$ 42,90)
  │     • Frango à Parmegiana Fit (R$ 38,90)
  │     • Bowl de Quinoa Vegano (R$ 32,90)
  │     • Espaguete de Abobrinha (R$ 45,90)
  │     • Carne de Panela Low Carb (R$ 39,90)
  │     • Omelete de Forno Especial (R$ 28,90)
  │
  └─ 3. Cria 5 zonas de entrega
        • Zona Leste (R$ 5), Zona Norte (R$ 8), Zona Sul (R$ 5),
          Zona Sudeste (R$ 7), Centro (grátis)
```

---

## Notas de Implementação

1. **Todos os fluxos acima estão implementados** exceto onde anotado com 🔴 no PRD
2. **O dashboard** é o único fluxo com débito técnico conhecido (4 chamadas + cálculo client-side)
3. **O manifesto de entrega** recebe `zoneId` como parâmetro mas não o utiliza no filtro — bug conhecido
4. **O logout** é puramente client-side — o token JWT permanece válido até expirar
5. **Assinaturas, ingredientes e receitas** têm schemas Zod e modelos Prisma mas não têm módulos NestJS implementados
