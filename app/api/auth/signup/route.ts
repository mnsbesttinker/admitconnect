import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth-store";
import { DbTimeoutError, withDbTimeout } from "@/lib/db-timeout";
import { prisma } from "@/lib/prisma";
import { sendSignupConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<{ name: string; email: string; password: string; role: "student" | "tutor"; timezone: string }>;

    if (!body.name || !body.email || !body.password || !body.role || !body.timezone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Server database is not configured (missing DATABASE_URL)." }, { status: 503 });
    }

    if (!["student", "tutor"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role. Only student or tutor is allowed for signup." }, { status: 400 });
    }

    const existing = await withDbTimeout(prisma.user.findUnique({ where: { email: body.email.toLowerCase() } }));
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const user = await withDbTimeout(prisma.user.create({
      data: {
        fullName: body.name,
        email: body.email.toLowerCase(),
        passwordHash: hashPassword(body.password),
        role: body.role,
        timezone: body.timezone
      }
    }));

    await sendSignupConfirmationEmail({
      recipientEmail: user.email,
      recipientName: user.fullName,
      role: user.role
    });

    return NextResponse.json({ data: { id: user.id, name: user.fullName, email: user.email, role: user.role, timezone: user.timezone } }, { status: 201 });
  } catch (error) {
    if (error instanceof DbTimeoutError) {
      return NextResponse.json({ error: "Database connection timed out. Verify DATABASE_URL and that Postgres is reachable." }, { status: 503 });
    }

    console.error("[auth/signup]", error);
    return NextResponse.json({ error: "Signup failed due to a server error." }, { status: 500 });
  }
}
