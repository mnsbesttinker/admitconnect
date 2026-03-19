import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DbTimeoutError, withDbTimeout } from "@/lib/db-timeout";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
const SPOTLIGHT_LIMIT = 8;

function normalizeLimit(rawLimit: string | null, fallback: number) {
  const parsed = Number.parseInt(rawLimit ?? "", 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const major = (searchParams.get("major") || "").trim().toLowerCase();
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const scope = (searchParams.get("scope") || "directory").trim().toLowerCase();
  const limit = normalizeLimit(searchParams.get("limit"), scope === "spotlight" ? SPOTLIGHT_LIMIT : DEFAULT_LIMIT);

  try {
    const tutors = await withDbTimeout(
      prisma.tutorProfile.findMany({
        where: {
          user: {
            fullName: {
              not: ""
            }
          }
        },
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
        take: limit
      })
    );

    const filtered = tutors.filter((entry) => {
      const matchesMajor = !major || entry.major.toLowerCase().includes(major);
      const haystack = [entry.user.fullName, entry.school, entry.major, entry.bio, entry.specialties].join(" ").toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesMajor && matchesQuery;
    });

    return NextResponse.json({
      data: filtered.map((entry) => ({
        id: entry.userId,
        fullName: entry.user.fullName,
        timezone: entry.user.timezone,
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
