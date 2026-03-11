import { NextResponse } from "next/server";
import { withDbTimeout } from "@/lib/db-timeout";
import { prisma } from "@/lib/prisma";
import { mapPrismaError } from "@/lib/prisma-error";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "Missing DATABASE_URL" }, { status: 503 });
  }

  try {
    await withDbTimeout(prisma.$queryRaw`SELECT 1`, 5000);

    const tableProbe = await withDbTimeout(
      prisma.$queryRaw<Array<{ table_name: string | null }>>`
        SELECT to_regclass('public."User"')::text as table_name
      `,
      5000
    );

    const userTableExists = tableProbe[0]?.table_name === "User";

    return NextResponse.json({ ok: true, databaseReachable: true, userTableExists });
  } catch (error) {
    const mapped = mapPrismaError(error);
    return NextResponse.json({ ok: false, error: mapped || "Database check failed" }, { status: 503 });
  }
}
