import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  if (!identity.id || !identity.role) {
    return NextResponse.json({ error: "Auth required" }, { status: 401 });
  }

  if (identity.role === "student") {
    const data = await prisma.booking.findMany({
      where: { studentUserId: identity.id },
      include: { tutor: true, slot: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ data });
  }

  const data = await prisma.booking.findMany({
    where: { tutorUserId: identity.id },
    include: { student: true, slot: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ data });
}
