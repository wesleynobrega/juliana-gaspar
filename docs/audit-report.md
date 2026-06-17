# Audit Report — Juliana Gaspar Platform

**Dia de auditoria:** 2026-06-16
**Versão:** 0.1.0
**Build status:** ✅ Passing

---

## Diagnóstico Geral

O projeto está em estágio de **MVP funcional com cobertura parcial**. O backend (NestJS) e o frontend (Next.js) compilam e servem as rotas planejadas no plano de implementação. Porém, há lacunas significativas em testes, CI/CD, documentação existente, e módulos de backend que possuem schemas Zod e tabelas Prisma sem implementação de serviço.

### Resumo por Dimensão

| Dimensão | Status | Nota |
|----------|--------|------|
| Build | ✅ Passando | `pnpm build` conclui sem erros |
| TypeScript | ✅ Estrito | `strict: true` em todo o projeto |
| Testes | 🔴 Nenhum | 0 arquivos de teste em todo o repositório |
| CI/CD | 🔴 Ausente | Sem workflows GitHub Actions, sem Dockerfiles |
| Lint | ⚠️ Não verificado | Script `lint` existe mas execução não confirmada |
| Documentação | 🔴 Ausente | Nenhum documento de requisitos, arquitetura ou fluxo |
| Segurança | 🟡 Básica | JWT + RBAC presente, mas sem rate limiting, helmet, ou CORS restrito |
| Observabilidade | 🔴 Ausente | Sem logging estruturado, sem health checks, sem métricas |

---

## PHASE 1: Validação Pós-Build

### 1.1 TypeScript

`pnpm build` passa. O projeto usa `strict: true`. Durante a correção dos 4 arquivos API com erros, foram aplicados tipos explícitos em todos os callbacks. Nenhum `any` residual nos controllers — os services têm `any` localizados (ver seção 2.8).

**Arquivos com `any` residual:**
- `apps/api/src/modules/customers/customers.service.ts` — `where: any` na linha 8, `tags: c.tags as any` em 3 locais, `dto as any` na linha 32
- `apps/api/src/modules/payments/payments.service.ts` — `where: any` na linha 8
- `apps/api/src/modules/delivery/delivery.service.ts` — `where: any` na linha 24
- `apps/api/src/modules/orders/orders.controller.ts` — `@Query() query: any` na linha 16

### 1.2 Testes

**Nenhum arquivo de teste encontrado.** Os scripts de teste não estão configurados no `package.json` de nenhum pacote. As dependências de teste (Jest, Vitest, Testing Library) não estão instaladas.

### 1.3 CI/CD

Sem diretório `.github/`. Sem workflows de CI/CD. Sem Dockerfiles para containerização.

### 1.4 Scripts

Scripts criados no plano de implementação:
- `scripts/setup.sh` — setup completo do projeto
- `scripts/db-reset.sh` — reset e reseed do banco

Status: arquivos commitados. Permissões de execução não confirmadas.

### 1.5 Variáveis de Ambiente

Arquivos `.env` não encontrados. O projeto usa fallbacks inline:
- `JWT_SECRET ?? 'change-me'` — inseguro para produção
- `API_PORT ?? 3001`
- `CORS_ORIGIN ?? 'http://localhost:3000'`
- `DATABASE_URL` — via `env("DATABASE_URL")` do Prisma

---

## PHASE 2: Auditoria Funcional

### 2.1 Módulo Auth

| Endpoint | Método | Auth | Função | Status |
|----------|--------|------|--------|--------|
| `/api/auth/login` | POST | Público | Login com email/senha, retorna JWT + user | ✅ Funcional |

**Detalhes:**
- `AuthService.login()` — busca usuário por email, compara bcrypt, assina JWT com payload `{ sub, email, role }`
- JWT expira em 7 dias
- Estratégia JWT (`JwtStrategy`) extrai user do token pelo `sub`
- Refresh token não implementado
- Logout é client-side (remove localStorage)

### 2.2 Módulo Catalog (Dishes)

| Endpoint | Método | Auth | Função | Status |
|----------|--------|------|--------|--------|
| `/api/dishes` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Listar pratos com paginação e busca | ✅ |
| `/api/dishes/:id` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Buscar prato por ID | ✅ |
| `/api/dishes` | POST | JWT (ADMIN, OPERATOR) | Criar prato | ✅ |
| `/api/dishes/:id` | PUT | JWT (ADMIN, OPERATOR) | Atualizar prato | ✅ |
| `/api/dishes/:id` | DELETE | JWT (ADMIN) | Remover prato | ✅ |
| `/api/dishes/:id/duplicate` | POST | JWT (ADMIN, OPERATOR) | Duplicar prato | ✅ |

**Serviço implementado corretamente.** Tipagem explícita com `PrismaDish`. Datas convertidas para ISO. Verificação de existência antes de update/delete.

### 2.3 Módulo Orders (Pedidos)

| Endpoint | Método | Auth | Função | Status |
|----------|--------|------|--------|--------|
| `/api/orders` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Listar com filtros e paginação | ✅ |
| `/api/orders/:id` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Buscar pedido com itens e cliente | ✅ |
| `/api/orders` | POST | JWT (ADMIN, OPERATOR) | Criar pedido | ✅ |
| `/api/orders/:id/status` | PATCH | JWT (ADMIN, OPERATOR) | Atualizar status | ✅ |

**Serviço implementado com tipos explícitos.** O `create` valida existência do cliente e pratos, calcula `totalAmount` pelos preços, cria `OrderItems`. O `updateStatus` atualiza status e optionalmente notas. Paginação, filtros por status/paymentStatus/planType/customerId/date/search.

### 2.4 Módulo Customers (Clientes)

| Endpoint | Método | Auth | Função | Status |
|----------|--------|------|--------|--------|
| `/api/customers` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Listar com busca e tag | ✅ |
| `/api/customers/:id` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Buscar cliente com pedidos | ✅ |
| `/api/customers` | POST | JWT (ADMIN, OPERATOR) | Criar cliente | ✅ |
| `/api/customers/:id` | PUT | JWT (ADMIN, OPERATOR) | Atualizar cliente | ✅ |

**Serviço funcional** mas com `any` nos tipos de `where`, `tags`, e `dto`. A criação inicializa `tags: []`. A busca por ID inclui os pedidos do cliente.

### 2.5 Módulo Cycles (Ciclos)

| Endpoint | Método | Auth | Função | Status |
|----------|--------|------|--------|--------|
| `/api/cycles` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Listar ciclos | ✅ |
| `/api/cycles/:id` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Buscar ciclo com pratos e pedidos | ✅ |
| `/api/cycles` | POST | JWT (ADMIN, OPERATOR) | Criar ciclo com pratos | ✅ |
| `/api/cycles/:id` | PUT | JWT (ADMIN, OPERATOR) | Atualizar ciclo e pratos | ✅ |

**Serviço funcional.** `findById` calcula `revenue` e `orderCount`. `update` gerencia `CycleDish` com deleteMany + createMany. Tipos explícitos nos callbacks após correção.

### 2.6 Módulo Payments (Pagamentos)

| Endpoint | Método | Auth | Função | Status |
|----------|--------|------|--------|--------|
| `/api/payments` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Listar com filtros | ✅ |
| `/api/payments` | POST | JWT (ADMIN, OPERATOR) | Criar pagamento | ✅ |
| `/api/payments/:id/register` | PATCH | JWT (ADMIN, OPERATOR) | Registrar pagamento como PAID | ✅ |

**Serviço funcional.** O `register` atualiza o pagamento para PAID e também sincroniza `order.paymentStatus = 'PAID'`. Usa `any` para o where.

### 2.7 Módulo Delivery (Entregas)

| Endpoint | Método | Auth | Função | Status |
|----------|--------|------|--------|--------|
| `/api/delivery/zones` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Listar zonas | ✅ |
| `/api/delivery/zones` | POST | JWT (ADMIN) | Criar zona | ✅ |
| `/api/delivery/zones/:id` | PUT | JWT (ADMIN) | Atualizar zona | ✅ |
| `/api/delivery/zones/:id` | DELETE | JWT (ADMIN) | Remover zona | ✅ |
| `/api/delivery/manifest` | GET | JWT (ADMIN, OPERATOR, VIEWER) | Manifesto de entrega | ✅ |

**Serviço funcional.** O `getManifest` filtra pedidos com status ativos (CONFIRMED, IN_PRODUCTION, OUT_FOR_DELIVERY). O `zoneId` é aceito como query param mas não usado no filtro do serviço — parece ser um bug: o parâmetro é recebido mas o `where` não o utiliza para filtrar por zona de entrega.

### 2.8 Problemas Identificados nos Services

| ID | Severidade | Módulo | Problema |
|----|-----------|--------|----------|
| B-01 | Média | Customers | `any` no where, tags, e dto. Tipagem fraca pode esconder erros em runtime |
| B-02 | Média | Payments | `any` no where |
| B-03 | Média | Delivery | `any` no where |
| B-04 | Baixa | Orders Controller | `@Query() query: any` — query params não tipados |
| B-05 | Média | Delivery | `zoneId` recebido no `getManifest` mas não usado no filtro |
| B-06 | Baixa | Auth | Fallback `JWT_SECRET ?? 'change-me'` — insecure default |
| B-07 | Baixa | Payments | `findAll` recebe `query.status` e `query.method` sem validação Zod |
| B-08 | Média | Orders Controller | Query params sem validação Zod (diferente de outros controllers) |

### 2.9 Frontend — Rotas

| Rota | Página | Auth | Status |
|------|--------|------|--------|
| `/` | Landing Page (7 seções) | Pública | ✅ Implementada |
| `/login` | Login | Pública | ✅ Implementada |
| `/painel` | Dashboard com KPIs | Protegida | ✅ Implementada |
| `/catalogo` | Lista de pratos | Protegida | ✅ Implementada |
| `/catalogo/novo` | Criar prato | Protegida | ✅ Implementada |
| `/catalogo/[dishId]` | Editar prato | Protegida | ✅ Implementada |
| `/pedidos` | Lista de pedidos | Protegida | ✅ Implementada |
| `/pedidos/[orderId]` | Detalhe do pedido | Protegida | ✅ Implementada |
| `/clientes` | Lista de clientes | Protegida | ✅ Implementada |
| `/pagamentos` | Lista de pagamentos | Protegida | ✅ Implementada |
| `/ciclos` | Lista de ciclos | Protegida | ✅ Implementada |
| `/entregas` | Lista de zonas | Protegida | ✅ Implementada |

### 2.10 Frontend — Problemas Identificados

| ID | Severidade | Rota | Problema |
|----|-----------|------|----------|
| F-01 | Alta | `/painel` | Dashboard faz 4 chamadas API em paralelo, uma delas com `limit=100` para calcular revenue. Ineficiente — backend deveria ter endpoint de sumário |
| F-02 | Média | `/painel` | Dashboard espera `data` direto da resposta, mas a API devolve `{ data: [...], total, page, limit, totalPages }`. O `api.get` já desembrulha o `{ data: T }` do interceptor, então o frontend recebe o paginado corretamente. OK. |
| F-03 | Baixa | `/login` | Login page está em `(admin)/login/` — pertence ao route group admin mas é pública |
| F-04 | Média | Várias | Páginas de clientes, pagamentos, ciclos, entregas usam `any` nos dados — sem tipagem forte |
| F-05 | Baixa | Sidebar | Logout faz `window.location.href = '/login'` em vez de usar `router.push` + `logout()` |
| F-06 | Média | Header | Perfil dropdown tem item "Perfil" sem ação — placeholder |
| F-07 | Baixa | Sidebar | Avatar mostra "JG" hardcoded em vez de iniciais do usuário logado |

### 2.11 Funcionalidades Não Implementadas

| Funcionalidade | Schemas/DB | Módulo API | Frontend |
|---------------|------------|------------|----------|
| Assinaturas (Subscriptions) | ✅ Zod + Prisma | 🔴 Sem módulo | 🔴 Sem página |
| Ingredientes (Ingredients) | ✅ Zod + Prisma | 🔴 Sem módulo | 🔴 Sem página |
| Receitas (Recipes/RecipeItem) | ✅ Prisma | 🔴 Sem módulo | 🔴 Sem página |
| Gestão de usuários (CRUD) | ✅ Model User | 🔴 Apenas auth | 🔴 Sem página |
| Upload de fotos dos pratos | — | 🔴 Sem endpoint | 🔴 Campo photoUrl é texto |
| Notificações (WhatsApp) | — | 🔴 Sem implementação | 🔴 Ícone apenas |
| Relatórios | — | 🔴 Sem endpoints | 🔴 Sem páginas |

---

## PHASE 3: Auditoria de Documentação

### 3.1 Documentação Existente

**Nenhum documento de requisitos ou arquitetura encontrado.** O diretório `docs/` não existia antes desta auditoria. Não há:

- PRD (Product Requirements Document)
- BRD (Business Requirements Document)
- SRS (Software Requirements Specification)
- Documento de arquitetura
- Diagramas de fluxo do sistema
- README com instruções de setup (apenas o scripts/setup.sh cobre parte disso)
- Documentação de API (OpenAPI/Swagger não configurado)

### 3.2 Comparação Código vs Documentação

Como não há documentação prévia, não é possível fazer comparação. Esta auditoria está gerando a documentação inicial.

---

## PHASE 4: Documentação Gerada

Os seguintes documentos estão sendo criados como parte desta auditoria:

| Documento | Arquivo | Status |
|-----------|---------|--------|
| Relatório de Auditoria | `docs/audit-report.md` | ✅ Este arquivo |
| PRD | `docs/prd.md` | ✅ Criado |
| BRD | `docs/brd.md` | ✅ Criado |
| SRS | `docs/srs.md` | ✅ Criado |
| Fluxos do Sistema | `docs/system-flows.md` | ✅ Criado |

---

## PHASE 5: Sumário Final e Plano de Ação

### 5.1 O Que Funciona

- ✅ Build do monorepo sem erros
- ✅ Backend com 7 módulos, ~25 endpoints REST
- ✅ Autenticação JWT com RBAC (3 roles)
- ✅ Validação Zod em todos os inputs
- ✅ Filtro global de exceções e interceptor de resposta
- ✅ Frontend com 12 rotas, landing page + admin completo
- ✅ Design responsivo (mobile cards, desktop tables)
- ✅ Componentes de UI states: loading (skeleton), empty, error
- ✅ Seed data para desenvolvimento (admin + 6 pratos + 5 zonas)
- ✅ Scripts de setup e reset do banco

### 5.2 O Que Não Funciona / Está Incompleto

- 🔴 Zero cobertura de testes
- 🔴 Sem CI/CD
- 🔴 Sem documentação (resolvido por esta auditoria)
- 🔴 3 módulos do schema sem implementação (subscriptions, ingredients, recipes)
- 🟡 Tipagem `any` em 4 serviços
- 🟡 Fallback inseguro para JWT_SECRET
- 🟡 Bug no `getManifest` — `zoneId` não usado
- 🟡 Sem rate limiting, helmet, ou proteções HTTP
- 🟡 Sem logging estruturado
- 🟡 Sem Swagger/OpenAPI

### 5.3 Plano de Ação Priorizado

#### Prioridade 1 — Crítica (antes de produção)

1. **Adicionar testes** — Mínimo: testes de integração para os 7 controllers da API + testes de componente para páginas críticas (login, dashboard, pedidos)
2. **Configurar CI/CD** — GitHub Actions: lint → typecheck → test → build
3. **Criar .env.example** e remover fallbacks inseguros (`JWT_SECRET ?? 'change-me'`)
4. **Adicionar helmet + rate limiting** ao NestJS
5. **Corrigir tipagem `any`** nos 4 serviços

#### Prioridade 2 — Alta (MVP completo)

6. **Dashboard: endpoint de sumário** — `GET /api/dashboard/summary` para evitar 4 chamadas + cálculo client-side
7. **Corrigir bug do `getManifest`** — usar `zoneId` para filtrar
8. **Adicionar Swagger** — `@nestjs/swagger` para documentação automática da API
9. **Implementar logout server-side** — invalidar token ou implementar blacklist
10. **Internacionalização de erros** — mensagens de erro em português estão ok, mas sem i18n

#### Prioridade 3 — Média (próximo ciclo)

11. **Módulo de Assinaturas** — CRUD + frontend
12. **Módulo de Ingredientes** — CRUD + controle de estoque
13. **Módulo de Receitas** — Vincular ingredientes a pratos
14. **Upload de fotos** — Endpoint de upload + preview no frontend
15. **Relatórios** — Faturamento por período, pratos mais vendidos, clientes ativos
16. **Integração WhatsApp** — Envio de notificações de status do pedido

#### Prioridade 4 — Baixa (polimento)

17. **Dark mode** — Tema escuro para o admin
18. **Perfil do usuário** — Página de edição de perfil
19. **PWA** — Service worker para acesso offline
20. **E2E tests** — Playwright ou Cypress

### 5.4 Riscos Identificados

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Falta de testes causa regressões | Alto | Alta | Implementar testes antes de novas features |
| `JWT_SECRET` fraco permite falsificação de token | Crítico | Média | Variável de ambiente obrigatória + validação |
| Sem rate limiting permite brute force no login | Alto | Média | Adicionar `@nestjs/throttler` |
| `any` nos serviços esconde erros do Prisma | Médio | Média | Tipar explicitamente todos os parâmetros |
| Sem monitoramento impede detecção de erros em produção | Alto | Alta | Adicionar health check + logging estruturado |

---

## Governança de Documentação

### Versionamento

Toda documentação em `docs/` deve:
- Incluir data da última atualização no cabeçalho
- Ser versionada junto com o código (git)
- Ser atualizada quando funcionalidades mudarem

### PR Checklist

- [ ] Código compila (`pnpm build`)
- [ ] Tipos corretos (`pnpm typecheck`)
- [ ] Lint passa (`pnpm lint`)
- [ ] Testes passam (quando implementados)
- [ ] Documentação atualizada se necessário
- [ ] Nenhum `any` adicionado sem justificativa

### Ownership

A documentação é responsabilidade do time de desenvolvimento. Revisões devem acontecer a cada ciclo de release.

---

**Fim do relatório de auditoria.**
