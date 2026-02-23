import { NextResponse } from "next/server";
import { submitMentorOnboarding, type MentorOnboardingRequest } from "@/lib/store";

function isValidPayload(body: Partial<MentorOnboardingRequest>) {
  return Boolean(
    body.name &&
      body.university &&
      typeof body.graduationYear === "number" &&
      body.major &&
      body.bio &&
      Array.isArray(body.languages) &&
      Array.isArray(body.credibilityTags) &&
      typeof body.hourlyRateUsd === "number" &&
      body.hourlyRateUsd > 0 &&
      body.offeringSummary &&
      Array.isArray(body.credentialDocuments)
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<MentorOnboardingRequest>;

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Invalid onboarding payload" }, { status: 400 });
  }

  const submission = submitMentorOnboarding(body as MentorOnboardingRequest);
  return NextResponse.json({ data: submission }, { status: 201 });
}
