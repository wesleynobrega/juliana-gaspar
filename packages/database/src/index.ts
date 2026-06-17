import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root (packages/database/src → three levels up)
config({ path: resolve(__dirname, '../../../.env') });

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
