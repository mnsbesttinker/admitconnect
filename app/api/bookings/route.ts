import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readIdentityFromHeaders } from "@/lib/request-auth";
import { createMeetingLinkForBooking } from "@/lib/meet";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  if (identity.role !== "student" || !identity.id || !identity.email || !identity.name || !identity.timezone) {
    return NextResponse.json({ error: "Only authenticated students can create bookings" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<{ slotId: string }>;
  if (!body.slotId) {
    return NextResponse.json({ error: "Missing slotId" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx: any) => {
    const slot = await tx.availabilitySlot.findUnique({ where: { id: body.slotId } });
    if (!slot) {
      return { error: "Slot not found" as const };
    }

    const claim = await tx.availabilitySlot.updateMany({
      where: { id: slot.id, isBooked: false },
      data: { isBooked: true }
    });

    if (claim.count === 0) {
      return { error: "Slot already booked" as const };
    }

    const booking = await tx.booking.create({
      data: {
        studentUserId: identity.id!,
        tutorUserId: slot.tutorUserId,
        slotId: slot.id,
        status: "confirmed"
      },
      include: {
        student: true,
        tutor: true,
        slot: true
      }
    });

    return { booking };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const meetLink = await createMeetingLinkForBooking(result.booking.id);

  if (meetLink) {
    await prisma.booking.update({ where: { id: result.booking.id }, data: { googleMeetLink: meetLink } });
  }

  await Promise.all([
    sendBookingConfirmationEmail({
      recipientEmail: result.booking.student.email,
      recipientName: result.booking.student.fullName,
      counterpartName: result.booking.tutor.fullName,
      startTimeUtcIso: result.booking.slot.startTimeUtc.toISOString(),
      recipientTimezone: result.booking.student.timezone,
      roleLabel: "student",
      meetLink
    }),
    sendBookingConfirmationEmail({
      recipientEmail: result.booking.tutor.email,
      recipientName: result.booking.tutor.fullName,
      counterpartName: result.booking.student.fullName,
      startTimeUtcIso: result.booking.slot.startTimeUtc.toISOString(),
      recipientTimezone: result.booking.tutor.timezone,
      roleLabel: "tutor",
      meetLink
    })
  ]);

  return NextResponse.json({ data: { id: result.booking.id } }, { status: 201 });
}
