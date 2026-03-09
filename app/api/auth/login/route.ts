import { NextResponse } from "next/server";
import { createSessionToken, hashPassword } from "@/lib/auth-store";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ email: string; password: string }>;

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || user.passwordHash !== hashPassword(body.password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createSessionToken({
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
    timezone: user.timezone
  });

  const response = NextResponse.json({
    data: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      timezone: user.timezone
    }
  });

  response.cookies.set("admitconnect_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
