import { existsSync, readFileSync, writeFileSync } from "node:fs";

type AnyRecord = Record<string, any>;

type MockUser = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: "student" | "tutor";
  timezone: string;
  createdAt: Date;
};

type MockTutorProfile = {
  id: string;
  userId: string;
  school: string;
  major: string;
  bio: string;
  specialties: string;
  hourlyRate: number;
  isVerified: boolean;
};

type MockStudentProfile = {
  id: string;
  userId: string;
  country: string | null;
  intendedMajor: string | null;
  curriculum: string | null;
  satScore: number | null;
};

type MockAvailabilitySlot = {
  id: string;
  tutorUserId: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  isBooked: boolean;
  createdAt: Date;
};

type MockBooking = {
  id: string;
  studentUserId: string;
  tutorUserId: string;
  slotId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  googleMeetLink: string | null;
  createdAt: Date;
};

type MockDb = {
  users: MockUser[];
  tutorProfiles: MockTutorProfile[];
  studentProfiles: MockStudentProfile[];
  availabilitySlots: MockAvailabilitySlot[];
  bookings: MockBooking[];
};

const globalForPrisma = globalThis as unknown as { prisma?: AnyRecord; __mockDb?: MockDb };
const MOCK_DB_PATH = process.env.ADMITCONNECT_MOCK_DB_PATH || "/tmp/admitconnect-mock-db.json";

function createEmptyDb(): MockDb {
  return {
    users: [],
    tutorProfiles: [],
    studentProfiles: [],
    availabilitySlots: [],
    bookings: []
  };
}

function normalizeDbDates(db: MockDb): MockDb {
  return {
    ...db,
    users: db.users.map((u) => ({ ...u, createdAt: new Date(u.createdAt) })),
    availabilitySlots: db.availabilitySlots.map((s) => ({
      ...s,
      startTimeUtc: new Date(s.startTimeUtc),
      endTimeUtc: new Date(s.endTimeUtc),
      createdAt: new Date(s.createdAt)
    })),
    bookings: db.bookings.map((b) => ({ ...b, createdAt: new Date(b.createdAt) }))
  };
}

function loadDb(): MockDb {
  if (!existsSync(MOCK_DB_PATH)) {
    const empty = globalForPrisma.__mockDb || createEmptyDb();
    globalForPrisma.__mockDb = empty;
    return empty;
  }

  try {
    const raw = JSON.parse(readFileSync(MOCK_DB_PATH, "utf8")) as MockDb;
    const normalized = normalizeDbDates(raw);
    globalForPrisma.__mockDb = normalized;
    return normalized;
  } catch {
    const fallback = globalForPrisma.__mockDb || createEmptyDb();
    globalForPrisma.__mockDb = fallback;
    return fallback;
  }
}

function saveDb(db: MockDb) {
  globalForPrisma.__mockDb = db;
  writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2));
}

function createMockPrisma(): AnyRecord {
  const withTutorInclude = (db: MockDb, booking: MockBooking) => {
    const tutor = db.users.find((u) => u.id === booking.tutorUserId) || null;
    const student = db.users.find((u) => u.id === booking.studentUserId) || null;
    const slot = db.availabilitySlots.find((s) => s.id === booking.slotId) || null;
    return { ...booking, tutor, student, slot };
  };

  const mock: AnyRecord = {
    user: {
      findUnique: async ({ where }: AnyRecord) => {
        const db = loadDb();
        if (where?.email) {
          return db.users.find((u) => u.email === String(where.email).toLowerCase()) || null;
        }
        if (where?.id) {
          return db.users.find((u) => u.id === where.id) || null;
        }
        return null;
      },
      create: async ({ data }: AnyRecord) => {
        const db = loadDb();
        const user: MockUser = {
          id: data.id || crypto.randomUUID(),
          fullName: data.fullName,
          email: String(data.email).toLowerCase(),
          passwordHash: data.passwordHash,
          role: data.role,
          timezone: data.timezone,
          createdAt: new Date()
        };
        db.users.push(user);
        saveDb(db);
        return user;
      }
    },

    tutorProfile: {
      findMany: async () => {
        const db = loadDb();
        return db.tutorProfiles
          .map((profile) => ({ ...profile, user: db.users.find((u) => u.id === profile.userId) }))
          .filter((entry) => entry.user);
      },
      findUnique: async ({ where }: AnyRecord) => {
        const db = loadDb();
        const profile = db.tutorProfiles.find((p) => p.userId === where?.userId);
        if (!profile) return null;
        const user = db.users.find((u) => u.id === profile.userId);
        if (!user) return null;
        return { ...profile, user };
      },
      upsert: async ({ where, create, update }: AnyRecord) => {
        const db = loadDb();
        const existing = db.tutorProfiles.find((p) => p.userId === where?.userId);
        if (existing) {
          Object.assign(existing, update);
          saveDb(db);
          return existing;
        }

        const record: MockTutorProfile = {
          id: create.id || crypto.randomUUID(),
          userId: create.userId,
          school: create.school,
          major: create.major,
          bio: create.bio,
          specialties: create.specialties,
          hourlyRate: create.hourlyRate,
          isVerified: Boolean(create.isVerified)
        };
        db.tutorProfiles.push(record);
        saveDb(db);
        return record;
      }
    },

    studentProfile: {
      upsert: async ({ where, create, update }: AnyRecord) => {
        const db = loadDb();
        const existing = db.studentProfiles.find((p) => p.userId === where?.userId);
        if (existing) {
          Object.assign(existing, update);
          saveDb(db);
          return existing;
        }

        const record: MockStudentProfile = {
          id: create.id || crypto.randomUUID(),
          userId: create.userId,
          country: create.country ?? null,
          intendedMajor: create.intendedMajor ?? null,
          curriculum: create.curriculum ?? null,
          satScore: create.satScore ?? null
        };
        db.studentProfiles.push(record);
        saveDb(db);
        return record;
      }
    },

    availabilitySlot: {
      create: async ({ data }: AnyRecord) => {
        const db = loadDb();
        const slot: MockAvailabilitySlot = {
          id: data.id || crypto.randomUUID(),
          tutorUserId: data.tutorUserId,
          startTimeUtc: new Date(data.startTimeUtc),
          endTimeUtc: new Date(data.endTimeUtc),
          isBooked: false,
          createdAt: new Date()
        };
        db.availabilitySlots.push(slot);
        saveDb(db);
        return slot;
      },
      findMany: async ({ where }: AnyRecord = {}) => {
        const db = loadDb();
        return db.availabilitySlots.filter((slot) => {
          if (where?.tutorUserId && slot.tutorUserId !== where.tutorUserId) return false;
          if (typeof where?.isBooked === "boolean" && slot.isBooked !== where.isBooked) return false;
          if (where?.startTimeUtc?.gte && slot.startTimeUtc < new Date(where.startTimeUtc.gte)) return false;
          return true;
        });
      },
      findUnique: async ({ where }: AnyRecord) => {
        const db = loadDb();
        return db.availabilitySlots.find((s) => s.id === where?.id) || null;
      },
      updateMany: async ({ where, data }: AnyRecord) => {
        const db = loadDb();
        const matches = db.availabilitySlots.filter((s) => {
          if (where?.id && s.id !== where.id) return false;
          if (typeof where?.isBooked === "boolean" && s.isBooked !== where.isBooked) return false;
          return true;
        });
        matches.forEach((entry) => {
          if (typeof data?.isBooked === "boolean") entry.isBooked = data.isBooked;
        });
        saveDb(db);
        return { count: matches.length };
      }
    },

    booking: {
      create: async ({ data }: AnyRecord) => {
        const db = loadDb();
        const booking: MockBooking = {
          id: data.id || crypto.randomUUID(),
          studentUserId: data.studentUserId,
          tutorUserId: data.tutorUserId,
          slotId: data.slotId,
          status: data.status || "confirmed",
          googleMeetLink: data.googleMeetLink ?? null,
          createdAt: new Date()
        };
        db.bookings.push(booking);
        saveDb(db);
        return withTutorInclude(db, booking);
      },
      findMany: async ({ where }: AnyRecord = {}) => {
        const db = loadDb();
        return db.bookings
          .filter((b) => {
            if (where?.studentUserId && b.studentUserId !== where.studentUserId) return false;
            if (where?.tutorUserId && b.tutorUserId !== where.tutorUserId) return false;
            return true;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((booking) => withTutorInclude(db, booking));
      },
      update: async ({ where, data }: AnyRecord) => {
        const db = loadDb();
        const booking = db.bookings.find((b) => b.id === where?.id);
        if (!booking) return null;
        if (typeof data?.googleMeetLink !== "undefined") booking.googleMeetLink = data.googleMeetLink;
        if (data?.status) booking.status = data.status;
        saveDb(db);
        return withTutorInclude(db, booking);
      }
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
