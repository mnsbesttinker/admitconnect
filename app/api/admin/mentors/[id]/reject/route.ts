import { NextResponse } from "next/server";
import { decideOnboarding } from "@/lib/store";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => ({}))) as Partial<{ adminNotes: string }>;
  const decision = decideOnboarding(params.id, "rejected", body.adminNotes);

  if (!decision) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({ data: decision });
}
