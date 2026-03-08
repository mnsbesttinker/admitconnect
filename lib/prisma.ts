type AnyRecord = Record<string, any>;

const globalForPrisma = globalThis as unknown as { prisma?: AnyRecord };

function createMockPrisma(): AnyRecord {
  const mock: AnyRecord = {
    user: {
      findUnique: async () => null,
      create: async ({ data }: AnyRecord) => ({ id: crypto.randomUUID(), createdAt: new Date(), ...data })
    },
    tutorProfile: {
      findMany: async () => [],
      findUnique: async () => null,
      upsert: async ({ create, update }: AnyRecord) => ({ id: crypto.randomUUID(), ...(create || update) })
    },
    studentProfile: {
      upsert: async ({ create, update }: AnyRecord) => ({ id: crypto.randomUUID(), ...(create || update) })
    },
    availabilitySlot: {
      create: async ({ data }: AnyRecord) => ({ id: crypto.randomUUID(), isBooked: false, createdAt: new Date(), ...data }),
      findMany: async () => [],
      findUnique: async () => null,
      updateMany: async () => ({ count: 0 })
    },
    booking: {
      create: async ({ data }: AnyRecord) => ({ id: crypto.randomUUID(), createdAt: new Date(), ...data }),
      findMany: async () => [],
      update: async ({ data }: AnyRecord) => ({ ...data })
    },
    $transaction: async (fn: (tx: AnyRecord) => Promise<unknown>) => fn(mock)
  };

  return mock;
}

export const prisma: AnyRecord = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  try {
    const { PrismaClient } = (eval("require")("@prisma/client") as { PrismaClient: new (args?: unknown) => AnyRecord });
    const client = new PrismaClient({ log: ["error"] });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    return client;
  } catch {
    const fallback = createMockPrisma();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = fallback;
    }
    return fallback;
  }
})();
