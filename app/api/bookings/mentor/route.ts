import { NextRequest, NextResponse } from "next/server";
import { listBookingsByMentor } from "@/lib/store";

export async function GET(request: NextRequest) {
  const mentorId = new URL(request.url).searchParams.get("mentorId");

  if (!mentorId) {
    return NextResponse.json({ error: "Missing query parameter: mentorId" }, { status: 400 });
  }

  const data = listBookingsByMentor(mentorId);
  return NextResponse.json({ data, count: data.length });
}
