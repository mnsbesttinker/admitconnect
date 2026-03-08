import { NextResponse } from "next/server";
import { hashPassword, type AppRole } from "@/lib/auth-store";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ name: string; email: string; password: string; role: AppRole; timezone: string }>;

  if (!body.name || !body.email || !body.password || !body.role || !body.timezone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["student", "tutor"].includes(body.role)) {
    return NextResponse.json({ error: "Invalid role. Only student or tutor is allowed for signup." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      fullName: body.name,
      email: body.email.toLowerCase(),
      passwordHash: hashPassword(body.password),
      role: body.role,
      timezone: body.timezone
    }
  });

  return NextResponse.json({ data: { id: user.id, name: user.fullName, email: user.email, role: user.role, timezone: user.timezone } }, { status: 201 });
}
