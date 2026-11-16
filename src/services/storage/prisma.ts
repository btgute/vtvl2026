import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  __uteVtvlPrisma?: PrismaClient;
};

export function isDatabaseConfigured(): boolean {
  return Boolean((process.env.DATABASE_URL || '').trim());
}

export const prisma: PrismaClient =
  globalForPrisma.__uteVtvlPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__uteVtvlPrisma = prisma;
}

export default prisma;
