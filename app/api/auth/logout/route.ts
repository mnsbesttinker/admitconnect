import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ data: { ok: true } });
  response.cookies.set("admitconnect_session", "", {
    path: "/",
    expires: new Date(0)
  });

  return response;
}
