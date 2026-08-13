import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database (Personal Chef + Meal Prep)...\n');

  // ── Cleanup (order matters: FK dependents first) ──
  await prisma.mealPrepSession.deleteMany();
  await prisma.pricingConfig.deleteMany();
  await prisma.planoAlimentar.deleteMany();
  await prisma.specialRequest.deleteMany();
  await prisma.technicalSheet.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.cliente.deleteMany();
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

  // ══════════════════════════════════════════════════════
  // MenuItems por Tipo Nutricional
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
    { menuItemId: proteinaAlmofegas.id, preparationMethod: '1. Misturar patinho moído com ovo, farinha de aveia, alho e ervas.\n2. Formar almôndegas uniformes.\n3. Assar a 180°C por 25 min ou grelhar na frigideira.', cookingTime: 30, temperature: '180°C', equipment: ['Forno', 'Assadeira'], notes: 'Não apertar demais ao modelar.' },
    { menuItemId: proteinaFrango.id, preparationMethod: '1. Temperar o filé com ervas, alho, limão e sal.\n2. Grelhar em frigideira com azeite por 6 min cada lado.\n3. Deixar descansar 3 min antes de fatiar.', cookingTime: 15, temperature: '200°C (frigideira)', equipment: ['Frigideira', 'Termômetro culinário'], notes: 'Ponto interno: 74°C.' },
    { menuItemId: proteinaMusculo.id, preparationMethod: '1. Selar o músculo em panela de pressão.\n2. Adicionar cebola, alho, louro e água.\n3. Cozinhar 40 min na pressão.\n4. Desfiar com garfos.', cookingTime: 50, temperature: 'Pressão média', equipment: ['Panela de pressão', 'Garfos'], notes: 'Preparar com 1 dia de antecedência.' },
    { menuItemId: proteinaMignon.id, preparationMethod: '1. Temperar o filé mignon com sal e ervas.\n2. Grelhar em frigideira quente, 4 min cada lado.\n3. Preparar molho de ervas com manteiga e ervas frescas.\n4. Servir com molho por cima.', cookingTime: 12, temperature: 'Fogo alto', equipment: ['Frigideira'], notes: 'Ponto ao ponto para manteiga.' },
    { menuItemId: proteinaTilapia.id, preparationMethod: '1. Temperar o filé de tilápia com limão, ervas e sal.\n2. Grelhar em frigideira antiaderente com azeite.\n3. Grelhar 3-4 min cada lado até dourar.', cookingTime: 10, temperature: 'Fogo médio-alto', equipment: ['Frigideira antiaderente'], notes: 'Não virar mais de uma vez.' },
    { menuItemId: proteinaMignonSuino.id, preparationMethod: '1. Temperar o filé mignon suíno com sal e ervas.\n2. Grelhar em frigideira quente, 4 min cada lado.\n3. Deixar descansar antes de fatiar.', cookingTime: 12, temperature: 'Fogo alto', equipment: ['Frigideira'], notes: 'Suíno deve estar ao ponto para cima.' },
    { menuItemId: proteinaFrangoCremoso.id, preparationMethod: '1. Cozinhar o frango em panela com alho e cebola.\n2. Adicionar creme de leite e ervas.\n3. Cozinhar até engrossar o molho.\n4. Adicionar brócolis no final.', cookingTime: 25, equipment: ['Panela'], notes: 'Não ferver após adicionar creme.' },
    { menuItemId: proteinaFraldinha.id, preparationMethod: '1. Cozinhar a fraldinha em panela de pressão com alho e cebola.\n2. Cozinhar 30 min na pressão.\n3. Desfiar com garfos e temperar.', cookingTime: 35, temperature: 'Pressão média', equipment: ['Panela de pressão', 'Garfos'], notes: 'Fraldinha fica macia e desfiada.' },

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
    { menuItemId: fibraSaladaVerde.id, preparationMethod: '1. Higienizar as folhas em água com vinagre.\n2. Secar bem.\n3. Montar com tomate-cereja e azeite na hora de servir.', cookingTime: 10, equipment: ['Centrífuga de salada'], notes: 'Montar sem molho para servir.' },
    { menuItemId: fibraBrocolisCenouraPepino.id, preparationMethod: '1. Cortar brócolis, cenoura e pepino.\n2. Cozinhar brócolis e cenoura no vapor (5-7 min).\n3. Pepino fatiado cru.\n4. Temperar tudo com azeite.', cookingTime: 10, equipment: ['Vaporizador'], notes: 'Pepino sempre cru.' },
    { menuItemId: fibraCouveFlor.id, preparationMethod: '1. Cortar couve-flor em floretes.\n2. Cozinhar no vapor por 8-10 min.\n3. Temperar com azeite e sal.', cookingTime: 12, equipment: ['Vaporizador'], notes: 'Al dente para gratinar depois se necessário.' },

    { menuItemId: gorduraErvas.id, preparationMethod: '1. Picar bem as ervas frescas.\n2. Misturar com azeite, limão, sal e pimenta.\n3. Deixar descansar 10 min para infusionar.', cookingTime: 5, equipment: ['Tigela'], notes: 'Preparar no dia para manter frescor.' },
    { menuItemId: gorduraTahine.id, preparationMethod: '1. Misturar tahine com suco de limão.\n2. Adicionar água aos poucos até emulsionar.\n3. Adicionar ervas e temperar com sal.', cookingTime: 5, equipment: ['Tigela', 'Fouet'], notes: 'Fica mais cremoso quanto mais bater.' },
    { menuItemId: gorduraAbacate.id, preparationMethod: '1. Cortar abacate ao meio, remover caroço.\n2. Cortar em cubos.\n3. Temperar com limão e sal.', cookingTime: 5, equipment: ['Faca', 'Colher'], notes: 'Preparar apenas no dia do serviço.' },
    { menuItemId: gorduraQueijo.id, preparationMethod: '1. Ralar queijo muçarela ou parmesão.\n2. Espalhar sobre o prato.\n3. Gratinar no forno por 3-5 min.', cookingTime: 5, temperature: '220°C', equipment: ['Forno', 'Ralo'], notes: 'Gratinar apenas na hora de servir.' },
  ];

  await Promise.all(
    sheets.map((s) => prisma.technicalSheet.create({ data: s })),
  );
  console.log(`  ✅ ${sheets.length} fichas técnicas criadas`);

  // ── Clientes ──
  const clientes = await Promise.all([
    prisma.cliente.create({ data: { name: 'Ana Silva', phone: '(86) 99911-2233', email: 'ana.silva@email.com', address: 'Rua das Flores, 123 - Centro', dietaryRestrictions: null, preferences: null, tags: ['VIP', 'RECORRENTE'], lgpdConsent: true, notes: 'Prefere sessões pela manhã', healthProfessionalName: 'Dra. Carla Mendes', healthProfessionalSpecialty: 'Nutricionista' } }),
    prisma.cliente.create({ data: { name: 'Carlos Oliveira', phone: '(86) 99822-3344', email: 'carlos.oli@email.com', address: 'Av. Frei Serafim, 456 - Centro', dietaryRestrictions: null, preferences: 'Low carb', tags: ['RECORRENTE'], lgpdConsent: true, notes: null } }),
    prisma.cliente.create({ data: { name: 'Maria Santos', phone: '(86) 99733-4455', email: 'maria.santos@email.com', address: 'Rua Coelho Rodrigues, 789 - Jóquei', dietaryRestrictions: 'Sem lactose', preferences: null, tags: ['RECORRENTE'], lgpdConsent: true, notes: 'Somente pratos sem lactose' } }),
    prisma.cliente.create({ data: { name: 'João Pereira', phone: '(86) 99644-5566', email: 'joao.pereira@email.com', address: 'Av. João XXIII, 101 - São Cristóvão', dietaryRestrictions: null, preferences: null, tags: ['INATIVO'], lgpdConsent: true, notes: 'Não agenda há 2 meses' } }),
    prisma.cliente.create({ data: { name: 'Beatriz Costa', phone: '(86) 99555-6677', email: 'beatriz.costa@email.com', address: 'Rua Des. Pires de Castro, 202 - Fátima', dietaryRestrictions: null, preferences: 'Comida saudável', tags: ['VIP', 'RECORRENTE'], lgpdConsent: true, notes: 'Cliente antiga e fiel' } }),
    prisma.cliente.create({ data: { name: 'Pedro Almeida', phone: '(86) 99466-7788', email: 'pedro.almeida@email.com', address: 'Av. Dom Severino, 303 - Ininga', dietaryRestrictions: null, preferences: null, tags: ['NOVO'], lgpdConsent: true, notes: 'Primeira sessão na semana passada' } }),
    prisma.cliente.create({ data: { name: 'Julia Rodrigues', phone: '(86) 99377-8899', email: 'julia.rodrigues@email.com', address: 'Rua Areolino de Abreu, 404 - São Pedro', dietaryRestrictions: 'Sem glúten', preferences: null, tags: ['VIP', 'RECORRENTE'], lgpdConsent: true, notes: 'Intolerante ao glúten' } }),
    prisma.cliente.create({ data: { name: 'Lucas Nascimento', phone: '(86) 99288-9900', email: 'lucas.nas@email.com', address: 'Av. Miguel Rosa, 505 - Monte Castelo', dietaryRestrictions: null, preferences: 'Proteína extra', tags: ['RECORRENTE'], lgpdConsent: true, notes: null } }),
  ]);
  console.log(`  ✅ ${clientes.length} clientes criados`);

  // ── Planos Alimentares ──
  const planoAna = await prisma.planoAlimentar.create({
    data: {
      clienteId: clientes[0].id,
      origem: 'PROFISSIONAL_SAUDE',
      description: 'Plano com foco em emagrecimento e ganho de massa magra, refeições fracionadas em 5 porções diárias.',
      period: '3 meses',
      healthProfessionalName: 'Dra. Carla Mendes',
      healthProfessionalSpecialty: 'Nutricionista',
      notes: 'Evitar frituras; priorizar proteínas magras.',
    },
  });
  const planoCarlos = await prisma.planoAlimentar.create({
    data: {
      clienteId: clientes[1].id,
      origem: 'EXPERIENCIA_CHEF',
      description: 'Menu low carb personalizado pelo chef, com 4 refeições por dia.',
      period: '1 mês',
      notes: 'Cliente prefere temperos suaves.',
    },
  });
  const planoMaria = await prisma.planoAlimentar.create({
    data: {
      clienteId: clientes[2].id,
      origem: 'PROFISSIONAL_SAUDE',
      description: 'Plano sem lactose, rico em fibras e proteínas vegetais complementares.',
      period: '2 meses',
      healthProfessionalName: 'Dr. Renato Lima',
      healthProfessionalSpecialty: 'Endocrinologista',
      notes: 'Substituir laticínios por opções vegetais.',
    },
  });
  console.log('  ✅ 3 planos alimentares criados');

  // ── PricingConfig (preços centralizados, não hardcoded) ──
  await prisma.pricingConfig.createMany({
    data: [
      { key: 'mealprep_casa_cliente', value: 300, description: 'Sessão de Meal Prep na casa do cliente (R$)' },
      { key: 'mealprep_cozinha_chef', value: 350, description: 'Sessão de Meal Prep na cozinha do chef (R$)' },
      { key: 'taxa_compras', value: 50, description: 'Taxa do serviço de compras/supermercado (R$)' },
    ],
  });
  console.log('  ✅ 3 configurações de preço criadas');

  // ── MealPrepSessions (exemplo) ──
  const baseCasa = 300;
  const taxaCompras = 50;
  await prisma.mealPrepSession.create({
    data: {
      clienteId: clientes[0].id,
      mealPlanId: planoAna.id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: 'CASA_CLIENTE',
      mealCount: 15,
      durationHours: 4,
      status: 'AGENDADO',
      groceryService: true,
      totalValue: baseCasa + taxaCompras,
      notes: 'Levar utensílios e embalagens próprias.',
    },
  });
  await prisma.mealPrepSession.create({
    data: {
      clienteId: clientes[1].id,
      mealPlanId: planoCarlos.id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: 'COZINHA_CHEF',
      mealCount: 12,
      durationHours: 3,
      status: 'CONCLUIDO',
      groceryService: false,
      totalValue: 350,
      notes: null,
    },
  });
  console.log('  ✅ 2 sessões de Meal Prep criadas');

  console.log('\n🎉 Seed concluído!');
  console.log('   Resumo:');
  console.log('   - 1 admin');
  console.log(`   - ${allMenuItems.length} itens do cardápio (por tipo nutricional)`);
  console.log(`   - ${sheets.length} fichas técnicas`);
  console.log(`   - ${clientes.length} clientes`);
  console.log('   - 3 planos alimentares');
  console.log('   - 3 configurações de preço');
  console.log('   - 2 sessões de Meal Prep');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
