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
  console.log('🌱 Seeding database v2.0...\n');

  // ── Cleanup (order matters: FK dependents first) ──
  await prisma.orderComponent.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.technicalSheet.deleteMany();
  await prisma.specialRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.cycleDish.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.nutritionistPlan.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.weeklyCycle.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.user.deleteMany();
  console.log('  🧹 Dados antigos removidos\n');

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

  // ── Dishes (mantidos) ──
  const [salmao, frango, bowl, espaguete, carne, omelete] = await Promise.all([
    prisma.dish.create({ data: { name: 'Salmão Grelhado com Legumes', description: 'Filé de salmão grelhado ao molho de ervas finas com mix de legumes orgânicos e arroz integral.', ingredients: 'Salmão, abobrinha, cenoura, brócolis, arroz integral, azeite, ervas finas, sal', allergens: 'Peixe', price: 42.90, available: true }}),
    prisma.dish.create({ data: { name: 'Frango à Parmegiana Fit', description: 'Peito de frango empanado com farinha de amêndoas, molho de tomate caseiro e muçarela. Acompanha purê de couve-flor.', ingredients: 'Frango, farinha de amêndoas, tomate, muçarela, couve-flor, alho, cebola, manjericão', allergens: 'Laticínios, Oleaginosas', price: 38.90, available: true }}),
    prisma.dish.create({ data: { name: 'Bowl de Quinoa Vegano', description: 'Quinoa com legumes assados, grão-de-bico crocante, abacate, sementes de abóbora e molho tahine.', ingredients: 'Quinoa, grão-de-bico, abacate, cenoura, beterraba, sementes de abóbora, tahine, limão', allergens: 'Gergelim', price: 32.90, available: true }}),
    prisma.dish.create({ data: { name: 'Espaguete de Abobrinha', description: 'Abobrinha em fitas com camarões ao molho pesto de manjericão fresco e tomate cereja confit.', ingredients: 'Abobrinha, camarão, manjericão, tomate cereja, alho, azeite, pinoli, parmesão', allergens: 'Crustáceos, Laticínios', price: 45.90, available: true }}),
    prisma.dish.create({ data: { name: 'Carne de Panela Low Carb', description: 'Músculo cozido lentamente com cebola caramelizada, legumes rústicos e farofa de coco.', ingredients: 'Músculo bovino, cebola, cenoura, vagem, coco seco, farinha de amêndoas, alho, louro', allergens: 'Oleaginosas', price: 39.90, available: true }}),
    prisma.dish.create({ data: { name: 'Omelete de Forno Especial', description: 'Omelete assada com espinafre, tomate seco e queijo de cabra. Acompanha salada verde.', ingredients: 'Ovos, espinafre, tomate seco, queijo de cabra, folhas verdes, limão, azeite', allergens: 'Ovos, Laticínios', price: 28.90, available: true }}),
  ]);
  console.log(`  ✅ ${6} pratos (Dish) criados`);

  // ══════════════════════════════════════════════════════
  // v2.0 — MenuItems por Tipo Nutricional
  // ══════════════════════════════════════════════════════

  // ── Proteínas (5) ──
  const proteinaSalmao = await prisma.menuItem.create({
    data: { name: 'Filé de Salmão Grelhado', description: 'Filé de salmão fresco grelhado no ponto, temperado com ervas finas e azeite.', nutrientType: 'PROTEINA', allergens: 'Peixe', baseUnit: '1 filé (180g)' },
  });
  const proteinaFrango = await prisma.menuItem.create({
    data: { name: 'Peito de Frango Grelhado', description: 'Peito de frango caipira grelhado, suculento, temperado com alho, limão e ervas.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 filé (200g)' },
  });
  const proteinaCarne = await prisma.menuItem.create({
    data: { name: 'Músculo Bovino Cozido', description: 'Músculo bovino cozido lentamente, desfiado e caramelizado na cebola.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 porção (180g)' },
  });
  const proteinaOmelete = await prisma.menuItem.create({
    data: { name: 'Omelete de Forno', description: 'Omelete assada com espinafre fresco, tomate seco e queijo de cabra.', nutrientType: 'PROTEINA', allergens: 'Ovos, Laticínios', baseUnit: '1 fatia (150g)' },
  });
  const proteinaCamarao = await prisma.menuItem.create({
    data: { name: 'Camarão ao Pesto', description: 'Camarões salteados ao molho pesto de manjericão fresco com tomate cereja.', nutrientType: 'PROTEINA', allergens: 'Crustáceos', baseUnit: '1 porção (120g)' },
  });

  // ── Carboidratos (4) ──
  const carboArroz = await prisma.menuItem.create({
    data: { name: 'Arroz Integral', description: 'Arroz integral cozido com alho e cebola, soltinho.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (100g)' },
  });
  const carboQuinoa = await prisma.menuItem.create({
    data: { name: 'Quinoa com Legumes', description: 'Quinoa cozida com legumes salteados: cenoura, abobrinha e pimentão.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  });
  const carboCouveFlor = await prisma.menuItem.create({
    data: { name: 'Purê de Couve-flor', description: 'Purê cremoso de couve-flor com alho e azeite. Low carb.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  });
  const carboEspagueteAbobrinha = await prisma.menuItem.create({
    data: { name: 'Espaguete de Abobrinha', description: 'Abobrinha em fitas finas, salteada no alho e azeite.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (130g)' },
  });

  // ── Fibras (4) ──
  const fibraMixLegumes = await prisma.menuItem.create({
    data: { name: 'Mix de Legumes Orgânicos', description: 'Mix de legumes orgânicos da estação, cozidos no vapor com ervas.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },
  });
  const fibraLegumesRusticos = await prisma.menuItem.create({
    data: { name: 'Legumes Rústicos', description: 'Legumes rústicos assados: cenoura, beterraba, batata doce, abobrinha.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (120g)' },
  });
  const fibraSaladaVerde = await prisma.menuItem.create({
    data: { name: 'Salada Verde', description: 'Mix de folhas verdes frescas: alface, rúcula, agrião, com molho vinagrete.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (80g)' },
  });
  const fibraGraoBico = await prisma.menuItem.create({
    data: { name: 'Grão-de-Bico Crocante', description: 'Grão-de-bico temperado e assado até ficar crocante, com especiarias.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (80g)' },
  });

  // ── Gorduras (5) ──
  const gorduraErvas = await prisma.menuItem.create({
    data: { name: 'Molho de Ervas Finas', description: 'Molho à base de azeite com mix de ervas frescas: manjericão, salsinha, cebolinha.', nutrientType: 'GORDURA', allergens: null, baseUnit: '1 porção (30ml)' },
  });
  const gorduraTahine = await prisma.menuItem.create({
    data: { name: 'Molho Tahine', description: 'Molho cremoso de tahine (gergelim) com limão e alho.', nutrientType: 'GORDURA', allergens: 'Gergelim', baseUnit: '1 porção (30ml)' },
  });
  const gorduraTomate = await prisma.menuItem.create({
    data: { name: 'Molho de Tomate Caseiro', description: 'Molho de tomate artesanal com manjericão fresco e alho.', nutrientType: 'GORDURA', allergens: null, baseUnit: '1 porção (40ml)' },
  });
  const gorduraAbacate = await prisma.menuItem.create({
    data: { name: 'Abacate', description: 'Abacate fresco cortado em cubos, temperado com limão e sal.', nutrientType: 'GORDURA', allergens: null, baseUnit: '1/2 unidade (80g)' },
  });
  const gorduraCastanhas = await prisma.menuItem.create({
    data: { name: 'Mix de Castanhas', description: 'Mix de castanhas do pará, amêndoas, nozes e sementes de abóbora.', nutrientType: 'GORDURA', allergens: 'Oleaginosas', baseUnit: '1 porção (30g)' },
  });

  const allMenuItems = [
    ...([proteinaSalmao, proteinaFrango, proteinaCarne, proteinaOmelete, proteinaCamarao] as const),
    ...([carboArroz, carboQuinoa, carboCouveFlor, carboEspagueteAbobrinha] as const),
    ...([fibraMixLegumes, fibraLegumesRusticos, fibraSaladaVerde, fibraGraoBico] as const),
    ...([gorduraErvas, gorduraTahine, gorduraTomate, gorduraAbacate, gorduraCastanhas] as const),
  ];
  console.log(`  ✅ ${allMenuItems.length} itens do cardápio criados`);

  // ── TechnicalSheets (uma para cada MenuItem) ──
  const sheets = [
    { menuItemId: proteinaSalmao.id, preparationMethod: '1. Temperar o filé com sal, pimenta e ervas finas.\n2. Aquecer frigideira com azeite em fogo médio-alto.\n3. Grelhar 4 min de cada lado até dourar.\n4. Servir imediatamente.', cookingTime: 12, temperature: '180°C (frigideira)', equipment: ['Frigideira antiaderente', 'Pinça'], notes: 'Não virar o peixe mais de uma vez.' },
    { menuItemId: proteinaFrango.id, preparationMethod: '1. Temperar o peito com alho, limão, sal e ervas.\n2. Grelhar em frigideira com azeite por 6 min cada lado.\n3. Deixar descansar 3 min antes de fatiar.', cookingTime: 15, temperature: '200°C (frigideira)', equipment: ['Frigideira', 'Termômetro culinário'], notes: 'Ponto interno: 74°C.' },
    { menuItemId: proteinaCarne.id, preparationMethod: '1. Selar a peça de músculo em panela de pressão.\n2. Adicionar cebola, alho, louro e água.\n3. Cozinhar 40 min na pressão.\n4. Desfiar com garfos e caramelizar com cebola.', cookingTime: 50, temperature: 'Pressão média', equipment: ['Panela de pressão', 'Garfos'], notes: 'Preparar com 1 dia de antecedência para melhor sabor.' },
    { menuItemId: proteinaOmelete.id, preparationMethod: '1. Bater os ovos com garfo.\n2. Adicionar espinafre picado, tomate seco e queijo.\n3. Despejar em forma untada.\n4. Assar por 20 min a 180°C.', cookingTime: 25, temperature: '180°C', equipment: ['Forno', 'Forma antiaderente'], notes: 'Retirar quando as bordas estiverem douradas.' },
    { menuItemId: proteinaCamarao.id, preparationMethod: '1. Limpar e temperar os camarões.\n2. Saltear em frigideira quente com azeite, 3 min.\n3. Adicionar molho pesto e tomate cereja.\n4. Cozinhar mais 2 min.', cookingTime: 10, temperature: 'Fogo alto', equipment: ['Frigideira'], notes: 'Não cozinhar demais — camarão fica borrachudo.' },

    { menuItemId: carboArroz.id, preparationMethod: '1. Refogar alho e cebola no azeite.\n2. Adicionar arroz integral e água (2:1).\n3. Cozinhar em fogo baixo com tampa, 35 min.\n4. Soltar com garfo.', cookingTime: 40, equipment: ['Panela com tampa'], notes: 'Lavar o arroz antes do cozimento.' },
    { menuItemId: carboQuinoa.id, preparationMethod: '1. Cozinhar quinoa em água (2:1) por 15 min.\n2. Saltear legumes picados no azeite.\n3. Misturar quinoa cozida com legumes.\n4. Ajustar sal e pimenta.', cookingTime: 20, equipment: ['Panela', 'Frigideira'], notes: 'Quinoa pronta quando os grãos liberam o anel branco.' },
    { menuItemId: carboCouveFlor.id, preparationMethod: '1. Cozinhar couve-flor no vapor até macia.\n2. Bater no processador com alho e azeite.\n3. Ajustar consistência com um pouco da água do cozimento.\n4. Temperar com sal e noz moscada.', cookingTime: 20, equipment: ['Vaporizador', 'Processador'], notes: 'Escorrer bem para não ficar aguado.' },
    { menuItemId: carboEspagueteAbobrinha.id, preparationMethod: '1. Cortar abobrinha em fitas finas (mandoline ou spiralizer).\n2. Saltear em frigideira quente com alho e azeite.\n3. Cozinhar 3-4 min até amaciar.\n4. Temperar e servir imediatamente.', cookingTime: 8, equipment: ['Spiralizer', 'Frigideira'], notes: 'Não cozinhar demais — vira papa.' },

    { menuItemId: fibraMixLegumes.id, preparationMethod: '1. Higienizar e cortar os legumes em pedaços uniformes.\n2. Cozinhar no vapor por 8-10 min.\n3. Temperar com azeite, sal e ervas frescas.', cookingTime: 15, equipment: ['Vaporizador'], notes: 'Legumes devem ficar al dente.' },
    { menuItemId: fibraLegumesRusticos.id, preparationMethod: '1. Cortar legumes em cubos grandes.\n2. Temperar com azeite, sal, pimenta e alecrim.\n3. Assar a 200°C por 25-30 min.\n4. Virar na metade do tempo.', cookingTime: 30, temperature: '200°C', equipment: ['Forno', 'Assadeira'], notes: 'Não amontoar na assadeira.' },
    { menuItemId: fibraSaladaVerde.id, preparationMethod: '1. Higienizar as folhas em água com vinagre.\n2. Secar bem (centrífuga ou toalha).\n3. Montar com molho vinagrete apenas na hora de servir.', cookingTime: 10, equipment: ['Centrífuga de salada'], notes: 'Montar no pote sem molho para entrega.' },
    { menuItemId: fibraGraoBico.id, preparationMethod: '1. Escorrer e secar bem o grão-de-bico.\n2. Temperar com azeite, páprica, cominho e sal.\n3. Assar a 200°C por 25 min, mexendo na metade.', cookingTime: 30, temperature: '200°C', equipment: ['Forno', 'Assadeira'], notes: 'Fica crocante por até 4h em pote fechado.' },

    { menuItemId: gorduraErvas.id, preparationMethod: '1. Picar bem as ervas frescas.\n2. Misturar com azeite, limão, sal e pimenta.\n3. Deixar descansar 10 min para infusionar.', cookingTime: 5, equipment: ['Tigela'], notes: 'Preparar no dia para manter frescor.' },
    { menuItemId: gorduraTahine.id, preparationMethod: '1. Misturar tahine com suco de limão.\n2. Adicionar água aos poucos até emulsionar.\n3. Temperar com alho picado e sal.', cookingTime: 5, equipment: ['Tigela', 'Fouet'], notes: 'Fica mais cremoso quanto mais bater.' },
    { menuItemId: gorduraTomate.id, preparationMethod: '1. Refogar alho e cebola no azeite.\n2. Adicionar tomates pelados e manjericão.\n3. Cozinhar em fogo baixo por 20 min.\n4. Bater no mixer para textura lisa.', cookingTime: 30, equipment: ['Panela', 'Mixer'], notes: 'Pode ser congelado em porções.' },
    { menuItemId: gorduraAbacate.id, preparationMethod: '1. Cortar abacate ao meio, remover caroço.\n2. Cortar em cubos com a casca.\n3. Retirar com colher e temperar com limão e sal.', cookingTime: 5, equipment: ['Faca', 'Colher'], notes: 'Preparar apenas no dia da entrega.' },
    { menuItemId: gorduraCastanhas.id, preparationMethod: '1. Misturar castanhas variadas e sementes.\n2. Torrar levemente em frigideira seca por 3 min.\n3. Deixar esfriar antes de embalar.', cookingTime: 5, equipment: ['Frigideira'], notes: 'Não torrar demais — amarga.' },
  ];

  await Promise.all(
    sheets.map((s) => prisma.technicalSheet.create({ data: s })),
  );
  console.log(`  ✅ ${sheets.length} fichas técnicas criadas`);

  // ── Ingredients (mantidos) ──
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

  // ── RecipeItems (mantidos) ──
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

  // ── Weekly Cycles (com maxClients) ──
  const now = new Date();
  const monday = nextMonday();
  const cycle1 = await prisma.weeklyCycle.create({
    data: {
      openDate: monday,
      closeDate: nextDay(monday, 4),
      deliveryDate: nextDay(monday, 5),
      status: 'OPEN',
      maxClients: 10,
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
      maxClients: 10,
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
      maxClients: 10,
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

  // ── Orders (com mealType v2.0) ──
  const order1 = await prisma.order.create({
    data: {
      customerId: customers[0].id,
      cycleId: cycle1.id,
      planType: 'SINGLE',
      mealType: 'ALMOCO',
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
      mealType: 'ALMOCO_JANTA',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      totalAmount: 42.90,
      deliveryAddress: customers[1].address ?? 'Av. Frei Serafim, 456 - Centro',
      deliveryDate: cycle1.deliveryDate,
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
      mealType: 'JANTA',
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
      mealType: 'ALMOCO',
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
      mealType: 'ALMOCO_JANTA',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      totalAmount: 74.80,
      deliveryAddress: customers[4].address ?? 'Rua Des. Pires de Castro, 202 - Fátima',
      deliveryDate: cycle3.deliveryDate,
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
      mealType: 'ALMOCO',
      status: 'IN_PRODUCTION',
      paymentStatus: 'PAID',
      totalAmount: 32.90,
      deliveryAddress: customers[5].address ?? 'Av. Dom Severino, 303 - Ininga',
      deliveryDate: cycle1.deliveryDate,
      items: {
        create: [{ dishId: bowl.id, quantity: 1, unitPrice: 32.90 }],
      },
    },
  });
  console.log('  ✅ 6 pedidos com itens criados');

  // ── Meals v2.0 (1-2 refeições por pedido com componentes) ──
  const [meal1, meal2, meal3, meal4, meal5, meal6, meal7] = await Promise.all([
    // order1: almoço com prato completo
    prisma.meal.create({
      data: {
        orderId: order1.id,
        notes: 'Sem cebola no molho',
        components: {
          create: [
            { menuItemId: proteinaSalmao.id, quantity: 1, unitPrice: 19.90 },
            { menuItemId: carboArroz.id, quantity: 1, unitPrice: 8.00 },
            { menuItemId: fibraMixLegumes.id, quantity: 1, unitPrice: 7.50 },
            { menuItemId: gorduraErvas.id, quantity: 1, unitPrice: 6.50 },
          ],
        },
      },
    }),
    // order2: almoço + janta
    prisma.meal.create({
      data: {
        orderId: order2.id,
        notes: 'Almoço',
        components: {
          create: [
            { menuItemId: proteinaFrango.id, quantity: 1, unitPrice: 16.90 },
            { menuItemId: carboQuinoa.id, quantity: 1, unitPrice: 9.00 },
            { menuItemId: fibraSaladaVerde.id, quantity: 1, unitPrice: 6.00 },
            { menuItemId: gorduraTomate.id, quantity: 1, unitPrice: 5.00 },
          ],
        },
      },
    }),
    prisma.meal.create({
      data: {
        orderId: order2.id,
        notes: 'Janta',
        components: {
          create: [
            { menuItemId: proteinaOmelete.id, quantity: 1, unitPrice: 14.90 },
            { menuItemId: carboCouveFlor.id, quantity: 1, unitPrice: 7.50 },
            { menuItemId: fibraLegumesRusticos.id, quantity: 1, unitPrice: 8.00 },
            { menuItemId: gorduraAbacate.id, quantity: 1, unitPrice: 6.00 },
          ],
        },
      },
    }),
    // order3: janta
    prisma.meal.create({
      data: {
        orderId: order3.id,
        notes: 'Sem lactose',
        components: {
          create: [
            { menuItemId: proteinaCarne.id, quantity: 1, unitPrice: 18.90 },
            { menuItemId: carboEspagueteAbobrinha.id, quantity: 1, unitPrice: 9.50 },
            { menuItemId: fibraGraoBico.id, quantity: 1, unitPrice: 7.00 },
            { menuItemId: gorduraErvas.id, quantity: 1, unitPrice: 6.50 },
          ],
        },
      },
    }),
    // order5: almoço + janta
    prisma.meal.create({
      data: {
        orderId: order5.id,
        notes: 'Almoço',
        components: {
          create: [
            { menuItemId: proteinaSalmao.id, quantity: 1, unitPrice: 19.90 },
            { menuItemId: carboArroz.id, quantity: 1, unitPrice: 8.00 },
            { menuItemId: fibraMixLegumes.id, quantity: 1, unitPrice: 7.50 },
            { menuItemId: gorduraCastanhas.id, quantity: 1, unitPrice: 7.00 },
          ],
        },
      },
    }),
    prisma.meal.create({
      data: {
        orderId: order5.id,
        notes: 'Janta',
        components: {
          create: [
            { menuItemId: proteinaCamarao.id, quantity: 1, unitPrice: 22.90 },
            { menuItemId: carboQuinoa.id, quantity: 1, unitPrice: 9.00 },
            { menuItemId: fibraSaladaVerde.id, quantity: 1, unitPrice: 6.00 },
            { menuItemId: gorduraTahine.id, quantity: 1, unitPrice: 5.50 },
          ],
        },
      },
    }),
    // order6: almoço
    prisma.meal.create({
      data: {
        orderId: order6.id,
        notes: null,
        components: {
          create: [
            { menuItemId: proteinaOmelete.id, quantity: 1, unitPrice: 14.90 },
            { menuItemId: carboCouveFlor.id, quantity: 1, unitPrice: 7.50 },
            { menuItemId: fibraGraoBico.id, quantity: 1, unitPrice: 7.00 },
            { menuItemId: gorduraErvas.id, quantity: 1, unitPrice: 6.50 },
          ],
        },
      },
    }),
  ]);
  console.log(`  ✅ ${7} refeições (Meals) com componentes criadas`);

  // ── Update order totals from meals ──
  for (const orderId of [order1.id, order2.id, order5.id, order6.id]) {
    const meals = await prisma.meal.findMany({
      where: { orderId },
      include: { components: true },
    });
    const total = meals.reduce(
      (sum, m) =>
        sum + m.components.reduce((cs, c) => cs + c.quantity * c.unitPrice, 0),
      0,
    );
    await prisma.order.update({ where: { id: orderId }, data: { totalAmount: total } });
  }
  console.log('  ✅ Totais dos pedidos recalculados');

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

  // ── Waitlist Entry (exemplo) ──
  await prisma.waitlistEntry.create({
    data: {
      customerId: customers[7].id,
      cycleId: cycle1.id,
      position: 1,
      status: 'WAITING',
    },
  });
  console.log('  ✅ 1 entrada na lista de espera criada');

  // ── Nutritionist Plan (exemplo) ──
  await prisma.nutritionistPlan.create({
    data: {
      customerId: customers[0].id,
      sourcePdfUrl: 'https://storage.exemplo.com/planos/ana-silva-2026.pdf',
      notes: 'Plano nutricional — montado pela nutricionista Dra. Carla',
    },
  });
  console.log('  ✅ 1 plano nutricional criado');

  console.log('\n🎉 Seed v2.0 concluído!');
  console.log('   Resumo:');
  console.log('   - 1 admin');
  console.log(`   - ${allMenuItems.length} itens do cardápio (por tipo nutricional)`);
  console.log(`   - ${sheets.length} fichas técnicas`);
  console.log('   - 6 pratos (Dish — legado)');
  console.log('   - 12 ingredientes');
  console.log(`   - ${recipeItems.length} itens de receita`);
  console.log('   - 5 zonas de entrega');
  console.log(`   - ${customers.length} clientes`);
  console.log('   - 3 ciclos semanais (com maxClients=10)');
  console.log('   - 6 pedidos (Item legado)');
  console.log('   - 7 refeições (Meal v2.0) com componentes');
  console.log(`   - ${payments.length} pagamentos`);
  console.log(`   - ${subscriptions.length} assinaturas`);
  console.log('   - 1 lista de espera');
  console.log('   - 1 plano nutricional');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
