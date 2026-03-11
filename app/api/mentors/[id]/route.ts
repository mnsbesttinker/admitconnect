import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: params.id },
    include: { user: true }
  });

  if (!tutor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: tutor.userId,
      fullName: tutor.user.fullName,
      timezone: tutor.user.timezone,
      school: tutor.school,
      major: tutor.major,
      bio: tutor.bio,
      specialties: tutor.specialties,
      hourlyRate: tutor.hourlyRate,
      isVerified: tutor.isVerified
    }
  });
}
