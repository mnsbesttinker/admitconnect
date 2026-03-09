export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function POST(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  if (identity.role !== "tutor" || !identity.id) {
    return NextResponse.json({ error: "Tutor authentication required" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<{ startTimeUtc: string; endTimeUtc: string }>;
  if (!body.startTimeUtc || !body.endTimeUtc) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      tutorUserId: identity.id,
      startTimeUtc: new Date(body.startTimeUtc),
      endTimeUtc: new Date(body.endTimeUtc)
    }
  });

  return NextResponse.json({ data: slot }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const tutorUserId = new URL(request.url).searchParams.get("tutorUserId");
  if (!tutorUserId) {
    return NextResponse.json({ error: "Missing tutorUserId" }, { status: 400 });
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: { tutorUserId, isBooked: false, startTimeUtc: { gte: new Date() } },
    orderBy: { startTimeUtc: "asc" }
  });

  return NextResponse.json({ data: slots });
}
