import { NextRequest, NextResponse } from "next/server";
import { listPendingOnboarding } from "@/lib/store";
import { readIdentityFromHeaders } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const identity = readIdentityFromHeaders(request.headers);

  if (identity.role !== "admin") {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  const data = listPendingOnboarding();
  return NextResponse.json({ data, count: data.length });
}
