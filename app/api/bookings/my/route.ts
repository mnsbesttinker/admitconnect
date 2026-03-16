import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  if (!identity.id || !identity.role) {
    return NextResponse.json({ error: "Auth required" }, { status: 401 });
  }

  const now = new Date();

  if (identity.role === "student") {
    const data = await prisma.booking.findMany({
      where: { studentUserId: identity.id, slot: { startTimeUtc: { gte: now } } },
      include: { tutor: true, slot: true },
      orderBy: { slot: { startTimeUtc: "asc" } }
    });
    return NextResponse.json({ data });
  }

  const data = await prisma.booking.findMany({
    where: { tutorUserId: identity.id, slot: { startTimeUtc: { gte: now } } },
    include: { student: true, slot: true },
    orderBy: { slot: { startTimeUtc: "asc" } }
  });
  return NextResponse.json({ data });
}
