import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DbTimeoutError, withDbTimeout } from "@/lib/db-timeout";

const SPOTLIGHT_LIMIT = 8;
const MAX_LIMIT = 60;

const tutorSelectBase = {
  userId: true,
  school: true,
  major: true,
  bio: true,
  specialties: true,
  hourlyRate: true,
  isVerified: true,
  user: {
    select: {
      fullName: true,
      timezone: true,
      createdAt: true
    }
  }
} as const;

const tutorSelectWithImage = {
  ...tutorSelectBase,
  profileImageUrl: true
} as const;

type TutorRecord = {
  userId: string;
  school: string;
  major: string;
  bio: string;
  specialties: string;
  hourlyRate: number;
  isVerified: boolean;
  profileImageUrl?: string | null;
  user: {
    fullName: string;
    timezone: string;
    createdAt: Date;
  } | null;
};

function normalizeLimit(rawLimit: string | null) {
  const parsed = Number.parseInt(rawLimit ?? "", 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function isMissingProfileImageColumnError(error: unknown) {
  const maybe = error as { code?: string; message?: string } | null;
  const message = (maybe?.message || "").toLowerCase();

  if (maybe?.code === "P2022") return true;
  return message.includes("tutorprofile.profileimageurl") || (message.includes("column") && message.includes("profileimageurl") && message.includes("does not exist"));
}

async function fetchTutors(scope: string, requestedLimit?: number): Promise<TutorRecord[]> {
  const take = scope === "spotlight" ? requestedLimit ?? SPOTLIGHT_LIMIT : requestedLimit;

  const commonQuery = {
    orderBy: {
      user: {
        createdAt: "desc" as const
      }
    },
    ...(take ? { take } : {})
  };

  try {
    return (await prisma.tutorProfile.findMany({
      ...commonQuery,
      select: tutorSelectWithImage
    })) as TutorRecord[];
  } catch (error) {
    if (!isMissingProfileImageColumnError(error)) {
      throw error;
    }

    return (await prisma.tutorProfile.findMany({
      ...commonQuery,
      select: tutorSelectBase
    })) as TutorRecord[];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const major = (searchParams.get("major") || "").trim().toLowerCase();
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const scope = (searchParams.get("scope") || "directory").trim().toLowerCase();
  const requestedLimit = normalizeLimit(searchParams.get("limit"));

  try {
    const tutors = await withDbTimeout(fetchTutors(scope, requestedLimit), 15000);

    const filtered = tutors.filter((entry) => {
      const fullName = entry.user?.fullName ?? "";
      const majorValue = entry.major ?? "";
      const school = entry.school ?? "";
      const bio = entry.bio ?? "";
      const specialties = entry.specialties ?? "";

      const matchesMajor = !major || majorValue.toLowerCase().includes(major);
      const haystack = [fullName, school, majorValue, bio, specialties].join(" ").toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesMajor && matchesQuery;
    });

    return NextResponse.json({
      data: filtered.map((entry) => ({
        id: entry.userId,
        fullName: entry.user?.fullName || "Tutor",
        timezone: entry.user?.timezone || "UTC",
        school: entry.school,
        major: entry.major,
        bio: entry.bio,
        specialties: entry.specialties,
        hourlyRate: entry.hourlyRate,
        isVerified: entry.isVerified,
        profileImageUrl: entry.profileImageUrl || null
      })),
      count: filtered.length
    });
  } catch (error) {
    if (error instanceof DbTimeoutError) {
      return NextResponse.json({ error: "Tutor directory request timed out. Please try again." }, { status: 504 });
    }

    return NextResponse.json({ error: "Failed to load tutors." }, { status: 500 });
  }
}
