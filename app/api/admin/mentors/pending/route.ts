import { NextResponse } from "next/server";
import { listPendingOnboarding } from "@/lib/store";

export async function GET() {
  const data = listPendingOnboarding();
  return NextResponse.json({ data, count: data.length });
}
