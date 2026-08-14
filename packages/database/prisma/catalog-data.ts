import type { PrismaClient, NutrientType } from '@prisma/client';

// ── Dados do catálogo (menu + fichas técnicas) ─────────────────────────
// Fonte única de verdade. Usado por seed.ts (dev) e seed-catalogo.ts (produção).

export type CatalogMenuItem = {
  name: string;
  description: string;
  nutrientType: NutrientType;
  allergens: string | null;
  baseUnit: string;
};

export type CatalogTechnicalSheet = {
  menuItemName: string;
  preparationMethod: string;
  cookingTime: number;
  temperature?: string | null;
  equipment: string[];
  notes?: string | null;
};

export const MENU_ITEMS: CatalogMenuItem[] = [
  // ── Proteínas (8) ──
  { name: 'Almôndegas de Patinho', description: 'Almôndegas de patinho moído temperadas com ervas e alho.', nutrientType: 'PROTEINA', allergens: 'Ovos, Glúten', baseUnit: '1 porção (150g)' },
  { name: 'Filé de Frango com Ervas', description: 'Filé de frango grelhado temperado com ervas finas, alho e limão.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 filé (200g)' },
  { name: 'Músculo Desfiado', description: 'Músculo bovino cozido lentamente e desfiado, temperado com cebola e alho.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 porção (180g)' },
  { name: 'Filé Mignon Grelhado', description: 'Filé mignon grelhado ao ponto, com molho de ervas finas.', nutrientType: 'PROTEINA', allergens: 'Laticínios', baseUnit: '1 filé (180g)' },
  { name: 'Filé de Tilápia Grelhado', description: 'Filé de tilápia grelhado com tempero suave de ervas e limão.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 filé (170g)' },
  { name: 'Filé Mignon Suíno', description: 'Filé mignon suíno grelhado, macio e suculento.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 filé (180g)' },
  { name: 'Frango Cremoso', description: 'Frango cozido em molho cremoso com ervas e brócolis.', nutrientType: 'PROTEINA', allergens: 'Laticínios', baseUnit: '1 porção (200g)' },
  { name: 'Fraldinha Desfiada', description: 'Fraldinha bovina cozida e desfiada, temperada com alho e cebola.', nutrientType: 'PROTEINA', allergens: null, baseUnit: '1 porção (160g)' },

  // ── Carboidratos (7) ──
  { name: 'Arroz Integral', description: 'Arroz integral soltinho, cozido com alho e cebola.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  { name: 'Purê de Abóbora Cabotiá', description: 'Purê cremoso de abóbora cabotiá, leve e saboroso.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  { name: 'Purê de Mandioquinha', description: 'Purê cremoso de mandioquinha com manteiga e noz moscada.', nutrientType: 'CARBOIDRATO', allergens: 'Laticínios', baseUnit: '1 porção (120g)' },
  { name: 'Purê de Batata-Doce', description: 'Purê de batata-doce cremoso, naturalmente doce e nutritivo.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  { name: 'Purê de Couve-flor', description: 'Purê cremoso de couve-flor com alho e azeite. Low carb.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },
  { name: 'Espaguete de Abobrinha', description: 'Abobrinha em fitas finas, salteada no alho e azeite.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (130g)' },
  { name: 'Mandioca Cozida', description: 'Mandioca cozida, macia e saborosa.', nutrientType: 'CARBOIDRATO', allergens: null, baseUnit: '1 porção (120g)' },

  // ── Fibras (6) ──
  { name: 'Brócolis no Vapor', description: 'Brócolis cozido no vapor, verde e crocante.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },
  { name: 'Cenoura e Vagem no Vapor', description: 'Cenoura e vagem cozidas no vapor, ao ponto.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },
  { name: 'Abóbora, Cenoura e Abobrinha Assadas', description: 'Mix de legumes assados no forno com azeite e ervas.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (120g)' },
  { name: 'Salada de Folhas', description: 'Mix de folhas verdes frescas com tomate-cereja e azeite.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (80g)' },
  { name: 'Brócolis, Cenoura e Pepino', description: 'Brócolis, cenoura e pepino frescos, no vapor ou salteados.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },
  { name: 'Couve-flor no Vapor', description: 'Couve-flor cozida no vapor, macia e saborosa.', nutrientType: 'FIBRA', allergens: null, baseUnit: '1 porção (100g)' },

  // ── Gorduras (4) ──
  { name: 'Molho de Ervas Finas', description: 'Molho à base de azeite com mix de ervas frescas: manjericão, salsinha, cebolinha.', nutrientType: 'GORDURA', allergens: null, baseUnit: '1 porção (30ml)' },
  { name: 'Molho de Limão e Tahine', description: 'Molho cremoso de tahine (gergelim) com limão e ervas.', nutrientType: 'GORDURA', allergens: 'Gergelim', baseUnit: '1 porção (30ml)' },
  { name: 'Abacate', description: 'Abacate fresco cortado em cubos, temperado com limão e sal.', nutrientType: 'GORDURA', allergens: null, baseUnit: '1/2 unidade (80g)' },
  { name: 'Queijo Gratinado', description: 'Queijo gratinado para finalizar pratos gratinados.', nutrientType: 'GORDURA', allergens: 'Laticínios', baseUnit: '1 porção (30g)' },
];

export const TECHNICAL_SHEETS: CatalogTechnicalSheet[] = [
  // ── Proteínas ──
  { menuItemName: 'Almôndegas de Patinho', preparationMethod: '1. Misturar patinho moído com ovo, farinha de aveia, alho e ervas.\n2. Formar almôndegas uniformes.\n3. Assar a 180°C por 25 min ou grelhar na frigideira.', cookingTime: 30, temperature: '180°C', equipment: ['Forno', 'Assadeira'], notes: 'Não apertar demais ao modelar.' },
  { menuItemName: 'Filé de Frango com Ervas', preparationMethod: '1. Temperar o filé com ervas, alho, limão e sal.\n2. Grelhar em frigideira com azeite por 6 min cada lado.\n3. Deixar descansar 3 min antes de fatiar.', cookingTime: 15, temperature: '200°C (frigideira)', equipment: ['Frigideira', 'Termômetro culinário'], notes: 'Ponto interno: 74°C.' },
  { menuItemName: 'Músculo Desfiado', preparationMethod: '1. Selar o músculo em panela de pressão.\n2. Adicionar cebola, alho, louro e água.\n3. Cozinhar 40 min na pressão.\n4. Desfiar com garfos.', cookingTime: 50, temperature: 'Pressão média', equipment: ['Panela de pressão', 'Garfos'], notes: 'Preparar com 1 dia de antecedência.' },
  { menuItemName: 'Filé Mignon Grelhado', preparationMethod: '1. Temperar o filé mignon com sal e ervas.\n2. Grelhar em frigideira quente, 4 min cada lado.\n3. Preparar molho de ervas com manteiga e ervas frescas.\n4. Servir com molho por cima.', cookingTime: 12, temperature: 'Fogo alto', equipment: ['Frigideira'], notes: 'Ponto ao ponto para manteiga.' },
  { menuItemName: 'Filé de Tilápia Grelhado', preparationMethod: '1. Temperar o filé de tilápia com limão, ervas e sal.\n2. Grelhar em frigideira antiaderente com azeite.\n3. Grelhar 3-4 min cada lado até dourar.', cookingTime: 10, temperature: 'Fogo médio-alto', equipment: ['Frigideira antiaderente'], notes: 'Não virar mais de uma vez.' },
  { menuItemName: 'Filé Mignon Suíno', preparationMethod: '1. Temperar o filé mignon suíno com sal e ervas.\n2. Grelhar em frigideira quente, 4 min cada lado.\n3. Deixar descansar antes de fatiar.', cookingTime: 12, temperature: 'Fogo alto', equipment: ['Frigideira'], notes: 'Suíno deve estar ao ponto para cima.' },
  { menuItemName: 'Frango Cremoso', preparationMethod: '1. Cozinhar o frango em panela com alho e cebola.\n2. Adicionar creme de leite e ervas.\n3. Cozinhar até engrossar o molho.\n4. Adicionar brócolis no final.', cookingTime: 25, equipment: ['Panela'], notes: 'Não ferver após adicionar creme.' },
  { menuItemName: 'Fraldinha Desfiada', preparationMethod: '1. Cozinhar a fraldinha em panela de pressão com alho e cebola.\n2. Cozinhar 30 min na pressão.\n3. Desfiar com garfos e temperar.', cookingTime: 35, temperature: 'Pressão média', equipment: ['Panela de pressão', 'Garfos'], notes: 'Fraldinha fica macia e desfiada.' },

  // ── Carboidratos ──
  { menuItemName: 'Arroz Integral', preparationMethod: '1. Lavar o arroz integral.\n2. Refogar alho e cebola no azeite.\n3. Adicionar arroz e água (2:1).\n4. Cozinhar em fogo baixo com tampa, 35 min.', cookingTime: 40, equipment: ['Panela com tampa'], notes: 'Soltar com garfo ao final.' },
  { menuItemName: 'Purê de Abóbora Cabotiá', preparationMethod: '1. Cozinhar abóbora cabotiá no vapor até macia.\n2. Amassar ou bater no processador.\n3. Temperar com sal e azeite.', cookingTime: 20, equipment: ['Vaporizador', 'Processador'], notes: 'Abóbora cabotiá fica naturalmente cremosa.' },
  { menuItemName: 'Purê de Mandioquinha', preparationMethod: '1. Cozinhar mandioquinha em água fervente.\n2. Escorrer e amassar com manteiga.\n3. Adicionar noz moscada e sal.', cookingTime: 20, equipment: ['Panela', 'Amassador'], notes: 'Não bater demais — pode ficar grudento.' },
  { menuItemName: 'Purê de Batata-Doce', preparationMethod: '1. Cozinhar batata-doce no vapor ou forno.\n2. Amassar com um pouco de manteiga.\n3. Ajustar sal.', cookingTime: 25, equipment: ['Vaporizador ou Forno'], notes: 'Batata-doce naturalmente doce.' },
  { menuItemName: 'Purê de Couve-flor', preparationMethod: '1. Cozinhar couve-flor no vapor até macia.\n2. Bater no processador com alho e azeite.\n3. Ajustar consistência.\n4. Temperar com sal e noz moscada.', cookingTime: 20, equipment: ['Vaporizador', 'Processador'], notes: 'Escorrer bem para não ficar aguado.' },
  { menuItemName: 'Espaguete de Abobrinha', preparationMethod: '1. Cortar abobrinha em fitas finas (spiralizer).\n2. Saltear em frigideira quente com alho e azeite.\n3. Cozinhar 3-4 min até amaciar.', cookingTime: 8, equipment: ['Spiralizer', 'Frigideira'], notes: 'Não cozinhar demais.' },
  { menuItemName: 'Mandioca Cozida', preparationMethod: '1. Descascar e cortar mandioca em pedaços.\n2. Cozinhar em água fervente com sal até macia.\n3. Escorrer e servir.', cookingTime: 20, equipment: ['Panela'], notes: 'Mandioca deve ficar macia mas não desmanchando.' },

  // ── Fibras ──
  { menuItemName: 'Brócolis no Vapor', preparationMethod: '1. Higienizar o brócolis e cortar em floretes.\n2. Cozinhar no vapor por 5-6 min.\n3. Temperar com azeite e sal.', cookingTime: 8, equipment: ['Vaporizador'], notes: 'Deve ficar verde e al dente.' },
  { menuItemName: 'Cenoura e Vagem no Vapor', preparationMethod: '1. Cortar cenoura em rodelas e vagem em pedaços.\n2. Cozinhar no vapor por 6-8 min.\n3. Temperar com azeite e sal.', cookingTime: 10, equipment: ['Vaporizador'], notes: 'Cenoura primeiro, vagem no final.' },
  { menuItemName: 'Abóbora, Cenoura e Abobrinha Assadas', preparationMethod: '1. Cortar abóbora, cenoura e abobrinha em cubos.\n2. Temperar com azeite, sal e ervas.\n3. Assar a 200°C por 25-30 min.', cookingTime: 30, temperature: '200°C', equipment: ['Forno', 'Assadeira'], notes: 'Não amontoar na assadeira.' },
  { menuItemName: 'Salada de Folhas', preparationMethod: '1. Higienizar as folhas em água com vinagre.\n2. Secar bem.\n3. Montar com tomate-cereja e azeite na hora de servir.', cookingTime: 10, equipment: ['Centrífuga de salada'], notes: 'Montar sem molho para servir.' },
  { menuItemName: 'Brócolis, Cenoura e Pepino', preparationMethod: '1. Cortar brócolis, cenoura e pepino.\n2. Cozinhar brócolis e cenoura no vapor (5-7 min).\n3. Pepino fatiado cru.\n4. Temperar tudo com azeite.', cookingTime: 10, equipment: ['Vaporizador'], notes: 'Pepino sempre cru.' },
  { menuItemName: 'Couve-flor no Vapor', preparationMethod: '1. Cortar couve-flor em floretes.\n2. Cozinhar no vapor por 8-10 min.\n3. Temperar com azeite e sal.', cookingTime: 12, equipment: ['Vaporizador'], notes: 'Al dente para gratinar depois se necessário.' },

  // ── Gorduras ──
  { menuItemName: 'Molho de Ervas Finas', preparationMethod: '1. Picar bem as ervas frescas.\n2. Misturar com azeite, limão, sal e pimenta.\n3. Deixar descansar 10 min para infusionar.', cookingTime: 5, equipment: ['Tigela'], notes: 'Preparar no dia para manter frescor.' },
  { menuItemName: 'Molho de Limão e Tahine', preparationMethod: '1. Misturar tahine com suco de limão.\n2. Adicionar água aos poucos até emulsionar.\n3. Adicionar ervas e temperar com sal.', cookingTime: 5, equipment: ['Tigela', 'Fouet'], notes: 'Fica mais cremoso quanto mais bater.' },
  { menuItemName: 'Abacate', preparationMethod: '1. Cortar abacate ao meio, remover caroço.\n2. Cortar em cubos.\n3. Temperar com limão e sal.', cookingTime: 5, equipment: ['Faca', 'Colher'], notes: 'Preparar apenas no dia do serviço.' },
  { menuItemName: 'Queijo Gratinado', preparationMethod: '1. Ralar queijo muçarela ou parmesão.\n2. Espalhar sobre o prato.\n3. Gratinar no forno por 3-5 min.', cookingTime: 5, temperature: '220°C', equipment: ['Forno', 'Ralo'], notes: 'Gratinar apenas na hora de servir.' },
];

// ── Seed do catálogo (menu + fichas). Não toca cliente/plano/sessão/preço. ──
export async function seedCatalog(prisma: PrismaClient): Promise<void> {
  // reset apenas das tabelas do catálogo (menu + fichas) — FK: sheet antes do item
  await prisma.technicalSheet.deleteMany();
  await prisma.menuItem.deleteMany();

  const idByName = new Map<string, string>();
  for (const item of MENU_ITEMS) {
    const created = await prisma.menuItem.create({ data: item });
    idByName.set(item.name, created.id);
  }

  await Promise.all(
    TECHNICAL_SHEETS.map(({ menuItemName, ...sheet }) =>
      prisma.technicalSheet.create({
        data: { ...sheet, menuItemId: idByName.get(menuItemName)! },
      }),
    ),
  );

  console.log(`  ✅ ${MENU_ITEMS.length} itens do cardápio criados`);
  console.log(`  ✅ ${TECHNICAL_SHEETS.length} fichas técnicas criadas`);
}
