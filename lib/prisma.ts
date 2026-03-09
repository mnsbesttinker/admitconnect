import { PrismaClient } from "@prisma/client";

type PrismaGlobal = typeof globalThis & {
  __admitconnectPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to initialize PrismaClient");
  }

  return new PrismaClient({
    log: ["error", "warn"]
  });
}

function getPrismaClient() {
  if (globalForPrisma.__admitconnectPrisma) {
    return globalForPrisma.__admitconnectPrisma;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__admitconnectPrisma = client;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  }
});
