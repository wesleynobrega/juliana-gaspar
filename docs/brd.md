# BRD — Business Requirements Document

**Última atualização:** 2026-06-16
**Versão:** 1.0
**Negócio:** Juliana Gaspar — Comida Caseira por Assinatura

---

## 1. Sumário Executivo

Juliana Gaspar é uma chef independente que produz refeições caseiras de alta qualidade e as entrega semanalmente em São Paulo. A plataforma digital visa formalizar e escalar essa operação, substituindo processos manuais (WhatsApp, planilhas) por um sistema integrado de gestão de cardápio, pedidos, produção e entregas.

### 1.1 Objetivos de Negócio

| Objetivo | Indicador | Alvo |
|----------|-----------|------|
| Aumentar capacidade de pedidos | Pedidos/semana | 30 → 100 |
| Reduzir tempo de gestão | Horas/semana em operação | 20h → 5h |
| Aumentar receita | Faturamento mensal | +50% |
| Reduzir erros de pedido | Taxa de erro | < 1% |
| Fidelizar clientes | Taxa de retenção | > 70% |

### 1.2 Stakeholders

| Stakeholder | Papel | Interesse |
|-------------|------|-----------|
| Juliana Gaspar | Chef / Admin | Gerir cardápio, pedidos, produção, finanças |
| Equipe de cozinha | Operadores | Visualizar pedidos do dia, atualizar produção |
| Entregadores | Operadores | Acessar manifesto de entrega |
| Clientes | Usuários finais | Ver cardápio, fazer pedidos, acompanhar status |

---

## 2. Modelo de Negócio

### 2.1 Receita

| Fonte | Descrição | Ticket Médio |
|-------|-----------|-------------|
| Pedido avulso (SINGLE) | Um ciclo semanal de refeições | R$ 150-250 |
| Assinatura semanal (WEEKLY) | Renovação automática semanal | R$ 600-1000/mês |
| Assinatura mensal (MONTHLY) | 4 semanas com desconto | R$ 540-900/mês |
| Taxa de entrega | Por zona de entrega | R$ 0-8 |

### 2.2 Estrutura de Custos

| Categoria | % da Receita |
|-----------|-------------|
| Ingredientes | 35-40% |
| Embalagens | 5-8% |
| Entregadores | 10-15% |
| Plataforma (hospedagem) | 2-3% |
| Margem bruta | 34-48% |

### 2.3 Fluxo de Negócio (Semanal)

```
Segunda → Definir cardápio da semana
Terça   → Abrir ciclo de pedidos
Ter-Sex → Clientes fazem pedidos
Sexta   → Fechar ciclo, comprar ingredientes
Sábado  → Preparar refeições
Domingo → Entregar refeições
Segunda → Registrar pagamentos, iniciar novo ciclo
```

---

## 3. Requisitos de Negócio

### 3.1 Gestão de Cardápio

**BR-CAT-01:** O sistema deve permitir cadastrar, editar, excluir e duplicar pratos.
**Rationale:** Agilidade para montar o cardápio semanal reaproveitando pratos anteriores.

**BR-CAT-02:** Cada prato deve conter: nome, descrição, ingredientes, alérgenos, preço, foto, disponibilidade.
**Rationale:** Transparência total para o cliente sobre o que está comprando.

**BR-CAT-03:** Pratos marcados como indisponíveis não devem aparecer no cardápio público.
**Rationale:** Evitar vendas de itens que não podem ser produzidos.

### 3.2 Ciclos Semanais

**BR-CIC-01:** O sistema deve permitir criar ciclos semanais com data de abertura, fechamento e entrega.
**Rationale:** A operação é organizada em ciclos semanais de produção.

**BR-CIC-02:** Cada ciclo deve ter pratos vinculados disponíveis para pedido.
**Rationale:** O cardápio muda a cada semana.

**BR-CIC-03:** O sistema deve mostrar quantos pedidos e qual receita cada ciclo gerou.
**Rationale:** Acompanhamento de desempenho para planejamento financeiro.

### 3.3 Pedidos

**BR-PED-01:** O sistema deve registrar pedidos com: cliente, pratos (quantidade), endereço de entrega, data.
**Rationale:** Rastreabilidade completa de cada pedido.

**BR-PED-02:** O status do pedido deve seguir o fluxo: PENDING → CONFIRMED → IN_PRODUCTION → OUT_FOR_DELIVERY → DELIVERED.
**Rationale:** Visibilidade para o cliente e controle operacional para a equipe.

**BR-PED-03:** Pedidos cancelados devem ser marcados como CANCELLED e excluídos dos cálculos de receita.
**Rationale:** Não inflar métricas financeiras com pedidos não realizados.

### 3.4 Clientes

**BR-CLI-01:** O sistema deve cadastrar clientes com nome, telefone, endereço, restrições alimentares.
**Rationale:** Base centralizada de clientes para comunicação e personalização.

**BR-CLI-02:** O sistema deve permitir buscar cliente por nome ou telefone.
**Rationale:** Atendimento rápido quando o cliente entra em contato.

**BR-CLI-03:** Tags nos clientes permitem segmentação (VIP, alérgico, vegetariano, etc.).
**Rationale:** Comunicação direcionada e atenção a restrições.

### 3.5 Pagamentos

**BR-PAG-01:** Todo pedido deve ter um status de pagamento: PENDING ou PAID.
**Rationale:** Controle financeiro e cobrança de inadimplentes.

**BR-PAG-02:** O pagamento deve registrar método (PIX, DINHEIRO, CARTÃO) e valor.
**Rationale:** Conciliação financeira.

**BR-PAG-03:** Ao registrar pagamento, o pedido correspondente deve ser atualizado automaticamente.
**Rationale:** Consistência entre pedido e pagamento.

### 3.6 Entregas

**BR-ENT-01:** O sistema deve gerenciar zonas de entrega com taxas específicas.
**Rationale:** Cobrança justa baseada na distância/logística.

**BR-ENT-02:** O manifesto diário deve listar todos os pedidos ativos para entrega.
**Rationale:** Roteirização e logística de entrega.

### 3.7 Assinaturas (Fase 2)

**BR-ASS-01:** O sistema deve suportar planos de assinatura semanal e mensal.
**Rationale:** Receita recorrente e previsibilidade financeira.

**BR-ASS-02:** Clientes devem poder pausar ou cancelar assinatura.
**Rationale:** Flexibilidade e redução de churn involuntário.

---

## 4. Restrições de Negócio

| Restrição | Descrição |
|-----------|-----------|
| Idioma | Todo o sistema em português brasileiro |
| Prazo | MVP em produção em 8 semanas |
| Orçamento | Infraestrutura < R$ 200/mês |
| Equipe | Chef + 1-2 auxiliares de cozinha |
| Geografia | Atendimento inicial: São Paulo capital |
| Pagamento | Inicialmente métodos manuais (PIX, dinheiro); gateway no futuro |

---

## 5. Premissas

1. Clientes acessam principalmente por smartphone
2. Maioria dos pedidos concentra-se entre terça e quinta-feira
3. Volume inicial de ~20-30 pedidos por semana
4. Cardápio de 4-6 pratos por semana
5. Entregas concentradas no domingo
6. Clientes preferem WhatsApp para comunicação

---

## 6. Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Sazonalidade na demanda | Alta | Médio | Cardápio temático para datas sazonais |
| Inadimplência | Média | Alto | Pagamento antecipado para novos clientes |
| Falta de ingredientes | Média | Alto | Estoque mínimo + fornecedores backup |
| Atraso nas entregas | Baixa | Crítico | Buffer de tempo na rota + comunicação proativa |
| Perda de qualidade | Baixa | Crítico | Padronização de receitas + feedback |
