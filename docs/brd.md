# BRD — Business Requirements Document

**Última atualização:** 2026-06-26
**Versão:** 2.1
**Negócio:** Juliana Gaspar — Comida Caseira por Assinatura

---

## 1. Sumário Executivo

Juliana Gaspar é uma chef independente que produz refeições caseiras de alta qualidade e as entrega semanalmente em São Paulo. A plataforma digital visa formalizar e escalar essa operação, substituindo processos manuais (WhatsApp, planilhas) por um sistema integrado de gestão de cardápio, pedidos, produção, estoque e entregas.

### 1.1 Objetivos de Negócio

| Objetivo | Indicador | Alvo |
|----------|-----------|------|
| Aumentar capacidade de pedidos | Pedidos/semana | 30 → 100 |
| Reduzir tempo de gestão | Horas/semana em operação | 20h → 5h |
| Aumentar receita | Faturamento mensal | +50% |
| Reduzir erros de pedido | Taxa de erro | < 1% |
| Fidelizar clientes | Taxa de retenção | > 70% |
| Otimizar compras de ingredientes | Desperdício de estoque | < 5% |

### 1.2 Stakeholders

| Stakeholder | Papel | Interesse |
|-------------|------|-----------|
| Juliana Gaspar | Chef / Admin | Gerir cardápio, pedidos, produção, finanças, estoque |
| Equipe de cozinha | Operadores | Visualizar pedidos do dia, atualizar produção, consultar fichas técnicas |
| Entregadores | Operadores | Acessar manifesto de entrega |
| Clientes | Usuários finais | Ver cardápio, fazer pedidos, salvar favoritos, acompanhar status |

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
Segunda → Definir cardápio da semana, revisar sugestão de compras
Terça   → Abrir ciclo de pedidos, comprar ingredientes
Ter-Sex → Clientes fazem pedidos
Sexta   → Fechar ciclo, conferir estoque para produção
Sábado  → Preparar refeições (consultar fichas técnicas)
Domingo → Entregar refeições, dar baixa no estoque automaticamente
Segunda → Registrar pagamentos, reembolsos, iniciar novo ciclo
```

---

## 3. Requisitos de Negócio

### 3.1 Gestão de Cardápio

**BR-CAT-01:** O sistema deve permitir cadastrar, editar, excluir e duplicar pratos.
**Rationale:** Agilidade para montar o cardápio semanal reaproveitando pratos anteriores.

**BR-CAT-02:** Cada prato deve conter: nome, descrição, ingredientes, alérgenos, preço, foto, disponibilidade, classificação por nutriente (PROTEÍNA, CARBOIDRATO, FIBRA ou GORDURA).
**Rationale:** Transparência total para o cliente e estruturação dos pratos por tipo de nutriente para montagem de refeições balanceadas.

**BR-CAT-03:** Pratos marcados como indisponíveis não devem aparecer no cardápio público nem nos seletores de montagem de pedido.
**Rationale:** Evitar vendas de itens que não podem ser produzidos.

**BR-CAT-04:** Todo prato deve ter uma ficha técnica obrigatória contendo: modo de preparo, tempo de preparo, equipamentos necessários, observações, preço de custo e lista dinâmica de ingredientes com quantidades exatas.
**Rationale:** Padronização da produção, cálculo preciso de custo e rastreabilidade de ingredientes para controle de estoque.

### 3.2 Ciclos Semanais

**BR-CIC-01:** O sistema deve permitir criar ciclos semanais com data de abertura, fechamento e entrega.
**Rationale:** A operação é organizada em ciclos semanais de produção.

**BR-CIC-02:** Cada ciclo deve ter pratos vinculados disponíveis para pedido.
**Rationale:** O cardápio muda a cada semana.

**BR-CIC-03:** O sistema deve mostrar quantos pedidos e qual receita cada ciclo gerou.
**Rationale:** Acompanhamento de desempenho para planejamento financeiro.

### 3.3 Pedidos

**BR-PED-01:** O sistema deve registrar pedidos com: cliente, refeições (slots de proteína/carboidrato/fibra/gordura), endereço de entrega, data.
**Rationale:** Rastreabilidade completa de cada pedido com estrutura nutricional clara.

**BR-PED-02:** O pedido é estruturado em refeições: cada refeição contém 1 proteína (obrigatória), 1 carboidrato (obrigatório), 1 fibra (obrigatória) e 1 gordura (opcional). O pedido pode ter 7 ou 14 refeições.
**Rationale:** Garantir equilíbrio nutricional em cada refeição entregue.

**BR-PED-03:** O status do pedido deve seguir o fluxo: PENDING → CONFIRMED → IN_PRODUCTION → OUT_FOR_DELIVERY → DELIVERED.
**Rationale:** Visibilidade para o cliente e controle operacional para a equipe.

**BR-PED-04:** Ao marcar o pedido como DELIVERED, o sistema deve automaticamente deduzir do estoque os ingredientes de todas as refeições do pedido, usando as quantidades das fichas técnicas. Se houver estoque insuficiente, o sistema deve alertar.
**Rationale:** Controle automático de estoque — sem planilhas manuais.

**BR-PED-05:** Pedidos cancelados devem ser marcados como CANCELLED e excluídos dos cálculos de receita.
**Rationale:** Não inflar métricas financeiras com pedidos não realizados.

### 3.4 Clientes

**BR-CLI-01:** O sistema deve cadastrar clientes com nome, telefone, endereço completo (rua, número, bairro, cidade, CEP), Instagram, WhatsApp e observações.
**Rationale:** Base centralizada rica para comunicação, segmentação e logística de entrega.

**BR-CLI-02:** O sistema deve permitir buscar cliente por nome ou telefone.
**Rationale:** Atendimento rápido quando o cliente entra em contato.

**BR-CLI-03:** Tags nos clientes permitem segmentação (VIP, alérgico, vegetariano, etc.).
**Rationale:** Comunicação direcionada e atenção a restrições.

**BR-CLI-04:** Clientes podem ter refeições favoritas salvas (combinação de proteína + carboidrato + fibra + gordura), acelerando a montagem de pedidos recorrentes.
**Rationale:** Reduzir fricção no pedido e aumentar retenção por personalização.

### 3.5 Pagamentos

**BR-PAG-01:** Todo pedido deve ter um status de pagamento: PENDING, PAID, OVERDUE ou REFUNDED.
**Rationale:** Controle financeiro completo incluindo reembolsos.

**BR-PAG-02:** O pagamento deve registrar método (PIX, DINHEIRO, CARTÃO), valor e dados do cliente.
**Rationale:** Conciliação financeira precisa.

**BR-PAG-03:** Ao registrar pagamento como PAID, o pedido correspondente deve ser atualizado automaticamente.
**Rationale:** Consistência entre pedido e pagamento.

**BR-PAG-04:** Pagamentos podem ser editados (método, valor, status), excluídos (com confirmação) e reembolsados (com registro de motivo e data).
**Rationale:** Flexibilidade para corrigir erros e gerenciar todo o ciclo de vida do pagamento.

### 3.6 Entregas

**BR-ENT-01:** O sistema deve gerenciar zonas de entrega com taxas específicas.
**Rationale:** Cobrança justa baseada na distância/logística.

**BR-ENT-02:** O manifesto diário deve listar todos os pedidos ativos para entrega.
**Rationale:** Roteirização e logística de entrega.

### 3.7 Estoque e Compras

**BR-EST-01:** O sistema deve cadastrar ingredientes com nome, unidade de medida, quantidade em estoque e estoque mínimo.
**Rationale:** Base para controle de inventário e planejamento de compras.

**BR-EST-02:** O sistema deve gerar sugestão de compras cruzando todos os pedidos com status CONFIRMED, as fichas técnicas dos pratos de cada refeição e o estoque atual. O resultado é uma lista de ingredientes com quantidade necessária, estoque atual e quantidade sugerida para compra.
**Rationale:** Eliminar compras de emergência e desperdício por excesso. A chef vê exatamente o que precisa comprar para honrar os pedidos da semana.

**BR-EST-03:** A sugestão de compras deve ser exportável (cópia para clipboard e impressão).
**Rationale:** Facilidade para levar a lista às compras.

### 3.8 Assinaturas (Fase 3)

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
7. Cada refeição deve conter proteína, carboidrato e fibra — gordura é opcional
8. As fichas técnicas refletem com precisão o consumo de ingredientes por prato

---

## 6. Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Sazonalidade na demanda | Alta | Médio | Cardápio temático para datas sazonais |
| Inadimplência | Média | Alto | Pagamento antecipado para novos clientes |
| Falta de ingredientes | Média | Alto | Sugestão de compras automatizada + fornecedores backup |
| Atraso nas entregas | Baixa | Crítico | Buffer de tempo na rota + comunicação proativa |
| Perda de qualidade | Baixa | Crítico | Padronização via fichas técnicas + feedback |
| Divergência ficha técnica vs consumo real | Média | Médio | Revisão periódica das quantidades por prato |
