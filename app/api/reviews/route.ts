import { NextResponse } from "next/server";
import { createReview, getMentor } from "@/lib/store";

type CreateReviewPayload = {
  mentorId: string;
  applicantName: string;
  rating: number;
  text: string;
};

function isValidRating(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateReviewPayload>;

  if (!body.mentorId || !body.applicantName || !body.text || typeof body.rating !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!isValidRating(body.rating)) {
    return NextResponse.json({ error: "Rating must be an integer from 1 to 5" }, { status: 400 });
  }

  const mentor = getMentor(body.mentorId);
  if (!mentor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  const review = createReview({
    mentorId: body.mentorId,
    applicantName: body.applicantName,
    rating: body.rating,
    text: body.text
  });

  return NextResponse.json({ data: review }, { status: 201 });
}
