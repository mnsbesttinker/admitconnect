import { NextResponse } from "next/server";
import { getMentor } from "@/lib/store";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const mentor = getMentor(params.id);

  if (!mentor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  return NextResponse.json({ data: mentor });
}
