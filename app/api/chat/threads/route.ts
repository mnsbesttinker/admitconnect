import { NextRequest, NextResponse } from "next/server";
import { createStudentInitiatedThread, listThreadsForStudent, listThreadsForTutor } from "@/lib/store";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  const params = new URL(request.url).searchParams;
  const studentName = params.get("studentName")?.trim();
  const tutorId = params.get("tutorId")?.trim();

  if (studentName || identity.role === "student") {
    if (identity.role !== "student") {
      return NextResponse.json({ error: "Student role required" }, { status: 403 });
    }

    const resolvedStudentName = studentName || identity.name?.trim();
    if (!resolvedStudentName) {
      return NextResponse.json({ error: "Student name unavailable for authenticated user" }, { status: 400 });
    }

    if (studentName && identity.name?.trim() && studentName !== identity.name.trim()) {
      return NextResponse.json({ error: "Cannot access threads for another student" }, { status: 403 });
    }

    const data = listThreadsForStudent(resolvedStudentName);
    return NextResponse.json({ data, count: data.length });
  }

  if (tutorId) {
    if (identity.role !== "tutor") {
      return NextResponse.json({ error: "Tutor role required" }, { status: 403 });
    }

    const data = listThreadsForTutor(tutorId);
    return NextResponse.json({ data, count: data.length });
  }

  return NextResponse.json({ error: "Provide studentName or tutorId" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);
  const body = (await request.json()) as Partial<{ studentName: string; tutorId: string; text: string }>;

  if (identity.role !== "student") {
    return NextResponse.json({ error: "Only students can initiate new threads" }, { status: 403 });
  }

  if (!body.tutorId || !body.text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const studentName = body.studentName?.trim() || identity.name?.trim();
  if (!studentName) {
    return NextResponse.json({ error: "Student name unavailable for authenticated user" }, { status: 400 });
  }

  const thread = createStudentInitiatedThread({
    studentName,
    tutorId: body.tutorId,
    text: body.text
  });

  if (!thread) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }

  return NextResponse.json({ data: thread }, { status: 201 });
}
