import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const tutor = await prisma.tutorProfile.findUnique({ where: { userId: params.id } });

  if (!tutor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: { tutorUserId: params.id, isBooked: false, startTimeUtc: { gte: new Date() } },
    orderBy: { startTimeUtc: "asc" }
  });

  return NextResponse.json({ data: slots, count: slots.length });
}
