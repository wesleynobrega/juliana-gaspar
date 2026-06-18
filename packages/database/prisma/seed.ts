import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function nextDay(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextMonday(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Admin User ──
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

  // ── Dishes ──
  const [salmao, frango, bowl, espaguete, carne, omelete] = await Promise.all([
    prisma.dish.create({ data: { name: 'Salmão Grelhado com Legumes', description: 'Filé de salmão grelhado ao molho de ervas finas com mix de legumes orgânicos e arroz integral.', ingredients: 'Salmão, abobrinha, cenoura, brócolis, arroz integral, azeite, ervas finas, sal', allergens: 'Peixe', price: 42.90, available: true }}),
    prisma.dish.create({ data: { name: 'Frango à Parmegiana Fit', description: 'Peito de frango empanado com farinha de amêndoas, molho de tomate caseiro e muçarela. Acompanha purê de couve-flor.', ingredients: 'Frango, farinha de amêndoas, tomate, muçarela, couve-flor, alho, cebola, manjericão', allergens: 'Laticínios, Oleaginosas', price: 38.90, available: true }}),
    prisma.dish.create({ data: { name: 'Bowl de Quinoa Vegano', description: 'Quinoa com legumes assados, grão-de-bico crocante, abacate, sementes de abóbora e molho tahine.', ingredients: 'Quinoa, grão-de-bico, abacate, cenoura, beterraba, sementes de abóbora, tahine, limão', allergens: 'Gergelim', price: 32.90, available: true }}),
    prisma.dish.create({ data: { name: 'Espaguete de Abobrinha', description: 'Abobrinha em fitas com camarões ao molho pesto de manjericão fresco e tomate cereja confit.', ingredients: 'Abobrinha, camarão, manjericão, tomate cereja, alho, azeite, pinoli, parmesão', allergens: 'Crustáceos, Laticínios', price: 45.90, available: true }}),
    prisma.dish.create({ data: { name: 'Carne de Panela Low Carb', description: 'Músculo cozido lentamente com cebola caramelizada, legumes rústicos e farofa de coco.', ingredients: 'Músculo bovino, cebola, cenoura, vagem, coco seco, farinha de amêndoas, alho, louro', allergens: 'Oleaginosas', price: 39.90, available: true }}),
    prisma.dish.create({ data: { name: 'Omelete de Forno Especial', description: 'Omelete assada com espinafre, tomate seco e queijo de cabra. Acompanha salada verde.', ingredients: 'Ovos, espinafre, tomate seco, queijo de cabra, folhas verdes, limão, azeite', allergens: 'Ovos, Laticínios', price: 28.90, available: true }}),
  ]);
  console.log(`  ✅ ${6} pratos criados`);

  // ── Ingredients ──
  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { name: 'Peito de Frango', unit: 'kg', stockQty: 15, minStock: 3 } }),
    prisma.ingredient.create({ data: { name: 'Salmão', unit: 'kg', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Camarão', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Quinoa', unit: 'kg', stockQty: 10, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Arroz Integral', unit: 'kg', stockQty: 20, minStock: 3 } }),
    prisma.ingredient.create({ data: { name: 'Azeite de Oliva', unit: 'L', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Farinha de Amêndoas', unit: 'kg', stockQty: 4, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Tomate', unit: 'kg', stockQty: 12, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Muçarela', unit: 'kg', stockQty: 6, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Ovo', unit: 'un', stockQty: 60, minStock: 12 } }),
    prisma.ingredient.create({ data: { name: 'Couve-flor', unit: 'un', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Abobrinha', unit: 'kg', stockQty: 10, minStock: 2 } }),
  ]);
  console.log(`  ✅ ${ingredients.length} ingredientes criados`);

  // ── RecipeItems (connect dishes to ingredients) ──
  const recipeData: Array<{ dishId: string; ingredientId: string; quantity: number }> = [
    { dishId: salmao.id, ingredientId: ingredients[1].id, quantity: 0.25 },
    { dishId: salmao.id, ingredientId: ingredients[5].id, quantity: 0.05 },
    { dishId: salmao.id, ingredientId: ingredients[4].id, quantity: 0.15 },
    { dishId: salmao.id, ingredientId: ingredients[11].id, quantity: 0.2 },
    { dishId: frango.id, ingredientId: ingredients[0].id, quantity: 0.25 },
    { dishId: frango.id, ingredientId: ingredients[6].id, quantity: 0.1 },
    { dishId: frango.id, ingredientId: ingredients[7].id, quantity: 0.2 },
    { dishId: frango.id, ingredientId: ingredients[10].id, quantity: 0.5 },
    { dishId: bowl.id, ingredientId: ingredients[3].id, quantity: 0.15 },
    { dishId: bowl.id, ingredientId: ingredients[5].id, quantity: 0.03 },
    { dishId: bowl.id, ingredientId: ingredients[7].id, quantity: 0.1 },
    { dishId: espaguete.id, ingredientId: ingredients[2].id, quantity: 0.2 },
    { dishId: espaguete.id, ingredientId: ingredients[5].id, quantity: 0.05 },
    { dishId: espaguete.id, ingredientId: ingredients[11].id, quantity: 0.3 },
    { dishId: espaguete.id, ingredientId: ingredients[7].id, quantity: 0.1 },
    { dishId: carne.id, ingredientId: ingredients[5].id, quantity: 0.03 },
    { dishId: carne.id, ingredientId: ingredients[7].id, quantity: 0.15 },
    { dishId: omelete.id, ingredientId: ingredients[9].id, quantity: 3 },
    { dishId: omelete.id, ingredientId: ingredients[8].id, quantity: 0.08 },
    { dishId: omelete.id, ingredientId: ingredients[7].id, quantity: 0.05 },
  ];
  const recipeItems = await Promise.all(
    recipeData.map((r) => prisma.recipeItem.create({ data: r })),
  );
  console.log(`  ✅ ${recipeItems.length} receitas (itens) criados`);

  // ── Delivery Zones ──
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

  // ── Customers ──
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Ana Silva', phone: '(86) 99911-2233', email: 'ana.silva@email.com', address: 'Rua das Flores, 123 - Centro', dietaryRestrictions: null, preferences: null, tags: ['VIP', 'RECORRENTE'], lgpdConsent: true, notes: 'Prefere entregas pela manhã' } }),
    prisma.customer.create({ data: { name: 'Carlos Oliveira', phone: '(86) 99822-3344', email: 'carlos.oli@email.com', address: 'Av. Frei Serafim, 456 - Centro', dietaryRestrictions: null, preferences: 'Low carb', tags: ['RECORRENTE'], lgpdConsent: true, notes: null } }),
    prisma.customer.create({ data: { name: 'Maria Santos', phone: '(86) 99733-4455', email: 'maria.santos@email.com', address: 'Rua Coelho Rodrigues, 789 - Jóquei', dietaryRestrictions: 'Sem lactose', preferences: null, tags: ['RECORRENTE'], lgpdConsent: true, notes: 'Somente pratos sem lactose' } }),
    prisma.customer.create({ data: { name: 'João Pereira', phone: '(86) 99644-5566', email: 'joao.pereira@email.com', address: 'Av. João XXIII, 101 - São Cristóvão', dietaryRestrictions: null, preferences: null, tags: ['INATIVO'], lgpdConsent: true, notes: 'Não pede há 2 meses' } }),
    prisma.customer.create({ data: { name: 'Beatriz Costa', phone: '(86) 99555-6677', email: 'beatriz.costa@email.com', address: 'Rua Des. Pires de Castro, 202 - Fátima', dietaryRestrictions: null, preferences: 'Comida saudável', tags: ['VIP', 'RECORRENTE'], lgpdConsent: true, notes: 'Pedidos acima de R$ 100' } }),
    prisma.customer.create({ data: { name: 'Pedro Almeida', phone: '(86) 99466-7788', email: 'pedro.almeida@email.com', address: 'Av. Dom Severino, 303 - Ininga', dietaryRestrictions: null, preferences: null, tags: ['NOVO'], lgpdConsent: true, notes: 'Primeiro pedido na semana passada' } }),
    prisma.customer.create({ data: { name: 'Julia Rodrigues', phone: '(86) 99377-8899', email: 'julia.rodrigues@email.com', address: 'Rua Areolino de Abreu, 404 - São Pedro', dietaryRestrictions: 'Sem glúten', preferences: null, tags: ['VIP', 'RECORRENTE'], lgpdConsent: true, notes: 'Intolerante ao glúten' } }),
    prisma.customer.create({ data: { name: 'Lucas Nascimento', phone: '(86) 99288-9900', email: 'lucas.nas@email.com', address: 'Av. Miguel Rosa, 505 - Monte Castelo', dietaryRestrictions: null, preferences: 'Proteína extra', tags: ['RECORRENTE'], lgpdConsent: true, notes: null } }),
  ]);
  console.log(`  ✅ ${customers.length} clientes criados`);

  // ── Weekly Cycles ──
  const now = new Date();
  const monday = nextMonday();
  const cycle1 = await prisma.weeklyCycle.create({
    data: {
      openDate: monday,
      closeDate: nextDay(monday, 4),
      deliveryDate: nextDay(monday, 5),
      status: 'OPEN',
      cycleDishes: {
        create: [
          { dishId: salmao.id },
          { dishId: frango.id },
          { dishId: bowl.id },
          { dishId: omelete.id },
        ],
      },
    },
  });
  const cycle2 = await prisma.weeklyCycle.create({
    data: {
      openDate: nextDay(now, -7),
      closeDate: nextDay(now, -3),
      deliveryDate: nextDay(now, -2),
      status: 'CLOSED',
      cycleDishes: {
        create: [
          { dishId: frango.id },
          { dishId: espaguete.id },
          { dishId: carne.id },
          { dishId: bowl.id },
        ],
      },
    },
  });
  const cycle3 = await prisma.weeklyCycle.create({
    data: {
      openDate: nextDay(now, -14),
      closeDate: nextDay(now, -10),
      deliveryDate: nextDay(now, -9),
      status: 'COMPLETED',
      cycleDishes: {
        create: [
          { dishId: salmao.id },
          { dishId: carne.id },
          { dishId: omelete.id },
        ],
      },
    },
  });
  console.log('  ✅ 3 ciclos semanais criados');

  // ── Orders ──
  const order1 = await prisma.order.create({
    data: {
      customerId: customers[0].id,
      cycleId: cycle1.id,
      planType: 'SINGLE',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      totalAmount: 71.80,
      deliveryAddress: customers[0].address ?? 'Rua das Flores, 123 - Centro',
      deliveryDate: cycle1.deliveryDate,
      notes: 'Tocar a campainha',
      items: {
        create: [
          { dishId: salmao.id, quantity: 1, unitPrice: 42.90 },
          { dishId: omelete.id, quantity: 1, unitPrice: 28.90 },
        ],
      },
    },
  });
  const order2 = await prisma.order.create({
    data: {
      customerId: customers[1].id,
      cycleId: cycle1.id,
      planType: 'WEEKLY',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      totalAmount: 42.90,
      deliveryAddress: customers[1].address ?? 'Av. Frei Serafim, 456 - Centro',
      deliveryDate: cycle1.deliveryDate,
      notes: null,
      items: {
        create: [{ dishId: salmao.id, quantity: 1, unitPrice: 42.90 }],
      },
    },
  });
  const order3 = await prisma.order.create({
    data: {
      customerId: customers[2].id,
      cycleId: cycle2.id,
      planType: 'SINGLE',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      totalAmount: 119.70,
      deliveryAddress: customers[2].address ?? 'Rua Coelho Rodrigues, 789 - Jóquei',
      deliveryDate: cycle2.deliveryDate,
      notes: 'Prato sem lactose, conferir restrições',
      items: {
        create: [
          { dishId: frango.id, quantity: 1, unitPrice: 38.90 },
          { dishId: espaguete.id, quantity: 1, unitPrice: 45.90 },
          { dishId: bowl.id, quantity: 1, unitPrice: 32.90 },
        ],
      },
    },
  });
  const order4 = await prisma.order.create({
    data: {
      customerId: customers[3].id,
      cycleId: cycle2.id,
      planType: 'MONTHLY',
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      totalAmount: 38.90,
      deliveryAddress: customers[3].address ?? 'Av. João XXIII, 101 - São Cristóvão',
      deliveryDate: cycle2.deliveryDate,
      notes: 'Cancelado pelo cliente',
      items: {
        create: [{ dishId: frango.id, quantity: 1, unitPrice: 38.90 }],
      },
    },
  });
  const order5 = await prisma.order.create({
    data: {
      customerId: customers[4].id,
      cycleId: cycle3.id,
      planType: 'SINGLE',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      totalAmount: 74.80,
      deliveryAddress: customers[4].address ?? 'Rua Des. Pires de Castro, 202 - Fátima',
      deliveryDate: cycle3.deliveryDate,
      notes: null,
      items: {
        create: [
          { dishId: salmao.id, quantity: 1, unitPrice: 42.90 },
          { dishId: omelete.id, quantity: 1, unitPrice: 28.90 },
        ],
      },
    },
  });
  const order6 = await prisma.order.create({
    data: {
      customerId: customers[5].id,
      cycleId: cycle1.id,
      planType: 'SINGLE',
      status: 'IN_PRODUCTION',
      paymentStatus: 'PAID',
      totalAmount: 32.90,
      deliveryAddress: customers[5].address ?? 'Av. Dom Severino, 303 - Ininga',
      deliveryDate: cycle1.deliveryDate,
      notes: null,
      items: {
        create: [{ dishId: bowl.id, quantity: 1, unitPrice: 32.90 }],
      },
    },
  });
  console.log('  ✅ 6 pedidos com itens criados');

  // ── Payments ──
  const payments = await Promise.all([
    prisma.payment.create({ data: { orderId: order1.id, method: 'PIX', status: 'PAID', amount: 71.80, paidAt: now } }),
    prisma.payment.create({ data: { orderId: order2.id, method: 'CREDIT_CARD', status: 'PENDING', amount: 42.90 } }),
    prisma.payment.create({ data: { orderId: order3.id, method: 'PIX', status: 'PAID', amount: 119.70, paidAt: nextDay(now, -3) } }),
    prisma.payment.create({ data: { orderId: order4.id, method: 'CREDIT_CARD', status: 'REFUNDED', amount: 38.90 } }),
    prisma.payment.create({ data: { orderId: order5.id, method: 'PIX', status: 'PAID', amount: 74.80, paidAt: nextDay(now, -10) } }),
    prisma.payment.create({ data: { orderId: order6.id, method: 'CREDIT_CARD', status: 'PAID', amount: 32.90, paidAt: now } }),
  ]);
  console.log(`  ✅ ${payments.length} pagamentos criados`);

  // ── Subscriptions ──
  const subscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        customerId: customers[0].id,
        planType: 'WEEKLY',
        status: 'ACTIVE',
        startDate: nextDay(now, -30),
        nextRenewal: nextDay(now, 7),
      },
    }),
    prisma.subscription.create({
      data: {
        customerId: customers[1].id,
        planType: 'MONTHLY',
        status: 'ACTIVE',
        startDate: nextDay(now, -15),
        nextRenewal: nextDay(now, 15),
      },
    }),
    prisma.subscription.create({
      data: {
        customerId: customers[4].id,
        planType: 'WEEKLY',
        status: 'PAUSED',
        startDate: nextDay(now, -45),
        nextRenewal: nextDay(now, -14),
        pausedUntil: nextDay(now, 10),
      },
    }),
  ]);
  console.log(`  ✅ ${subscriptions.length} assinaturas criadas`);

  console.log('\n🎉 Seed concluído!');
  console.log('   Resumo:');
  console.log(`   - 1 admin`);
  console.log(`   - 6 pratos`);
  console.log(`   - 12 ingredientes`);
  console.log(`   - ${recipeItems.length} itens de receita`);
  console.log(`   - 5 zonas de entrega`);
  console.log(`   - ${customers.length} clientes`);
  console.log(`   - 3 ciclos semanais`);
  console.log(`   - 6 pedidos com itens`);
  console.log(`   - ${payments.length} pagamentos`);
  console.log(`   - ${subscriptions.length} assinaturas`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
