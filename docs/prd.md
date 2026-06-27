# PRD — Product Requirements Document

**Última atualização:** 2026-06-26
**Versão:** 2.1
**Produto:** Juliana Gaspar — Plataforma de Comida por Assinatura

---

## 1. Visão do Produto

A plataforma Juliana Gaspar é um sistema de comida caseira por assinatura que conecta uma chef independente a clientes em São Paulo. Clientes exploram um cardápio semanal rotativo, fazem pedidos únicos ou assinaturas, e recebem as refeições em casa. A plataforma gerencia todo o ciclo: cardápio → pedidos → produção → estoque → entrega → pagamento.

### 1.1 Problema que Resolve

- **Para a chef:** Centraliza gestão de cardápio, pedidos, produção, entregas, estoque e pagamentos em um único sistema
- **Para o cliente:** Oferece uma experiência simples de descoberta do cardápio semanal, pedido e acompanhamento

### 1.2 Proposta de Valor

- Comida caseira de alta qualidade, entregue semanalmente
- Cardápio variado com ingredientes frescos e sazonais
- Transparência total sobre ingredientes, modo de preparo e ficha técnica
- Flexibilidade: pedidos avulsos ou planos de assinatura
- Refeições estruturadas por nutrientes (proteína, carboidrato, fibra, gordura)

---

## 2. Personas

### 2.1 Admin (Juliana Gaspar)
- Gerencia cardápio, pedidos, clientes
- Define ciclos semanais com pratos disponíveis
- Acompanha produção e entregas
- Gerencia pagamentos e finanças
- Controla estoque de ingredientes e sugestões de compra

### 2.2 Operador
- Auxilia na gestão de pedidos
- Atualiza status de produção e entrega
- Registra pagamentos
- Monitora estoque durante produção

### 2.3 Cliente
- Navega pelo cardápio da semana
- Faz pedidos únicos ou assina plano semanal
- Acompanha status do pedido
- Gerencia suas preferências alimentares e refeições favoritas

---

## 3. Funcionalidades

### 3.1 Landing Page (Público)

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| LP-01 | Hero section com chamada principal | P1 | ✅ |
| LP-02 | Seção "Como Funciona" (3 passos) | P1 | ✅ |
| LP-03 | Cardápio da semana | P1 | ✅ |
| LP-04 | Diferenciais (qualidade, ingredientes, entrega) | P1 | ✅ |
| LP-05 | Depoimentos de clientes | P1 | ✅ |
| LP-06 | FAQ | P1 | ✅ |
| LP-07 | CTA final para pedido via WhatsApp | P1 | ✅ |
| LP-08 | PWA com Service Worker e manifesto | P2 | ✅ |

### 3.2 Autenticação

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| AUTH-01 | Login com email/senha | P1 | ✅ |
| AUTH-02 | Controle de acesso por role (RBAC) | P1 | ✅ |
| AUTH-03 | Proteção de rotas admin | P1 | ✅ |
| AUTH-04 | Logout | P1 | ✅ |
| AUTH-05 | Recuperação de senha | P2 | 🔴 |
| AUTH-06 | Refresh token | P2 | 🔴 |

### 3.3 Dashboard

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| DASH-01 | KPIs: pedidos, faturamento, clientes, pratos | P1 | ✅ |
| DASH-02 | Lista de pedidos recentes | P1 | ✅ |
| DASH-03 | Gráfico de faturamento por período | P2 | 🔴 |
| DASH-04 | Endpoint de sumário dedicado | P2 | 🔴 |

### 3.4 Catálogo de Pratos (Cardápio)

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| CAT-01 | Listar pratos com busca | P1 | ✅ |
| CAT-02 | Criar novo prato | P1 | ✅ |
| CAT-03 | Editar prato existente | P1 | ✅ |
| CAT-04 | Excluir prato | P1 | ✅ |
| CAT-05 | Duplicar prato | P1 | ✅ |
| CAT-06 | Upload de foto do prato | P2 | 🔴 |
| CAT-07 | Marcar disponibilidade | P1 | ✅ |
| CAT-08 | Vincular a ciclos semanais | P2 | 🟡 |
| CAT-09 | Ficha técnica com ingredientes dinâmicos, quantidade, preço, modo de preparo, tempo, equipamentos | P1 | ✅ |

### 3.5 Gestão de Pedidos

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| PED-01 | Listar pedidos com filtros | P1 | ✅ |
| PED-02 | Filtrar por status, pagamento, plano, busca | P1 | ✅ |
| PED-03 | Criar pedido | P1 | ✅ |
| PED-04 | Detalhes do pedido (itens, cliente, valores) | P1 | ✅ |
| PED-05 | Atualizar status do pedido | P1 | ✅ |
| PED-06 | Slide-out com detalhes rápidos | P1 | ✅ |
| PED-07 | Timeline de status do pedido | P2 | 🔴 |
| PED-08 | Novo pedido por refeições (7 ou 14 slots com proteína/carboidrato/fibra/gordura, copiar de slot, repetir anterior, favoritos, reaproveitar de pedidos anteriores) | P1 | ✅ |
| PED-09 | Baixa automática de estoque ao marcar pedido como ENTREGUE | P1 | ✅ |

### 3.6 Gestão de Clientes

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| CLI-01 | Listar clientes com busca | P1 | ✅ |
| CLI-02 | Cadastrar cliente | P1 | ✅ |
| CLI-03 | Editar cliente | P1 | ✅ |
| CLI-04 | Visualizar histórico de pedidos do cliente | P1 | ✅ |
| CLI-05 | Tags nos clientes (VIP, alérgico, etc.) | P1 | ✅ |
| CLI-06 | Preferências alimentares | P1 | ✅ |
| CLI-07 | Cadastro completo: rua, número, bairro, cidade, CEP, Instagram, WhatsApp, observações | P1 | ✅ |
| CLI-08 | Refeições favoritas do cliente (montagem proteína + carbo + fibra + gordura) | P1 | ✅ |

### 3.7 Gestão de Pagamentos

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| PAG-01 | Listar pagamentos | P1 | ✅ |
| PAG-02 | Criar pagamento vinculado a pedido | P1 | ✅ |
| PAG-03 | Registrar pagamento como pago | P1 | ✅ |
| PAG-04 | Filtrar por status e método | P1 | ✅ |
| PAG-05 | Relatório de inadimplência | P2 | 🔴 |
| PAG-06 | Editar pagamento (método, valor, status) | P1 | ✅ |
| PAG-07 | Excluir pagamento com confirmação | P1 | ✅ |
| PAG-08 | Reembolso com registro de motivo e data | P1 | ✅ |

### 3.8 Ciclos Semanais

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| CIC-01 | Listar ciclos | P1 | ✅ |
| CIC-02 | Criar ciclo com pratos vinculados | P1 | ✅ |
| CIC-03 | Editar ciclo e pratos | P1 | ✅ |
| CIC-04 | Visualizar métricas (pedidos, receita) | P1 | ✅ |
| CIC-05 | Fechar ciclo automaticamente | P2 | 🔴 |

### 3.9 Entregas

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| ENT-01 | Listar zonas de entrega | P1 | ✅ |
| ENT-02 | Criar/editar/remover zona | P1 | ✅ |
| ENT-03 | Manifesto de entrega diário | P1 | ✅ |
| ENT-04 | Filtrar manifesto por zona | P2 | 🟡 |
| ENT-05 | Roteirização de entregas | P3 | 🔴 |

### 3.10 Assinaturas (Backlog)

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| ASS-01 | Criar plano de assinatura | P2 | 🔴 |
| ASS-02 | Listar assinaturas ativas | P2 | 🔴 |
| ASS-03 | Pausar/reativar assinatura | P2 | 🔴 |
| ASS-04 | Renovação automática | P2 | 🔴 |
| ASS-05 | Cobrança recorrente | P2 | 🔴 |

### 3.11 Gestão de Ingredientes e Estoque

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| ING-01 | Cadastrar ingrediente | P1 | ✅ |
| ING-02 | Controle de estoque (entrada/saída) | P1 | ✅ |
| ING-03 | Alerta de estoque baixo | P3 | 🔴 |
| ING-04 | Vincular ingredientes a pratos via ficha técnica | P1 | ✅ |
| ING-05 | Sugestão de compras: cruza pedidos CONFIRMED com fichas técnicas e estoque atual | P1 | ✅ |

### 3.12 Navegação e Layout

| ID | Funcionalidade | Prioridade | Status |
|----|---------------|------------|--------|
| NAV-01 | Navbar fixa com padding-top global que não cobre conteúdo | P1 | ✅ |
| NAV-02 | Sidebar com navegação completa (Painel, Cardápio, Pedidos, Clientes, Pagamentos, Ciclos, Entregas, Ingredientes) | P1 | ✅ |
| NAV-03 | Layout responsivo mobile-first com Sheet drawer | P1 | ✅ |

---

## 4. Requisitos Não-Funcionais

### 4.1 Performance
- LCP < 2.5s no landing page
- TTI < 3s no admin
- API responde em < 200ms (p95)

### 4.2 Segurança
- Autenticação JWT
- RBAC com 3 níveis de acesso
- Senhas com bcrypt (12 rounds)
- HTTPS obrigatório em produção

### 4.3 Responsividade
- Mobile-first (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Touch targets ≥ 44px

### 4.4 Acessibilidade
- Contraste de cores WCAG AA
- Labels em todos os inputs
- Navegação por teclado nos componentes críticos

### 4.5 Disponibilidade
- 99.5% uptime (meta inicial)
- Health check endpoint para monitoramento

---

## 5. Métricas de Sucesso

| Métrica | Alvo | Prazo |
|---------|------|-------|
| Tempo de criação de cardápio semanal | < 10 minutos | Imediato |
| Tempo de processamento de pedido | < 2 minutos | Imediato |
| Clientes ativos na plataforma | 50+ | 3 meses |
| Pedidos por semana | 30+ | 3 meses |
| Taxa de renovação de assinatura | > 70% | 6 meses |
| Tempo de sugestão de compras | < 30 segundos | Imediato |

---

## 6. Roadmap

### Fase 1 — MVP (Concluída)
- Landing page, autenticação, dashboard, catálogo, pedidos, clientes, pagamentos, ciclos, entregas
- RBAC completo
- Design responsivo

### Fase 2 — v2.1 (Concluída)
- Pedidos estruturados por refeições (7 ou 14 slots com proteína/carboidrato/fibra/gordura)
- Ficha técnica completa por prato com ingredientes, quantidades, modo de preparo e equipamentos
- Refeições favoritas por cliente
- Controle de estoque com baixa automática ao concluir entrega
- Sugestão de compras baseada em pedidos confirmados vs estoque
- Cadastro completo de clientes (endereço, redes sociais, observações)
- CRUD completo de pagamentos com edição, exclusão e reembolso
- PWA (Service Worker + manifesto)

### Fase 3 — Crescimento (3 meses)
- Assinaturas (planos recorrentes)
- Integração WhatsApp para notificações
- Upload de fotos de pratos
- Dashboard com gráficos
- Relatórios financeiros

### Fase 4 — Escala (6 meses)
- Alerta de estoque baixo
- Programa de fidelidade
- Portal do cliente (área logada para clientes)
- Integração com gateway de pagamento
