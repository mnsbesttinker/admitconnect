import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: params.id },
    include: {
      user: true
    }
  });

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: { tutorUserId: params.id, isBooked: false, startTimeUtc: { gte: new Date() } },
    orderBy: { startTimeUtc: "asc" }
  });

  return NextResponse.json({
    data: {
      id: tutor.userId,
      fullName: tutor.user.fullName,
      email: tutor.user.email,
      timezone: tutor.user.timezone,
      school: tutor.school,
      major: tutor.major,
      bio: tutor.bio,
      specialties: tutor.specialties,
      hourlyRate: tutor.hourlyRate,
      slots
    }
  });
}
