# System Flows — Juliana Gaspar Platform

**Última atualização:** 2026-06-26
**Versão:** 2.1

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
│     └─ GATILHO: deduz ingredientes do estoque automaticamente     │
│                                                                   │
│  Cancelamento:                                                     │
│  • A qualquer momento antes de DELIVERED                           │
│  • Pedidos CANCELLED são excluídos dos cálculos de receita         │
└──────────────────────────────────────────────────────────────────┘
```

### 2.1 Criação de Pedido por Refeições (Fluxo Principal - v2.1)

```
Admin/Operador → Página /pedidos → Clica "Novo Pedido"
  │
  ├─ Sheet abre com 3 etapas (steps)
  │
  ├─ ETAPA 1: Selecionar Cliente
  │   ├─ Campo de busca: digita nome ou telefone
  │   ├─ Lista filtra clientes da API: GET /api/customers?search=...
  │   └─ Seleciona um cliente → avança para etapa 2
  │
  ├─ ETAPA 2: Montar Refeições
  │   ├─ Seleciona quantidade: 7 ou 14 refeições
  │   │
  │   ├─ Para cada slot (refeição 1..N):
  │   │   ├─ Select Proteína (obrigatório) — busca GET /api/dishes?nutrientType=PROTEINA
  │   │   ├─ Select Carboidrato (obrigatório) — busca GET /api/dishes?nutrientType=CARBOIDRATO
  │   │   ├─ Select Fibra (obrigatório) — busca GET /api/dishes?nutrientType=FIBRA
  │   │   ├─ Select Gordura (opcional) — busca GET /api/dishes?nutrientType=GORDURA
  │   │   ├─ Campo de observações
  │   │   ├─ Botão "Copiar do slot X" — copia composição de outra refeição
  │   │   └─ Botão "Repetir anterior" — copia da refeição do slot-1
  │   │
  │   ├─ Aba "Favoritos" — lista favoritos do cliente:
  │   │   └─ GET /api/customers/:id/favorites → cards com nome, composição
  │   │       └─ Clica → preenche o slot atual com a composição favorita
  │   │
  │   └─ Aba "Pedidos Anteriores" — refeições de pedidos passados:
  │       └─ GET /api/orders/previous-meals/:customerId → tabela
  │           └─ Clica → preenche o slot atual com a composição
  │
  ├─ ETAPA 3: Finalizar
  │   ├─ Endereço de entrega (texto)
  │   ├─ Data de entrega (date picker)
  │   ├─ Observações gerais
  │   └─ Resumo: N refeições, valor total estimado
  │
  └─ Submete: POST /api/orders/meal-based
      Body: {
        customerId, mealCount: 7 | 14,
        meals: [
          { slot: 1, proteinId, carboId, fiberId, fatId?, notes? },
          { slot: 2, copyFromSlot: 1 },  ← resolve no backend
          ...
        ],
        deliveryAddress, deliveryDate, notes?
      }
        │
        ▼
      OrdersService.createMealBased()
        │
        ├─ 1. Valida cliente existe → 400 se não
        │
        ├─ 2. Resolve copyFromSlot:
        │     para cada meal com copyFromSlot, copia proteinId/carboId/fiberId/fatId/notes
        │     da meal de origem; se origem não encontrada → 400
        │
        ├─ 3. Coleta todos os menuItemIds citados nos meals
        │     Busca todos em lote: prisma.menuItem.findMany({ where: { id: { in: ids } } })
        │     Monta mapa id → menuItem para acesso rápido
        │     └─ Se algum ID não encontrado → 400
        │
        ├─ 4. Calcula totalAmount:
        │     Para cada meal, soma technicalSheet.price de cada component (se existir)
        │     Fallback: usa menuItem.price se technicalSheet ausente
        │
        ├─ 5. Cria pedido com refeições em transação:
        │     prisma.order.create({
        │       data: {
        │         customerId, totalAmount, deliveryAddress, deliveryDate,
        │         status: 'PENDING', planType: 'SINGLE',
        │         meals: {
        │           create: meals.map(m => ({
        │             slot: m.slot,
        │             components: {
        │               create: [
        │                 { menuItemId: m.proteinId, nutrientType: 'PROTEINA' },
        │                 { menuItemId: m.carboId, nutrientType: 'CARBOIDRATO' },
        │                 { menuItemId: m.fiberId, nutrientType: 'FIBRA' },
        │                 ...(m.fatId ? [{ menuItemId: m.fatId, nutrientType: 'GORDURA' }] : []),
        │               ].filter(Boolean)
        │             }
        │           }))
        │         }
        │       },
        │       include: { meals: { include: { components: { include: { menuItem: true } } } }, customer: true }
        │     })
        │
        └─ 6. Retorna pedido completo com refeições e componentes
```

### 2.2 Atualização de Status com Baixa de Estoque

```
Admin/Operador → Detalhe do pedido → Altera status para DELIVERED
  │
  ▼
PATCH /api/orders/:id/status
Body: { status: "DELIVERED" }
  │
  ▼
OrdersService.updateStatus()
  │
  ├─ 1. Verifica existência do pedido → 404 se não encontrado
  │
  ├─ 2. Atualiza status: prisma.order.update({ status })
  │
  ├─ 3. Se status === 'DELIVERED':
  │     └─ Chama this.deductStock(order)
  │
  └─ 4. Retorna pedido atualizado + warnings de estoque (se houver)

deductStock(order) — algoritmo:
  │
  ├─ 1. Busca pedido completo com meals, components, menuItem, technicalSheet, ingredients
  │     prisma.order.findUnique({
  │       where: { id },
  │       include: {
  │         meals: {
  │           include: {
  │             components: {
  │               include: {
  │                 menuItem: {
  │                   include: {
  │                     technicalSheet: {
  │                       include: { ingredients: true }
  │                     }
  │                   }
  │                 }
  │               }
  │             }
  │           }
  │         }
  │       }
  │     })
  │
  ├─ 2. Agrega necessidades por ingrediente:
  │     const needed = new Map<string, number>()
  │     for (meal of order.meals)
  │       for (component of meal.components)
  │         for (ing of component.menuItem.technicalSheet.ingredients)
  │           needed.set(ing.ingredientId, (needed.get(ing.ingredientId) || 0) + ing.quantity)
  │
  ├─ 3. Para cada ingrediente, deduz do estoque:
  │     for ([ingredientId, qty] of needed)
  │       ingredient = await prisma.ingredient.findUnique(ingredientId)
  │       if (ingredient.stockQty < qty)
  │         warnings.push(`${ingredient.name}: estoque ${ingredient.stockQty}${ingredient.unit}, precisa ${qty}${ingredient.unit}`)
  │       await prisma.ingredient.update({
  │         where: { id: ingredientId },
  │         data: { stockQty: { decrement: qty } }
  │       })
  │
  └─ 4. Retorna warnings[] (não bloqueia — estoque pode ficar negativo)
```

---

## 3. Fluxo de Criação de Prato com Ficha Técnica

```
Admin → Página /cardapio → Clica "Novo Prato"
  │
  ├─ Sheet ou página de criação com formulário completo
  │
  ├─ Dados básicos do prato:
  │   ├─ Nome (obrigatório)
  │   ├─ Descrição
  │   ├─ Tipo de nutriente: PROTEINA | CARBOIDRATO | FIBRA | GORDURA
  │   ├─ Preço de venda (R$)
  │   ├─ Ingredientes (texto livre)
  │   ├─ Alérgenos (texto livre)
  │   └─ Disponível (toggle)
  │
  ├─ Ficha Técnica (obrigatória):
  │   ├─ Modo de preparo (textarea)
  │   ├─ Tempo de preparo (texto: "45 minutos")
  │   ├─ Equipamentos (lista dinâmica: add/remove itens)
  │   ├─ Observações (textarea)
  │   ├─ Preço de custo (R$)
  │   │
  │   └─ Ingredientes da ficha (lista dinâmica):
  │       ├─ Select de ingrediente (busca GET /api/ingredients)
  │       ├─ Quantidade (número)
  │       ├─ Unidade (auto-preenchida do ingrediente)
  │       └─ Botão remover
  │       └─ Botão "Adicionar ingrediente"
  │
  └─ Submete:
      POST /api/dishes (cria o prato)
      PUT /api/dishes/:id/technical-sheet (salva a ficha técnica)
        Body: {
          preparationMethod, preparationTime,
          equipment: ["Fogão", "Forno", "Liquidificador"],
          notes, price,
          ingredients: [
            { ingredientId: "uuid-1", quantity: 200 },
            { ingredientId: "uuid-2", quantity: 50 },
          ]
        }
          │
          ▼
      MenuService.upsertTechnicalSheet()
          │
          ├─ 1. Upsert da ficha: prisma.technicalSheet.upsert({
          │     where: { menuItemId },
          │     create: { menuItemId, preparationMethod, ... },
          │     update: { preparationMethod, ... }
          │   })
          │
          ├─ 2. Substitui ingredientes vinculados:
          │     await prisma.technicalSheetIngredient.deleteMany({
          │       where: { technicalSheetId: sheet.id }
          │     })
          │     if (ingredients.length > 0)
          │       await prisma.technicalSheetIngredient.createMany({
          │         data: ingredients.map(i => ({
          │           technicalSheetId: sheet.id,
          │           ingredientId: i.ingredientId,
          │           quantity: i.quantity
          │         }))
          │       })
          │
          └─ 3. Retorna ficha técnica completa com ingredients (include)
```

---

## 4. Fluxo de Pagamento (Completo - v2.1)

```
┌──────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DO PAGAMENTO                     │
│                                                                   │
│                    PENDING ──────→ PAID                           │
│                        │              │                           │
│                        │              └──→ REFUNDED               │
│                        │                     │                    │
│                        └──→ OVERDUE          │                    │
│                                               │                    │
│  Fluxos:                                                          │
│  1. Admin cria pagamento vinculado a pedido: status = PENDING     │
│  2. Cliente paga (PIX, dinheiro, cartão)                          │
│  3. Admin registra pagamento → status = PAID                      │
│     └─ Efeito: order.paymentStatus = 'PAID'                       │
│  4. Admin pode editar pagamento (método, valor, status)           │
│  5. Admin pode reembolsar → status = REFUNDED                     │
│     └─ Efeito: order.paymentStatus = 'REFUNDED'                   │
│     └─ Registra: refundReason, refundedAt                         │
│  6. Admin pode excluir pagamento (ADMIN apenas, com confirmação)  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.1 Criação de Pagamento

```
Admin → Página /pagamentos → Clica "Novo Pagamento"
  │
  ├─ Sheet com formulário:
  │   ├─ Busca e seleciona pedido (GET /api/orders?search=...)
  │   ├─ Cliente (auto-preenchido do pedido)
  │   ├─ Método: PIX | DINHEIRO | CARTAO
  │   ├─ Valor (R$)
  │   └─ Status inicial: PENDING
  │
  └─ Submete: POST /api/payments
      Body: { orderId, method, amount, status }
        │
        ▼
      PaymentsService.create()
        ├─ 1. Valida pedido existe
        ├─ 2. Cria payment: prisma.payment.create({ data: { orderId, method, amount, status } })
        └─ 3. Sincroniza pedido se PAID: prisma.order.update({ paymentStatus: 'PAID' })
```

### 4.2 Edição de Pagamento

```
Admin → Página /pagamentos → Seleciona pagamento → Ativa modo edição
  │
  ├─ Campos editáveis:
  │   ├─ Método (select)
  │   ├─ Valor (input number)
  │   └─ Status: PENDING | PAID | OVERDUE | REFUNDED
  │
  └─ Submete: PUT /api/payments/:id
      Body: { method?, amount?, status? }
        │
        ▼
      PaymentsService.update()
        ├─ 1. Verifica existência → 404 se não
        ├─ 2. Atualiza campos fornecidos: prisma.payment.update(...)
        └─ 3. Se status mudou para PAID → sincroniza pedido
```

### 4.3 Reembolso

```
Admin → Detalhe do pagamento → Clica "Reembolsar"
  │
  ├─ Confirmação com campo de motivo (opcional)
  │
  └─ Submete: POST /api/payments/:id/refund
      Body: { reason: "Cliente cancelou pedido" }
        │
        ▼
      PaymentsService.refund()
        ├─ 1. Busca pagamento → 404 se não
        ├─ 2. Atualiza: prisma.payment.update({
        │     status: 'REFUNDED',
        │     refundReason: reason,
        │     refundedAt: new Date()
        │   })
        └─ 3. Sincroniza pedido: prisma.order.update({ paymentStatus: 'REFUNDED' })
```

### 4.4 Exclusão de Pagamento

```
Admin → Página /pagamentos → Seleciona pagamento → Clica "Excluir"
  │
  ├─ Diálogo de confirmação: "Tem certeza? Esta ação não pode ser desfeita."
  │
  └─ Confirma → DELETE /api/payments/:id
        │
        ▼
      PaymentsService.remove()
        ├─ 1. Verifica existência → 404 se não
        ├─ 2. Remove: prisma.payment.delete({ where: { id } })
        └─ 3. Atualiza pedido: paymentStatus = 'PENDING'
```

---

## 5. Fluxo de Sugestão de Compras

```
Admin → Página /ingredientes → Aba "Sugestão de Compras"
  │
  ▼
GET /api/ingredients/purchase-suggestion
  │
  ▼
IngredientsService.getPurchaseSuggestion()
  │
  ├─ 1. Busca todos os pedidos CONFIRMED:
  │     prisma.order.findMany({
  │       where: { status: 'CONFIRMED' },
  │       include: {
  │         meals: {
  │           include: {
  │             components: {
  │               include: {
  │                 menuItem: {
  │                   include: {
  │                     technicalSheet: {
  │                       include: { ingredients: true }
  │                     }
  │                   }
  │                 }
  │               }
  │             }
  │           }
  │         }
  │       }
  │     })
  │
  ├─ 2. Agrega quantidades necessárias por ingrediente:
  │     const required = new Map<string, number>()
  │     for (order of confirmedOrders)
  │       for (meal of order.meals)
  │         for (component of meal.components)
  │           for (ing of component.menuItem.technicalSheet?.ingredients || [])
  │             required.set(ing.ingredientId, (required.get(ing.ingredientId) || 0) + ing.quantity)
  │
  ├─ 3. Busca detalhes dos ingredientes:
  │     const ingredients = await prisma.ingredient.findMany({
  │       where: { id: { in: [...required.keys()] } }
  │     })
  │
  ├─ 4. Calcula sugestão:
  │     const items = ingredients.map(ing => ({
  │       ingredientId: ing.id,
  │       ingredientName: ing.name,
  │       unit: ing.unit,
  │       stockQty: ing.stockQty,
  │       requiredQty: required.get(ing.id) || 0,
  │       suggestedPurchase: Math.max(0, (required.get(ing.id) || 0) - ing.stockQty),
  │     }))
  │
  └─ 5. Retorna lista ordenada por suggestedPurchase (decrescente)

Frontend:
  │
  ├─ Tabela com colunas:
  │   ├─ Ingrediente (name)
  │   ├─ Unidade
  │   ├─ Estoque atual (stockQty)
  │   ├─ Necessário (requiredQty)
  │   └─ Comprar (suggestedPurchase) — destaque âmbar se > 0
  │
  ├─ Botão "Copiar Lista":
  │   └─ Formata texto: "• Nome: X un — Comprar: Y"
  │   └─ navigator.clipboard.writeText(...)
  │
  └─ Botão "Imprimir":
      └─ window.print()
```

---

## 6. Fluxo de Cadastro de Cliente (Completo - v2.1)

```
Admin → Página /clientes → Clica "Novo Cliente"
  │
  ├─ Sheet com formulário completo:
  │
  ├─ Seção Dados Pessoais:
  │   ├─ Nome * (obrigatório)
  │   ├─ Telefone * (obrigatório, máscara automática)
  │   └─ Email
  │
  ├─ Seção Endereço Completo:
  │   ├─ Rua
  │   ├─ Número
  │   ├─ Bairro
  │   ├─ Cidade
  │   └─ CEP
  │
  ├─ Seção Redes Sociais:
  │   ├─ Instagram (@handle)
  │   └─ WhatsApp (com DDD)
  │
  ├─ Seção Preferências:
  │   ├─ Restrições alimentares (texto)
  │   ├─ Preferências (texto)
  │   └─ Tags (multi-select: VIP, alérgico, vegetariano, etc.)
  │
  ├─ Seção Observações:
  │   └─ Notas gerais (textarea)
  │
  └─ LGPD: ☐ Consentimento para uso de dados
  │
  └─ Submete: POST /api/customers
      Body: { name, phone, email?, street?, number?, neighborhood?,
              city?, zipCode?, instagram?, whatsapp?,
              dietaryRestrictions?, preferences?, notes?, tags?,
              lgpdConsent }
        │
        ▼
      CustomersService.create()
        ├─ 1. Valida campos obrigatórios
        ├─ 2. Cria: prisma.customer.create({ data })
        └─ 3. Retorna CustomerDTO completo

Detalhes do cliente (visualização):
  │
  ├─ Sheet com todos os campos organizados em seções
  ├─ Modo leitura com ícones por seção
  ├─ Seção de favoritos (refeições favoritas)
  └─ Seção de histórico de pedidos
```

---

## 7. Fluxo de Ciclo Semanal

```
┌──────────────────────────────────────────────────────────────────┐
│                    CICLO SEMANAL                                  │
│                                                                   │
│  Segunda ──── Criar ciclo + definir pratos + revisar sugestão    │
│                 │    de compras                                    │
│  Terça-Sexta ── Clientes fazem pedidos (via admin ou sistema)    │
│                 │                                                 │
│  Sexta ──────── Fechar ciclo (manual)                             │
│                 │                                                 │
│  Sábado ─────── Cozinha: IN_PRODUCTION (usar fichas técnicas)    │
│                 │                                                 │
│  Domingo ────── Entregas: OUT_FOR_DELIVERY → DELIVERED           │
│                 │    └─ Baixa automática de estoque               │
│  Segunda ────── Registrar pagamentos, reembolsos                 │
│                 │    └─ Conferir estoque vs sugestão de compras   │
│                 │                                                 │
│                 └── Novo ciclo começa                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Fluxo de Entrega

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

---

## 9. Fluxo de Dados do Dashboard

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

**⚠️ Problema conhecido:** O dashboard faz 4 chamadas API. A chamada `limit=100` para cálculo de receita é ineficiente e quebra com >100 pedidos. Deveria existir um endpoint `GET /api/dashboard/summary` que retorna todos os KPIs em uma única chamada com agregação no banco.

---

## 10. Fluxo de Dados Genérico (API Client)

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

## 11. Fluxo de Autorização (RBAC)

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

## 12. Fluxo de Erro

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

## 13. Fluxo de Seed (Desenvolvimento)

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
5. **Assinaturas** têm schemas Zod e modelos Prisma mas não têm endpoints implementados
6. **A baixa de estoque** não é transacional — se falhar no meio, alguns ingredientes já foram deduzidos
7. **A sugestão de compras** considera apenas pedidos CONFIRMED, não IN_PRODUCTION
8. **copyFromSlot** no backend resolve apenas referências para slots anteriores (slot < current)
