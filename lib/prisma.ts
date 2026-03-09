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

const globalForPrisma = globalThis as unknown as { prisma?: AnyRecord; __mockDb?: AnyRecord };

function createMockPrisma(): AnyRecord {
  if (!globalForPrisma.__mockDb) {
    globalForPrisma.__mockDb = {
      users: [] as MockUser[],
      tutorProfiles: [] as MockTutorProfile[],
      studentProfiles: [] as MockStudentProfile[],
      availabilitySlots: [] as MockAvailabilitySlot[],
      bookings: [] as MockBooking[]
    };
  }

  const db = globalForPrisma.__mockDb as {
    users: MockUser[];
    tutorProfiles: MockTutorProfile[];
    studentProfiles: MockStudentProfile[];
    availabilitySlots: MockAvailabilitySlot[];
    bookings: MockBooking[];
  };

  const withTutorInclude = (booking: MockBooking) => {
    const tutor = db.users.find((u) => u.id === booking.tutorUserId) || null;
    const student = db.users.find((u) => u.id === booking.studentUserId) || null;
    const slot = db.availabilitySlots.find((s) => s.id === booking.slotId) || null;
    return { ...booking, tutor, student, slot };
  };

  const mock: AnyRecord = {
    user: {
      findUnique: async ({ where }: AnyRecord) => {
        if (where?.email) {
          return db.users.find((u) => u.email === String(where.email).toLowerCase()) || null;
        }
        if (where?.id) {
          return db.users.find((u) => u.id === where.id) || null;
        }
        return null;
      },
      create: async ({ data }: AnyRecord) => {
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
        return user;
      }
    },

    tutorProfile: {
      findMany: async () =>
        db.tutorProfiles
          .map((profile) => ({ ...profile, user: db.users.find((u) => u.id === profile.userId) }))
          .filter((entry) => entry.user),
      findUnique: async ({ where }: AnyRecord) => {
        const profile = db.tutorProfiles.find((p) => p.userId === where?.userId);
        if (!profile) {
          return null;
        }
        const user = db.users.find((u) => u.id === profile.userId);
        if (!user) {
          return null;
        }
        return { ...profile, user };
      },
      upsert: async ({ where, create, update }: AnyRecord) => {
        const existing = db.tutorProfiles.find((p) => p.userId === where?.userId);
        if (existing) {
          Object.assign(existing, update);
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
        return record;
      }
    },

    studentProfile: {
      upsert: async ({ where, create, update }: AnyRecord) => {
        const existing = db.studentProfiles.find((p) => p.userId === where?.userId);
        if (existing) {
          Object.assign(existing, update);
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
        return record;
      }
    },

    availabilitySlot: {
      create: async ({ data }: AnyRecord) => {
        const slot: MockAvailabilitySlot = {
          id: data.id || crypto.randomUUID(),
          tutorUserId: data.tutorUserId,
          startTimeUtc: new Date(data.startTimeUtc),
          endTimeUtc: new Date(data.endTimeUtc),
          isBooked: false,
          createdAt: new Date()
        };
        db.availabilitySlots.push(slot);
        return slot;
      },
      findMany: async ({ where }: AnyRecord = {}) => {
        return db.availabilitySlots.filter((slot) => {
          if (where?.tutorUserId && slot.tutorUserId !== where.tutorUserId) return false;
          if (typeof where?.isBooked === "boolean" && slot.isBooked !== where.isBooked) return false;
          if (where?.startTimeUtc?.gte && slot.startTimeUtc < new Date(where.startTimeUtc.gte)) return false;
          return true;
        });
      },
      findUnique: async ({ where }: AnyRecord) => db.availabilitySlots.find((s) => s.id === where?.id) || null,
      updateMany: async ({ where, data }: AnyRecord) => {
        const matches = db.availabilitySlots.filter((s) => {
          if (where?.id && s.id !== where.id) return false;
          if (typeof where?.isBooked === "boolean" && s.isBooked !== where.isBooked) return false;
          return true;
        });
        matches.forEach((entry) => {
          if (typeof data?.isBooked === "boolean") entry.isBooked = data.isBooked;
        });
        return { count: matches.length };
      }
    },

    booking: {
      create: async ({ data }: AnyRecord) => {
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
        return withTutorInclude(booking);
      },
      findMany: async ({ where }: AnyRecord = {}) => {
        return db.bookings
          .filter((b) => {
            if (where?.studentUserId && b.studentUserId !== where.studentUserId) return false;
            if (where?.tutorUserId && b.tutorUserId !== where.tutorUserId) return false;
            return true;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map(withTutorInclude);
      },
      update: async ({ where, data }: AnyRecord) => {
        const booking = db.bookings.find((b) => b.id === where?.id);
        if (!booking) return null;
        if (typeof data?.googleMeetLink !== "undefined") {
          booking.googleMeetLink = data.googleMeetLink;
        }
        if (data?.status) {
          booking.status = data.status;
        }
        return withTutorInclude(booking);
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
