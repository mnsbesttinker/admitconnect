import { PrismaClient } from "@prisma/client";

type PrismaGlobal = typeof globalThis & {
  __admitconnectPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

export const prisma =
  globalForPrisma.__admitconnectPrisma ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__admitconnectPrisma = prisma;
}
