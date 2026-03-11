import { NextRequest, NextResponse } from "next/server";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);

  if (!identity.role) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  return NextResponse.json({ data: identity });
}
