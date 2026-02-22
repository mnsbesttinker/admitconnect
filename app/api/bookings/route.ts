import { NextResponse } from "next/server";
import { createBooking } from "@/lib/store";

type CreateBookingPayload = {
  applicantName: string;
  mentorId: string;
  sessionTypeId: string;
  startTimeUtc: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateBookingPayload>;

  if (!body.applicantName || !body.mentorId || !body.sessionTypeId || !body.startTimeUtc) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const booking = createBooking({
    applicantName: body.applicantName,
    mentorId: body.mentorId,
    sessionTypeId: body.sessionTypeId,
    startTimeUtc: body.startTimeUtc
  });

  if (!booking) {
    return NextResponse.json({ error: "Unable to create booking. Check mentor, session type, or slot availability." }, { status: 400 });
  }

  return NextResponse.json({ data: booking }, { status: 201 });
}
