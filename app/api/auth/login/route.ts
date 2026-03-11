import { NextResponse } from "next/server";
import { createSessionToken, hashPassword } from "@/lib/auth-store";
import { DbTimeoutError, withDbTimeout } from "@/lib/db-timeout";
import { prisma } from "@/lib/prisma";
import { mapPrismaError } from "@/lib/prisma-error";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<{ email: string; password: string }>;

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Server database is not configured (missing DATABASE_URL)." }, { status: 503 });
    }

    const user = await withDbTimeout(prisma.user.findUnique({ where: { email: body.email.toLowerCase() } }));
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
  } catch (error) {
    if (error instanceof DbTimeoutError) {
      return NextResponse.json({ error: "Database connection timed out. Verify DATABASE_URL and that Postgres is reachable." }, { status: 503 });
    }

    const mapped = mapPrismaError(error);
    if (mapped) {
      return NextResponse.json({ error: mapped }, { status: 503 });
    }

    console.error("[auth/login]", error);
    return NextResponse.json({ error: "Login failed due to a server error." }, { status: 500 });
  }
}
