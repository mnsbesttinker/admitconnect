import { NextResponse } from "next/server";
import { getMentor, listReviewsForMentor } from "@/lib/store";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const mentor = getMentor(params.id);

  if (!mentor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  const reviews = listReviewsForMentor(params.id);
  return NextResponse.json({ data: reviews, count: reviews.length });
}
