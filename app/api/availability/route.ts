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

  const start = new Date(body.startTimeUtc);
  const end = new Date(body.endTimeUtc);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid datetime format" }, { status: 400 });
  }

  if (start >= end) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }

  const duplicate = await prisma.availabilitySlot.findFirst({
    where: {
      tutorUserId: identity.id,
      startTimeUtc: start,
      endTimeUtc: end,
      isBooked: false
    }
  });

  if (duplicate) {
    return NextResponse.json({ error: "An identical open slot already exists." }, { status: 409 });
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      tutorUserId: identity.id,
      startTimeUtc: start,
      endTimeUtc: end
    }
  });

  return NextResponse.json({ data: slot }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const queryTutorUserId = new URL(request.url).searchParams.get("tutorUserId");
  const identity = readIdentityFromHeaders(request.headers);
  const tutorUserId = queryTutorUserId || (identity.role === "tutor" ? identity.id : null);

  if (!tutorUserId) {
    return NextResponse.json({ error: "Missing tutorUserId" }, { status: 400 });
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: { tutorUserId, isBooked: false, startTimeUtc: { gte: new Date() } },
    orderBy: { startTimeUtc: "asc" }
  });

  return NextResponse.json({ data: slots });
}
