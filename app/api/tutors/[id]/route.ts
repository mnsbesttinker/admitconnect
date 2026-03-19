export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DbTimeoutError, withDbTimeout } from "@/lib/db-timeout";

type TutorProfileWithUser = {
  userId: string;
  school: string;
  major: string;
  bio: string;
  specialties: string;
  hourlyRate: number;
  profileImageUrl?: string | null;
  user: {
    fullName: string;
    email: string;
    timezone: string;
  };
};

const tutorSelectBase = {
  userId: true,
  school: true,
  major: true,
  bio: true,
  specialties: true,
  hourlyRate: true,
  user: {
    select: {
      fullName: true,
      email: true,
      timezone: true
    }
  }
} as const;

const tutorSelectWithImage = {
  ...tutorSelectBase,
  profileImageUrl: true
} as const;

function isMissingProfileImageColumnError(error: unknown) {
  const maybe = error as { code?: string; message?: string } | null;
  const message = (maybe?.message || "").toLowerCase();

  if (maybe?.code === "P2022") return true;
  return message.includes("tutorprofile.profileimageurl") || (message.includes("column") && message.includes("profileimageurl") && message.includes("does not exist"));
}

async function findTutorById(userId: string): Promise<TutorProfileWithUser | null> {
  try {
    return (await prisma.tutorProfile.findUnique({
      where: { userId },
      select: tutorSelectWithImage
    })) as TutorProfileWithUser | null;
  } catch (error) {
    if (!isMissingProfileImageColumnError(error)) {
      throw error;
    }

    return (await prisma.tutorProfile.findUnique({
      where: { userId },
      select: tutorSelectBase
    })) as TutorProfileWithUser | null;
  }
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tutor = await withDbTimeout(findTutorById(params.id), 15000);

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    const slots = await withDbTimeout(
      prisma.availabilitySlot.findMany({
        where: { tutorUserId: params.id, isBooked: false, startTimeUtc: { gte: new Date() } },
        orderBy: { startTimeUtc: "asc" }
      }),
      15000
    );

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
        profileImageUrl: tutor.profileImageUrl || null,
        slots
      }
    });
  } catch (error) {
    if (error instanceof DbTimeoutError) {
      return NextResponse.json({ error: "Tutor profile request timed out. Please try again." }, { status: 504 });
    }

    return NextResponse.json({ error: "Failed to load tutor profile." }, { status: 500 });
  }
}
