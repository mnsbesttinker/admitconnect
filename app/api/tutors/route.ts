import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DbTimeoutError, withDbTimeout } from "@/lib/db-timeout";

const SPOTLIGHT_LIMIT = 8;
const MAX_LIMIT = 60;

function normalizeLimit(rawLimit: string | null) {
  const parsed = Number.parseInt(rawLimit ?? "", 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const major = (searchParams.get("major") || "").trim().toLowerCase();
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const scope = (searchParams.get("scope") || "directory").trim().toLowerCase();
  const requestedLimit = normalizeLimit(searchParams.get("limit"));

  try {
    const tutors = await withDbTimeout(
      prisma.tutorProfile.findMany({
        select: {
          userId: true,
          school: true,
          major: true,
          bio: true,
          specialties: true,
          hourlyRate: true,
          isVerified: true,
          profileImageUrl: true,
          user: {
            select: {
              fullName: true,
              timezone: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          user: {
            createdAt: "desc"
          }
        },
        ...(scope === "spotlight" ? { take: requestedLimit ?? SPOTLIGHT_LIMIT } : requestedLimit ? { take: requestedLimit } : {})
      }),
      15000
    );

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
