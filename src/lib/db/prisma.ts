import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/lib/supabase/config";

/**
 * Prisma Client tunggal (lazy) dengan driver adapter PostgreSQL.
 * Mengembalikan null bila DATABASE_URL belum diisi sehingga route
 * dapat merespons 503 alih-alih crash.
 */
const globalForPrisma = globalThis as unknown as {
  __startupTycoonPrisma?: PrismaClient;
};

export function getPrisma(): PrismaClient | null {
  if (!isDatabaseConfigured()) return null;
  if (!globalForPrisma.__startupTycoonPrisma) {
    globalForPrisma.__startupTycoonPrisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }),
    });
  }
  return globalForPrisma.__startupTycoonPrisma;
}
