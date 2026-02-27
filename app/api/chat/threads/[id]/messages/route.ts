import { NextRequest, NextResponse } from "next/server";
import { addMessageToThread } from "@/lib/store";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const identity = readIdentityFromHeaders(request.headers);
  const body = (await request.json()) as Partial<{ senderRole: "student" | "tutor"; senderName: string; text: string }>;

  if (!body.senderRole || !body.senderName || !body.text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (identity.role !== body.senderRole) {
    return NextResponse.json({ error: "Sender role does not match authenticated role" }, { status: 403 });
  }

  const result = addMessageToThread({
    threadId: params.id,
    senderRole: body.senderRole,
    senderName: body.senderName,
    text: body.text
  });

  if ("error" in result) {
    const status = result.error === "Thread not found" ? 404 : 403;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ data: result.thread });
}
