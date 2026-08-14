import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedCatalog, MENU_ITEMS, TECHNICAL_SHEETS } from './catalog-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database (Personal Chef + Meal Prep)...\n');

  // ── Cleanup (order matters: FK dependents first) ──
  await prisma.mealPrepSession.deleteMany();
  await prisma.pricingConfig.deleteMany();
  await prisma.planoAlimentar.deleteMany();
  await prisma.specialRequest.deleteMany();
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

  // ── Catálogo (menu + fichas) — compartilhado com seed-catalogo ──
  await seedCatalog(prisma);

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
  console.log(`   - ${MENU_ITEMS.length} itens do cardápio (por tipo nutricional)`);
  console.log(`   - ${TECHNICAL_SHEETS.length} fichas técnicas`);
  console.log(`   - ${clientes.length} clientes`);
  console.log('   - 3 planos alimentares');
  console.log('   - 3 configurações de preço');
  console.log('   - 2 sessões de Meal Prep');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
