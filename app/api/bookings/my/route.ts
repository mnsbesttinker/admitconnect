import { NextRequest, NextResponse } from "next/server";
import { listBookingsByApplicant } from "@/lib/store";

export async function GET(request: NextRequest) {
  const applicant = new URL(request.url).searchParams.get("applicant");

  if (!applicant) {
    return NextResponse.json({ error: "Missing query parameter: applicant" }, { status: 400 });
  }

  const data = listBookingsByApplicant(applicant);
  return NextResponse.json({ data, count: data.length });
}
