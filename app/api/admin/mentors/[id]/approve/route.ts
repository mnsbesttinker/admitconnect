import { NextRequest, NextResponse } from "next/server";
import { decideOnboarding } from "@/lib/store";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const identity = readIdentityFromHeaders(request.headers);

  if (identity.role !== "admin") {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<{ adminNotes: string }>;
  const decision = decideOnboarding(params.id, "approved", body.adminNotes);

  if (!decision) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({ data: decision });
}
