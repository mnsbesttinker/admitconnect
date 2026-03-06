import { NextResponse } from "next/server";
import { submitMentorOnboarding, type MentorOnboardingRequest } from "@/lib/store";

const allowedCredibilityTags = new Set([
  "full-ride",
  "need-based",
  "merit",
  "t20",
  "first-gen",
  "stem",
  "essay-strategy",
  "interview-prep"
]);

function splitCsv(input: string) {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseNumber(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") {
    return NaN;
  }

  return Number(raw);
}

export async function POST(request: Request) {
  const form = await request.formData();

  const name = String(form.get("name") ?? "").trim();
  const university = String(form.get("university") ?? "").trim();
  const graduationYear = parseNumber(form.get("graduationYear"));
  const major = String(form.get("major") ?? "").trim();
  const bio = String(form.get("bio") ?? "").trim();
  const hourlyRateUsd = parseNumber(form.get("hourlyRateUsd"));
  const offeringSummary = String(form.get("offeringSummary") ?? "").trim();
  const languages = splitCsv(String(form.get("languages") ?? ""));
  const credibilityTags = splitCsv(String(form.get("credibilityTags") ?? "")).map((value) => value.toLowerCase());

  const profilePhoto = form.get("profilePhoto");
  const credentialDocuments = form.getAll("credentialDocuments");

  if (!name || !university || !major || !bio || !offeringSummary || languages.length === 0 || credibilityTags.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Number.isInteger(graduationYear) || graduationYear < 2010 || graduationYear > 2035) {
    return NextResponse.json({ error: "Graduation year must be between 2010 and 2035" }, { status: 400 });
  }

  if (!Number.isFinite(hourlyRateUsd) || hourlyRateUsd < 10 || hourlyRateUsd > 300) {
    return NextResponse.json({ error: "Hourly rate must be between $10 and $300" }, { status: 400 });
  }

  const invalidTag = credibilityTags.find((tag) => !allowedCredibilityTags.has(tag));
  if (invalidTag) {
    return NextResponse.json({ error: `Invalid credibility tag: ${invalidTag}` }, { status: 400 });
  }

  if (!(profilePhoto instanceof File) || profilePhoto.size === 0) {
    return NextResponse.json({ error: "Profile photo is required" }, { status: 400 });
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(profilePhoto.type)) {
    return NextResponse.json({ error: "Profile photo must be JPG, PNG, or WEBP" }, { status: 400 });
  }

  const validCredentialFiles = credentialDocuments.filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (validCredentialFiles.length === 0) {
    return NextResponse.json({ error: "At least one credential PDF is required" }, { status: 400 });
  }

  const invalidCredential = validCredentialFiles.find((file) => file.type !== "application/pdf");
  if (invalidCredential) {
    return NextResponse.json({ error: `Invalid credential file type for ${invalidCredential.name}` }, { status: 400 });
  }

  const payload: MentorOnboardingRequest = {
    name,
    university,
    graduationYear,
    major,
    bio,
    languages,
    credibilityTags,
    hourlyRateUsd,
    offeringSummary,
    profilePhotoFileName: profilePhoto.name,
    credentialDocuments: validCredentialFiles.map((file) => file.name)
  };

  const submission = submitMentorOnboarding(payload);
  return NextResponse.json({ data: submission }, { status: 201 });
}
