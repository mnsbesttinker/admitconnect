import { NextRequest, NextResponse } from "next/server";
import { createStudentInitiatedThread, listThreadsForStudent, listThreadsForTutor } from "@/lib/store";

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const studentName = params.get("studentName");
  const tutorId = params.get("tutorId");

  if (studentName) {
    const data = listThreadsForStudent(studentName);
    return NextResponse.json({ data, count: data.length });
  }

  if (tutorId) {
    const data = listThreadsForTutor(tutorId);
    return NextResponse.json({ data, count: data.length });
  }

  return NextResponse.json({ error: "Provide studentName or tutorId" }, { status: 400 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ studentName: string; tutorId: string; text: string; senderRole: string }>;

  if (!body.studentName || !body.tutorId || !body.text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (body.senderRole && body.senderRole !== "student") {
    return NextResponse.json({ error: "Only students can initiate new threads" }, { status: 403 });
  }

  const thread = createStudentInitiatedThread({
    studentName: body.studentName,
    tutorId: body.tutorId,
    text: body.text
  });

  if (!thread) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }

  return NextResponse.json({ data: thread }, { status: 201 });
}
