import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function POST(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  if (identity.role !== "tutor" || !identity.id) {
    return NextResponse.json({ error: "Tutor authentication required" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<{ school: string; major: string; bio: string; specialties: string; hourlyRate: number }>;
  if (!body.school || !body.major || !body.bio || !body.specialties || !body.hourlyRate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const profile = await prisma.tutorProfile.upsert({
    where: { userId: identity.id },
    update: {
      school: body.school,
      major: body.major,
      bio: body.bio,
      specialties: body.specialties,
      hourlyRate: body.hourlyRate
    },
    create: {
      userId: identity.id,
      school: body.school,
      major: body.major,
      bio: body.bio,
      specialties: body.specialties,
      hourlyRate: body.hourlyRate,
      isVerified: false
    }
  });

  return NextResponse.json({ data: profile });
}
