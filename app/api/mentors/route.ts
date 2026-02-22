import { NextRequest, NextResponse } from "next/server";
import { listMentors } from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const major = searchParams.get("major") ?? undefined;
  const language = searchParams.get("language") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const query = searchParams.get("q") ?? undefined;

  const data = listMentors({ major, language, tag, query });

  return NextResponse.json({ data, count: data.length });
}
