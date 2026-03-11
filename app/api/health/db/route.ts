import { NextResponse } from "next/server";
import { withDbTimeout } from "@/lib/db-timeout";
import { prisma } from "@/lib/prisma";
import { mapPrismaError, summarizePrismaError } from "@/lib/prisma-error";

function compactMessage(input: string, max = 260) {
  return input.replace(/\s+/g, " ").trim().slice(0, max);
}

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
    const summary = summarizePrismaError(error);

    return NextResponse.json(
      {
        ok: false,
        error: mapped || "Database check failed",
        diagnostics: {
          name: summary.name,
          code: summary.code,
          message: compactMessage(summary.message)
        }
      },
      { status: 503 }
    );
  }
}
