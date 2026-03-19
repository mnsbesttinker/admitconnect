export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tutors = (await prisma.tutorProfile.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } }
  })) as any[];

  return NextResponse.json({
    data: tutors.map((entry: any) => ({
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
    }))
  });
}
