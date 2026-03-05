import { NextRequest, NextResponse } from "next/server";
import { listBookingsByApplicantEmail } from "@/lib/store";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);

  if (identity.role !== "student") {
    return NextResponse.json({ error: "Only authenticated students can view their bookings" }, { status: 403 });
  }

  if (!identity.email) {
    return NextResponse.json({ error: "Authenticated student email unavailable" }, { status: 400 });
  }

  const data = listBookingsByApplicantEmail(identity.email);
  return NextResponse.json({ data, count: data.length });
}
