import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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

  const dishes = await Promise.all([
    prisma.dish.create({ data: { name: 'Salmão Grelhado com Legumes', description: 'Filé de salmão grelhado ao molho de ervas finas com mix de legumes orgânicos e arroz integral.', ingredients: 'Salmão, abobrinha, cenoura, brócolis, arroz integral, azeite, ervas finas, sal', allergens: 'Peixe', price: 42.90, available: true }}),
    prisma.dish.create({ data: { name: 'Frango à Parmegiana Fit', description: 'Peito de frango empanado com farinha de amêndoas, molho de tomate caseiro e muçarela. Acompanha purê de couve-flor.', ingredients: 'Frango, farinha de amêndoas, tomate, muçarela, couve-flor, alho, cebola, manjericão', allergens: 'Laticínios, Oleaginosas', price: 38.90, available: true }}),
    prisma.dish.create({ data: { name: 'Bowl de Quinoa Vegano', description: 'Quinoa com legumes assados, grão-de-bico crocante, abacate, sementes de abóbora e molho tahine.', ingredients: 'Quinoa, grão-de-bico, abacate, cenoura, beterraba, sementes de abóbora, tahine, limão', allergens: 'Gergelim', price: 32.90, available: true }}),
    prisma.dish.create({ data: { name: 'Espaguete de Abobrinha', description: 'Abobrinha em fitas com camarões ao molho pesto de manjericão fresco e tomate cereja confit.', ingredients: 'Abobrinha, camarão, manjericão, tomate cereja, alho, azeite, pinoli, parmesão', allergens: 'Crustáceos, Laticínios', price: 45.90, available: true }}),
    prisma.dish.create({ data: { name: 'Carne de Panela Low Carb', description: 'Músculo cozido lentamente com cebola caramelizada, legumes rústicos e farofa de coco.', ingredients: 'Músculo bovino, cebola, cenoura, vagem, coco seco, farinha de amêndoas, alho, louro', allergens: 'Oleaginosas', price: 39.90, available: true }}),
    prisma.dish.create({ data: { name: 'Omelete de Forno Especial', description: 'Omelete assada com espinafre, tomate seco e queijo de cabra. Acompanha salada verde.', ingredients: 'Ovos, espinafre, tomate seco, queijo de cabra, folhas verdes, limão, azeite', allergens: 'Ovos, Laticínios', price: 28.90, available: true }}),
  ]);
  console.log(`  ✅ ${dishes.length} pratos criados`);

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
  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
