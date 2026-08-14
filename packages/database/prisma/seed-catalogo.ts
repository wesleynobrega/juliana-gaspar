import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedCatalog } from './catalog-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding do catálogo (somente menu + fichas técnicas)...\n');

  // ── Admin (upsert, não destrutivo) ──
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

  // ── Catálogo (reset apenas de menu + fichas; NÃO toca cliente/plano/preço/sessão) ──
  await seedCatalog(prisma);

  console.log('\n🎉 Catálogo seed concluído.');
  console.log('   Clientes, planos, preços e sessões NÃO foram alterados.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
