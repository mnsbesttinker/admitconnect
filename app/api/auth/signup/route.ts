import { NextResponse } from "next/server";
import { signup, type AppRole } from "@/lib/auth-store";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ name: string; email: string; password: string; role: AppRole }>;

  if (!body.name || !body.email || !body.password || !body.role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["student", "tutor"].includes(body.role)) {
    return NextResponse.json({ error: "Invalid role. Only student or tutor is allowed for signup." }, { status: 400 });
  }

  const user = signup({
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role
  });

  if (!user) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  return NextResponse.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}
