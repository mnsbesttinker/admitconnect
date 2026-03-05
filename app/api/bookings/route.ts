import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/store";
import { readIdentityFromHeaders } from "@/lib/request-auth";

type CreateBookingPayload = {
  mentorId: string;
  sessionTypeId: string;
  startTimeUtc: string;
};

export async function POST(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  const body = (await request.json()) as Partial<CreateBookingPayload>;

  if (identity.role !== "student") {
    return NextResponse.json({ error: "Only authenticated students can create bookings" }, { status: 403 });
  }

  if (!identity.name || !identity.email) {
    return NextResponse.json({ error: "Authenticated student profile is incomplete" }, { status: 400 });
  }

  if (!body.mentorId || !body.sessionTypeId || !body.startTimeUtc) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const booking = createBooking({
    applicantName: identity.name,
    applicantEmail: identity.email,
    mentorId: body.mentorId,
    sessionTypeId: body.sessionTypeId,
    startTimeUtc: body.startTimeUtc
  });

  if (!booking) {
    return NextResponse.json({ error: "Unable to create booking. Check mentor, session type, or slot availability." }, { status: 400 });
  }

  return NextResponse.json({ data: booking }, { status: 201 });
}
