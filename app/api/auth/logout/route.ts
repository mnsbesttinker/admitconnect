import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth-store";

function getSessionToken(request: NextRequest) {
  return request.cookies.get("admitconnect_session")?.value;
}

export async function POST(request: NextRequest) {
  const token = getSessionToken(request);
  logout(token);

  const response = NextResponse.json({ data: { ok: true } });
  response.cookies.set("admitconnect_session", "", {
    path: "/",
    expires: new Date(0)
  });

  return response;
}
