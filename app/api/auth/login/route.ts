import { NextResponse } from "next/server";
import { login } from "@/lib/auth-store";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ email: string; password: string }>;

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  const result = login(body.email, body.password);
  if (!result) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({
    data: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role
    }
  });

  response.cookies.set("admitconnect_session", result.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
