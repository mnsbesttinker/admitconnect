import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const major = (searchParams.get("major") || "").trim().toLowerCase();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const tutors = (await prisma.tutorProfile.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } }
  })) as Array<any>;

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
      isVerified: entry.isVerified
    })),
    count: filtered.length
  });
}
