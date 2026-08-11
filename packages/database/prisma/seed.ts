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

  // ── Dishes (cardápio da Juliana) ──
  const [almofegas, frangoErvas, muscularDesfiado, mignonErvas, tilapia, mignonsuino, frangoCremoso, couveGratinada, lasanhaBerinjela] = await Promise.all([
    prisma.dish.create({ data: { name: 'Almôndegas de Patinho', description: 'Almôndegas de patinho com espaguete de abobrinha e cenoura.', ingredients: 'Patinho moído, abobrinha, cenoura, alho, cebola, ovo, farinha de aveia, ervas', allergens: 'Ovos, Glúten', price: 36.90, available: true }}),
    prisma.dish.create({ data: { name: 'Filé de Frango com Ervas', description: 'Filé de frango com ervas, purê de abóbora cabotiá e salada verde.', ingredients: 'Peito de frango, abóbora cabotiá, folhas verdes, tomate, ervas finas, azeite', allergens: null, price: 34.90, available: true }}),
    prisma.dish.create({ data: { name: 'Músculo Desfiado com Purê', description: 'Músculo desfiado com purê cremoso.', ingredients: 'Músculo bovino, batata, cenoura, alho, cebola, louro, sal', allergens: null, price: 38.90, available: true }}),
    prisma.dish.create({ data: { name: 'Filé Mignon com Ervas', description: 'Filé mignon grelhado ao molho de ervas com purê de mandioquinha. Brócolis e cenoura no vapor.', ingredients: 'Filé mignon, mandioquinha, brócolis, cenoura, ervas finas, manteiga, alho', allergens: 'Laticínios', price: 49.90, available: true }}),
    prisma.dish.create({ data: { name: 'Filé de Tilápia Grelhado', description: 'Filé de tilápia grelhado com arroz integral ou purê de batata-doce, brócolis, cenoura e vagem no vapor, salada de folhas com tomate-cereja.', ingredients: 'Tilápia, arroz integral, batata-doce, brócolis, cenoura, vagem, folhas verdes, tomate cereja', allergens: null, price: 44.90, available: true }}),
    prisma.dish.create({ data: { name: 'Filé Mignon Suíno com Purê', description: 'Filé mignon suíno com purê de couve-flor cremoso. Abobrinha e vagem salteadas.', ingredients: 'Filé mignon suíno, couve-flor, abobrinha, vagem, alho, azeite, noz moscada', allergens: null, price: 46.90, available: true }}),
    prisma.dish.create({ data: { name: 'Frango Cremoso com Brócolis', description: 'Frango cremoso com brócolis e batata assada no forno.', ingredients: 'Peito de frango, brócolis, batata, creme de leite, alho, ervas', allergens: 'Laticínios', price: 38.90, available: true }}),
    prisma.dish.create({ data: { name: 'Couve-flor Gratinada com Fraldinha', description: 'Couve-flor gratinada com fraldinha desfiada.', ingredients: 'Fraldinha bovina, couve-flor, queijo gratinado, alho, cebola', allergens: 'Laticínios', price: 42.90, available: true }}),
    prisma.dish.create({ data: { name: 'Lasanha de Berinjela', description: 'Lasanha de berinjela com carne moída e salada verde.', ingredients: 'Berinjela, carne moída, molho de tomate, muçarela, parmesão, folhas verdes', allergens: 'Laticínios', price: 40.90, available: true }}),
  ]);
  console.log(`  ✅ ${9} pratos (Dish) criados`);

  // ══════════════════════════════════════════════════════
  // v2.0 — MenuItems por Tipo Nutricional
  // ══════════════════════════════════════════════════════

  // ── Proteínas (8) ──
  const proteinaAlmofegas = await prisma.menuItem.create({
    data: { name: 'Almôndegas de Patinho', description: 'Almôndegas de patinho moído temperadas com ervas e alho.', nutrientType: 'PROTEINA', allergens: 'Ovos, Glúten', baseUnit: '1 porção (150g)' },
  });
  const proteinaFrango = await prisma.menuItem.create({
    data: { name: 'Filé de Frango com Ervas', description: 'Filé de frango grelhado temperado com ervas finas, alho e limão.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 filé (200g)' },
  });
  const proteinaMusculo = await prisma.menuItem.create({
    data: { name: 'Músculo Desfiado', description: 'Músculo bovino cozido lentamente e desfiado, temperado com cebola e alho.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 porção (180g)' },
  });
  const proteinaMignon = await prisma.menuItem.create({
    data: { name: 'Filé Mignon Grelhado', description: 'Filé mignon grelhado ao ponto, com molho de ervas finas.', nutrientType: 'PROTEINA', allergens: 'Laticínios', baseUnit: '1 filé (180g)' },
  });
  const proteinaTilapia = await prisma.menuItem.create({
    data: { name: 'Filé de Tilápia Grelhado', description: 'Filé de tilápia grelhado com tempero suave de ervas e limão.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 filé (170g)' },
  });
  const proteinaMignonSuino = await prisma.menuItem.create({
    data: { name: 'Filé Mignon Suíno', description: 'Filé mignon suíno grelhado, macio e suculento.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 filé (180g)' },
  });
  const proteinaFrangoCremoso = await prisma.menuItem.create({
    data: { name: 'Frango Cremoso', description: 'Frango cozido em molho cremoso com ervas e brócolis.', nutrientType: 'PROTEINA', allergens: 'Laticínios', baseUnit: '1 porção (200g)' },
  });
  const proteinaFraldinha = await prisma.menuItem.create({
    data: { name: 'Fraldinha Desfiada', description: 'Fraldinha bovina cozida e desfiada, temperada com alho e cebola.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 porção (160g)' },
  });

  // ── Carboidratos (7) ──
  const carboArrozIntegral = await prisma.menuItem.create({
    data: { name: 'Arroz Integral', description: 'Arroz integral soltinho, cozido com alho e cebola.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  });
  const carboPureAbobora = await prisma.menuItem.create({
    data: { name: 'Purê de Abóbora Cabotiá', description: 'Purê cremoso de abóbora cabotiá, leve e saboroso.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  });
  const carboPureMandioquinha = await prisma.menuItem.create({
    data: { name: 'Purê de Mandioquinha', description: 'Purê cremoso de mandioquinha com manteiga e noz moscada.', nutrientType: 'CARBOIDRATO', allergens: 'Laticínios', baseUnit: '1 porção (120g)' },
  });
  const carboBatataDoce = await prisma.menuItem.create({
    data: { name: 'Purê de Batata-Doce', description: 'Purê de batata-doce cremoso, naturalmente doce e nutritivo.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  });
  const carboPureCouveFlor = await prisma.menuItem.create({
    data: { name: 'Purê de Couve-flor', description: 'Purê cremoso de couve-flor com alho e azeite. Low carb.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  });
  const carboEspagueteAbobrinha = await prisma.menuItem.create({
    data: { name: 'Espaguete de Abobrinha', description: 'Abobrinha em fitas finas, salteada no alho e azeite.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (130g)' },
  });
  const carboMandioca = await prisma.menuItem.create({
    data: { name: 'Mandioca Cozida', description: 'Mandioca cozida, macia e saborosa.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  });

  // ── Fibras (6) ──
  const fibraBrocolis = await prisma.menuItem.create({
    data: { name: 'Brócolis no Vapor', description: 'Brócolis cozido no vapor, verde e crocante.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },
  });
  const fibraCenouraVagem = await prisma.menuItem.create({
    data: { name: 'Cenoura e Vagem no Vapor', description: 'Cenoura e vagem cozidas no vapor, ao ponto.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },
  });
  const fibraLegumesAssados = await prisma.menuItem.create({
    data: { name: 'Abóbora, Cenoura e Abobrinha Assadas', description: 'Mix de legumes assados no forno com azeite e ervas.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (120g)' },
  });
  const fibraSaladaVerde = await prisma.menuItem.create({
    data: { name: 'Salada de Folhas', description: 'Mix de folhas verdes frescas com tomate-cereja e azeite.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (80g)' },
  });
  const fibraBrocolisCenouraPepino = await prisma.menuItem.create({
    data: { name: 'Brócolis, Cenoura e Pepino', description: 'Brócolis, cenoura e pepino frescos, no vapor ou salteados.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },
  });
  const fibraCouveFlor = await prisma.menuItem.create({
    data: { name: 'Couve-flor no Vapor', description: 'Couve-flor cozida no vapor, macia e saborosa.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },
  });

  // ── Gorduras (4) ──
  const gorduraErvas = await prisma.menuItem.create({
    data: { name: 'Molho de Ervas Finas', description: 'Molho à base de azeite com mix de ervas frescas: manjericão, salsinha, cebolinha.', nutrientType: 'GORDURA', allergens: null, baseUnit: '1 porção (30ml)' },
  });
  const gorduraTahine = await prisma.menuItem.create({
    data: { name: 'Molho de Limão e Tahine', description: 'Molho cremoso de tahine (gergelim) com limão e ervas.', nutrientType: 'GORDURA', allergens: 'Gergelim', baseUnit: '1 porção (30ml)' },
  });
  const gorduraAbacate = await prisma.menuItem.create({
    data: { name: 'Abacate', description: 'Abacate fresco cortado em cubos, temperado com limão e sal.', nutrientType: 'GORDURA', allergens: null, baseUnit: '1/2 unidade (80g)' },
  });
  const gorduraQueijo = await prisma.menuItem.create({
    data: { name: 'Queijo Gratinado', description: 'Queijo gratinado para finalizar pratos gratinados.', nutrientType: 'GORDURA', allergens: 'Laticínios', baseUnit: '1 porção (30g)' },
  });

  const allMenuItems = [
    ...([proteinaAlmofegas, proteinaFrango, proteinaMusculo, proteinaMignon, proteinaTilapia, proteinaMignonSuino, proteinaFrangoCremoso, proteinaFraldinha] as const),
    ...([carboArrozIntegral, carboPureAbobora, carboPureMandioquinha, carboBatataDoce, carboPureCouveFlor, carboEspagueteAbobrinha, carboMandioca] as const),
    ...([fibraBrocolis, fibraCenouraVagem, fibraLegumesAssados, fibraSaladaVerde, fibraBrocolisCenouraPepino, fibraCouveFlor] as const),
    ...([gorduraErvas, gorduraTahine, gorduraAbacate, gorduraQueijo] as const),
  ];
  console.log(`  ✅ ${allMenuItems.length} itens do cardápio criados`);

  // ── TechnicalSheets (uma para cada MenuItem) ──
  const sheets = [
    { menuItemId: proteinaAlmofegas.id, preparationMethod: '1. Misturar patinho moído com ovo, farinha de aveia, alho e ervas.\n2. Formar almôndegas uniformes.\n3. Assar a 180°C por 25 min ou grelhhar na frigideira.', cookingTime: 30, temperature: '180°C', equipment: ['Forno', 'Assadeira'], notes: 'Não apertar demais ao modelar.' },
    { menuItemId: proteinaFrango.id, preparationMethod: '1. Temperar o filé com ervas, alho, limão e sal.\n2. Grelhar em frigideira com azeite por 6 min cada lado.\n3. Deixar descansar 3 min antes de fatiar.', cookingTime: 15, temperature: '200°C (frigideira)', equipment: ['Frigideira', 'Termômetro culinário'], notes: 'Ponto interno: 74°C.' },
    { menuItemId: proteinaMusculo.id, preparationMethod: '1. Selar o músculo em panela de pressão.\n2. Adicionar cebola, alho, louro e água.\n3. Cozinhar 40 min na pressão.\n4. Desfiar com garfos.', cookingTime: 50, temperature: 'Pressão média', equipment: ['Panela de pressão', 'Garfos'], notes: 'Preparar com 1 dia de antecedência.' },
    { menuItemId: proteinaMignon.id, preparationMethod: '1. Temperar o filé mignon com sal e ervas.\n2. Grelhar em frigideira quente, 4 min cada lado.\n3. Preparar molho de ervas com manteiga e ervas frescas.\n4. Servir com molho por cima.', cookingTime: 12, temperature: 'Fogo alto', equipment: ['Frigideira'], notes: 'Ponto ao ponto para manteiga.' },
    { menuItemId: proteinaTilapia.id, preparationMethod: '1. Temperar o filé de tilápia com limão, ervas e sal.\n2. Grelhar em frigideira antiaderente com azeite.\n3. Grelhar 3-4 min cada lado até dourar.', cookingTime: 10, temperature: 'Fogo médio-alto', equipment: ['Frigideira antiaderente'], notes: 'Não virar mais de uma vez.' },
    { menuItemId: proteinaMignonSuino.id, preparationMethod: '1. Temperar o filé mignon suíno com sal e ervas.\n2. Grelhar em frigideira quente, 4 min cada lado.\n3. Deixar descansar antes de fatiar.', cookingTime: 12, temperature: 'Fogo alto', equipment: ['Frigideira'], notes: 'Suíno deve estar ao ponto para cima.' },
    { menuItemId: proteinaFrangoCremoso.id, preparationMethod: '1. Cozinhar o frango em panela com alho e cebola.\n2. Adicionar creme de leite e ervas.\n3. Cozinhar até engrossar o molho.\n4. Adicionar brócolis no final.', cookingTime: 25, equipment: ['Panela'], notes: 'Não ferver após adicionar creme.' },
    { menuItemId: proteinaFraldinha.id, preparationMethod: '1. Cozinhar a fraldinha em panela de pressão com alho e cebola.\n2. Cozinhar 30 min na pressão.\n3. Desfiar com garfos e temperar.', cookingTime: 35, temperature: 'Pressão média', equipment: ['Panela de pressão', 'Garfos'], notes: 'Fraldinha fica macia e desfá.' },

    { menuItemId: carboArrozIntegral.id, preparationMethod: '1. Lavar o arroz integral.\n2. Refogar alho e cebola no azeite.\n3. Adicionar arroz e água (2:1).\n4. Cozinhar em fogo baixo com tampa, 35 min.', cookingTime: 40, equipment: ['Panela com tampa'], notes: 'Soltar com garfo ao final.' },
    { menuItemId: carboPureAbobora.id, preparationMethod: '1. Cozinhar abóbora cabotiá no vapor até macia.\n2. Amassar ou bater no processador.\n3. Temperar com sal e azeite.', cookingTime: 20, equipment: ['Vaporizador', 'Processador'], notes: 'Abóbora cabotiá fica naturalmente cremosa.' },
    { menuItemId: carboPureMandioquinha.id, preparationMethod: '1. Cozinhar mandioquinha em água fervente.\n2. Escorrer e amassar com manteiga.\n3. Adicionar noz moscada e sal.', cookingTime: 20, equipment: ['Panela', 'Amassador'], notes: 'Não bater demais — pode ficar grudento.' },
    { menuItemId: carboBatataDoce.id, preparationMethod: '1. Cozinhar batata-doce no vapor ou forno.\n2. Amassar com um pouco de manteiga.\n3. Ajustar sal.', cookingTime: 25, equipment: ['Vaporizador ou Forno'], notes: 'Batata-doce naturalmente doce.' },
    { menuItemId: carboPureCouveFlor.id, preparationMethod: '1. Cozinhar couve-flor no vapor até macia.\n2. Bater no processador com alho e azeite.\n3. Ajustar consistência.\n4. Temperar com sal e noz moscada.', cookingTime: 20, equipment: ['Vaporizador', 'Processador'], notes: 'Escorrer bem para não ficar aguado.' },
    { menuItemId: carboEspagueteAbobrinha.id, preparationMethod: '1. Cortar abobrinha em fitas finas (spiralizer).\n2. Saltear em frigideira quente com alho e azeite.\n3. Cozinhar 3-4 min até amaciar.', cookingTime: 8, equipment: ['Spiralizer', 'Frigideira'], notes: 'Não cozinhar demais.' },
    { menuItemId: carboMandioca.id, preparationMethod: '1. Descascar e cortar mandioca em pedaços.\n2. Cozinhar em água fervente com sal até macia.\n3. Escorrer e servir.', cookingTime: 20, equipment: ['Panela'], notes: 'Mandioca deve ficar macia mas não desmanchando.' },

    { menuItemId: fibraBrocolis.id, preparationMethod: '1. Higienizar o brócolis e cortar em floretes.\n2. Cozinhar no vapor por 5-6 min.\n3. Temperar com azeite e sal.', cookingTime: 8, equipment: ['Vaporizador'], notes: 'Deve ficar verde e al dente.' },
    { menuItemId: fibraCenouraVagem.id, preparationMethod: '1. Cortar cenoura em rodelas e vagem em pedaços.\n2. Cozinhar no vapor por 6-8 min.\n3. Temperar com azeite e sal.', cookingTime: 10, equipment: ['Vaporizador'], notes: 'Cenoura primeiro, vagem no final.' },
    { menuItemId: fibraLegumesAssados.id, preparationMethod: '1. Cortar abóbora, cenoura e abobrinha em cubos.\n2. Temperar com azeite, sal e ervas.\n3. Assar a 200°C por 25-30 min.', cookingTime: 30, temperature: '200°C', equipment: ['Forno', 'Assadeira'], notes: 'Não amontoar na assadeira.' },
    { menuItemId: fibraSaladaVerde.id, preparationMethod: '1. Higienizar as folhas em água com vinagre.\n2. Secar bem.\n3. Montar com tomate-cereja e azeite na hora de servir.', cookingTime: 10, equipment: ['Centrífuga de salada'], notes: 'Montar sem molho para entrega.' },
    { menuItemId: fibraBrocolisCenouraPepino.id, preparationMethod: '1. Cortar brócolis, cenoura e pepino.\n2. Cozinhar brócolis e cenoura no vapor (5-7 min).\n3. Pepino fatiado cru.\n4. Temperar tudo com azeite.', cookingTime: 10, equipment: ['Vaporizador'], notes: 'Pepino sempre cru.' },
    { menuItemId: fibraCouveFlor.id, preparationMethod: '1. Cortar couve-flor em floretes.\n2. Cozinhar no vapor por 8-10 min.\n3. Temperar com azeite e sal.', cookingTime: 12, equipment: ['Vaporizador'], notes: 'Al dente para gratinar depois se necessário.' },

    { menuItemId: gorduraErvas.id, preparationMethod: '1. Picar bem as ervas frescas.\n2. Misturar com azeite, limão, sal e pimenta.\n3. Deixar descansar 10 min para infusionar.', cookingTime: 5, equipment: ['Tigela'], notes: 'Preparar no dia para manter frescor.' },
    { menuItemId: gorduraTahine.id, preparationMethod: '1. Misturar tahine com suco de limão.\n2. Adicionar água aos poucos até emulsionar.\n3. Adicionar ervas e temperar com sal.', cookingTime: 5, equipment: ['Tigela', 'Fouet'], notes: 'Fica mais cremoso quanto mais bater.' },
    { menuItemId: gorduraAbacate.id, preparationMethod: '1. Cortar abacate ao meio, remover caroço.\n2. Cortar em cubos.\n3. Temperar com limão e sal.', cookingTime: 5, equipment: ['Faca', 'Colher'], notes: 'Preparar apenas no dia da entrega.' },
    { menuItemId: gorduraQueijo.id, preparationMethod: '1. Ralar queijo muçarela ou parmesão.\n2. Espalhar sobre o prato.\n3. Gratinar no forno por 3-5 min.', cookingTime: 5, temperature: '220°C', equipment: ['Forno', 'Ralo'], notes: 'Gratinar apenas na hora de servir.' },
  ];

  await Promise.all(
    sheets.map((s) => prisma.technicalSheet.create({ data: s })),
  );
  console.log(`  ✅ ${sheets.length} fichas técnicas criadas`);

  // ── Ingredients ──
  const ingredients = await Promise.all([
    prisma.ingredient.create({ data: { name: 'Peito de Frango', unit: 'kg', stockQty: 15, minStock: 3 } }),
    prisma.ingredient.create({ data: { name: 'Patinho Moído', unit: 'kg', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Músculo Bovino', unit: 'kg', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Filé Mignon', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Fraldinha', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Filé Mignon Suíno', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Tilápia', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Carne Moída', unit: 'kg', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Arroz Integral', unit: 'kg', stockQty: 20, minStock: 3 } }),
    prisma.ingredient.create({ data: { name: 'Azeite de Oliva', unit: 'L', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Tomate', unit: 'kg', stockQty: 12, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Muçarela', unit: 'kg', stockQty: 6, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Ovo', unit: 'un', stockQty: 60, minStock: 12 } }),
    prisma.ingredient.create({ data: { name: 'Couve-flor', unit: 'un', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Abobrinha', unit: 'kg', stockQty: 10, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Brócolis', unit: 'kg', stockQty: 10, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Cenoura', unit: 'kg', stockQty: 10, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Vagem', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Batata', unit: 'kg', stockQty: 10, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Batata-Doce', unit: 'kg', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Abóbora Cabotiá', unit: 'kg', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Mandioquinha', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Mandioca', unit: 'kg', stockQty: 8, minStock: 2 } }),
    prisma.ingredient.create({ data: { name: 'Berinjela', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Creme de Leite', unit: 'un', stockQty: 20, minStock: 5 } }),
    prisma.ingredient.create({ data: { name: 'Farinha de Aveia', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Folhas Verdes', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Pepino', unit: 'kg', stockQty: 5, minStock: 1 } }),
    prisma.ingredient.create({ data: { name: 'Parmesão', unit: 'kg', stockQty: 3, minStock: 1 } }),
  ]);
  console.log(`  ✅ ${ingredients.length} ingredientes criados`);

  // ── RecipeItems ──
  const recipeData: Array<{ dishId: string; ingredientId: string; quantity: number }> = [
    { dishId: almofegas.id, ingredientId: ingredients[1].id, quantity: 0.2 },
    { dishId: almofegas.id, ingredientId: ingredients[14].id, quantity: 0.15 },
    { dishId: almofegas.id, ingredientId: ingredients[16].id, quantity: 0.1 },
    { dishId: almofegas.id, ingredientId: ingredients[12].id, quantity: 1 },
    { dishId: almofegas.id, ingredientId: ingredients[25].id, quantity: 0.05 },
    { dishId: frangoErvas.id, ingredientId: ingredients[0].id, quantity: 0.2 },
    { dishId: frangoErvas.id, ingredientId: ingredients[20].id, quantity: 0.15 },
    { dishId: frangoErvas.id, ingredientId: ingredients[26].id, quantity: 0.1 },
    { dishId: muscularDesfiado.id, ingredientId: ingredients[2].id, quantity: 0.2 },
    { dishId: muscularDesfiado.id, ingredientId: ingredients[18].id, quantity: 0.15 },
    { dishId: mignonErvas.id, ingredientId: ingredients[3].id, quantity: 0.2 },
    { dishId: mignonErvas.id, ingredientId: ingredients[21].id, quantity: 0.15 },
    { dishId: mignonErvas.id, ingredientId: ingredients[15].id, quantity: 0.1 },
    { dishId: mignonErvas.id, ingredientId: ingredients[16].id, quantity: 0.1 },
    { dishId: tilapia.id, ingredientId: ingredients[6].id, quantity: 0.18 },
    { dishId: tilapia.id, ingredientId: ingredients[8].id, quantity: 0.12 },
    { dishId: tilapia.id, ingredientId: ingredients[15].id, quantity: 0.1 },
    { dishId: tilapia.id, ingredientId: ingredients[16].id, quantity: 0.1 },
    { dishId: tilapia.id, ingredientId: ingredients[17].id, quantity: 0.08 },
    { dishId: tilapia.id, ingredientId: ingredients[26].id, quantity: 0.08 },
    { dishId: mignonSuino.id, ingredientId: ingredients[5].id, quantity: 0.2 },
    { dishId: mignonSuino.id, ingredientId: ingredients[13].id, quantity: 0.15 },
    { dishId: mignonSuino.id, ingredientId: ingredients[14].id, quantity: 0.1 },
    { dishId: mignonSuino.id, ingredientId: ingredients[17].id, quantity: 0.08 },
    { dishId: frangoCremoso.id, ingredientId: ingredients[0].id, quantity: 0.2 },
    { dishId: frangoCremoso.id, ingredientId: ingredients[15].id, quantity: 0.1 },
    { dishId: frangoCremoso.id, ingredientId: ingredients[18].id, quantity: 0.15 },
    { dishId: frangoCremoso.id, ingredientId: ingredients[24].id, quantity: 0.1 },
    { dishId: couveGratinada.id, ingredientId: ingredients[4].id, quantity: 0.2 },
    { dishId: couveGratinada.id, ingredientId: ingredients[13].id, quantity: 0.15 },
    { dishId: couveGratinada.id, ingredientId: ingredients[11].id, quantity: 0.08 },
    { dishId: lasanhaBerinjela.id, ingredientId: ingredients[23].id, quantity: 0.2 },
    { dishId: lasanhaBerinjela.id, ingredientId: ingredients[7].id, quantity: 0.15 },
    { dishId: lasanhaBerinjela.id, ingredientId: ingredients[11].id, quantity: 0.1 },
    { dishId: lasanhaBerinjela.id, ingredientId: ingredients[28].id, quantity: 0.05 },
    { dishId: lasanhaBerinjela.id, ingredientId: ingredients[26].id, quantity: 0.08 },
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
          { dishId: almofegas.id },
          { dishId: frangoErvas.id },
          { dishId: tilapia.id },
          { dishId: frangoCremoso.id },
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
          { dishId: frangoErvas.id },
          { dishId: muscularDesfiado.id },
          { dishId: mignonErvas.id },
          { dishId: tilapia.id },
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
          { dishId: almofegas.id },
          { dishId: mignonErvas.id },
          { dishId: frangoCremoso.id },
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
      totalAmount: 75.80,
      deliveryAddress: customers[0].address ?? 'Rua das Flores, 123 - Centro',
      deliveryDate: cycle1.deliveryDate,
      notes: 'Tocar a campainha',
      items: {
        create: [
          { dishId: almofegas.id, quantity: 1, unitPrice: 36.90 },
          { dishId: frangoCremoso.id, quantity: 1, unitPrice: 38.90 },
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
      totalAmount: 36.90,
      deliveryAddress: customers[1].address ?? 'Av. Frei Serafim, 456 - Centro',
      deliveryDate: cycle1.deliveryDate,
      items: {
        create: [{ dishId: almofegas.id, quantity: 1, unitPrice: 36.90 }],
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
      totalAmount: 121.70,
      deliveryAddress: customers[2].address ?? 'Rua Coelho Rodrigues, 789 - Jóquei',
      deliveryDate: cycle2.deliveryDate,
      notes: 'Prato sem lactose, conferir restrições',
      items: {
        create: [
          { dishId: frangoErvas.id, quantity: 1, unitPrice: 34.90 },
          { dishId: muscularDesfiado.id, quantity: 1, unitPrice: 38.90 },
          { dishId: tilapia.id, quantity: 1, unitPrice: 44.90 },
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
      totalAmount: 34.90,
      deliveryAddress: customers[3].address ?? 'Av. João XXIII, 101 - São Cristóvão',
      deliveryDate: cycle2.deliveryDate,
      notes: 'Cancelado pelo cliente',
      items: {
        create: [{ dishId: frangoErvas.id, quantity: 1, unitPrice: 34.90 }],
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
      totalAmount: 75.80,
      deliveryAddress: customers[4].address ?? 'Rua Des. Pires de Castro, 202 - Fátima',
      deliveryDate: cycle3.deliveryDate,
      items: {
        create: [
          { dishId: almofegas.id, quantity: 1, unitPrice: 36.90 },
          { dishId: frangoCremoso.id, quantity: 1, unitPrice: 38.90 },
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
      totalAmount: 44.90,
      deliveryAddress: customers[5].address ?? 'Av. Dom Severino, 303 - Ininga',
      deliveryDate: cycle1.deliveryDate,
      items: {
        create: [{ dishId: tilapia.id, quantity: 1, unitPrice: 44.90 }],
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
            { menuItemId: proteinaFrango.id, quantity: 1, unitPrice: 19.90 },
            { menuItemId: carboArrozIntegral.id, quantity: 1, unitPrice: 8.00 },
            { menuItemId: fibraBrocolis.id, quantity: 1, unitPrice: 7.50 },
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
            { menuItemId: carboPureAbobora.id, quantity: 1, unitPrice: 9.00 },
            { menuItemId: fibraSaladaVerde.id, quantity: 1, unitPrice: 6.00 },
            { menuItemId: gorduraErvas.id, quantity: 1, unitPrice: 5.00 },
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
            { menuItemId: proteinaFrangoCremoso.id, quantity: 1, unitPrice: 14.90 },
            { menuItemId: carboPureCouveFlor.id, quantity: 1, unitPrice: 7.50 },
            { menuItemId: fibraLegumesAssados.id, quantity: 1, unitPrice: 8.00 },
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
            { menuItemId: proteinaMusculo.id, quantity: 1, unitPrice: 18.90 },
            { menuItemId: carboEspagueteAbobrinha.id, quantity: 1, unitPrice: 9.50 },
            { menuItemId: fibraBrocolisCenouraPepino.id, quantity: 1, unitPrice: 7.00 },
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
            { menuItemId: proteinaFrango.id, quantity: 1, unitPrice: 19.90 },
            { menuItemId: carboArrozIntegral.id, quantity: 1, unitPrice: 8.00 },
            { menuItemId: fibraBrocolis.id, quantity: 1, unitPrice: 7.50 },
            { menuItemId: gorduraQueijo.id, quantity: 1, unitPrice: 7.00 },
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
            { menuItemId: proteinaTilapia.id, quantity: 1, unitPrice: 22.90 },
            { menuItemId: carboPureAbobora.id, quantity: 1, unitPrice: 9.00 },
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
            { menuItemId: proteinaFrangoCremoso.id, quantity: 1, unitPrice: 14.90 },
            { menuItemId: carboPureCouveFlor.id, quantity: 1, unitPrice: 7.50 },
            { menuItemId: fibraBrocolisCenouraPepino.id, quantity: 1, unitPrice: 7.00 },
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
    prisma.payment.create({ data: { orderId: order1.id, method: 'PIX', status: 'PAID', amount: 75.80, paidAt: now } }),
    prisma.payment.create({ data: { orderId: order2.id, method: 'CREDIT_CARD', status: 'PENDING', amount: 36.90 } }),
    prisma.payment.create({ data: { orderId: order3.id, method: 'PIX', status: 'PAID', amount: 121.70, paidAt: nextDay(now, -3) } }),
    prisma.payment.create({ data: { orderId: order4.id, method: 'CREDIT_CARD', status: 'REFUNDED', amount: 34.90 } }),
    prisma.payment.create({ data: { orderId: order5.id, method: 'PIX', status: 'PAID', amount: 75.80, paidAt: nextDay(now, -10) } }),
    prisma.payment.create({ data: { orderId: order6.id, method: 'CREDIT_CARD', status: 'PAID', amount: 44.90, paidAt: now } }),
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
  console.log('   - 9 pratos (Dish)');
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
