import { NextResponse } from "next/server";
import { getMentor, listAvailabilityForMentor } from "@/lib/store";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const mentor = getMentor(params.id);

  if (!mentor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  const slots = listAvailabilityForMentor(params.id);
  return NextResponse.json({ data: slots, count: slots.length });
}
