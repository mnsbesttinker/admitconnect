import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function POST(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  if (identity.role !== "student" || !identity.id) {
    return NextResponse.json({ error: "Student authentication required" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<{ country: string; intendedMajor: string; curriculum: string; satScore: number | null }>;

  const profile = await prisma.studentProfile.upsert({
    where: { userId: identity.id },
    update: {
      country: body.country || null,
      intendedMajor: body.intendedMajor || null,
      curriculum: body.curriculum || null,
      satScore: typeof body.satScore === "number" ? body.satScore : null
    },
    create: {
      userId: identity.id,
      country: body.country || null,
      intendedMajor: body.intendedMajor || null,
      curriculum: body.curriculum || null,
      satScore: typeof body.satScore === "number" ? body.satScore : null
    }
  });

  return NextResponse.json({ data: profile });
}
