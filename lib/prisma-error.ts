export type PrismaErrorSummary = {
  name: string;
  code: string | null;
  message: string;
};

export function summarizePrismaError(error: unknown): PrismaErrorSummary {
  const maybe = error as { code?: string; name?: string; message?: string } | null;

  return {
    name: maybe?.name || "UnknownError",
    code: maybe?.code || null,
    message: maybe?.message || "Unknown Prisma/database error"
  };
}

export function mapPrismaError(error: unknown): string | null {
  const summary = summarizePrismaError(error);
  const message = summary.message.toLowerCase();

  switch (summary.code) {
    case "P1000":
      return "Database auth failed. Check DATABASE_URL username/password.";
    case "P1001":
      return "Database host is unreachable. Check DATABASE_URL host/network/allowlist.";
    case "P1003":
      return "Database does not exist. Check DATABASE_URL database name.";
    case "P2021":
      return "Database tables are missing. Run prisma migrate deploy against your production DB.";
    default:
      break;
  }

  if (message.includes("can't reach database server") || message.includes("could not connect") || message.includes("connection refused")) {
    return "Database host is unreachable. Check DATABASE_URL host/network/allowlist.";
  }

  if (message.includes("authentication failed") || message.includes("password authentication failed")) {
    return "Database auth failed. Check DATABASE_URL username/password.";
  }

  if (message.includes("no pg_hba.conf entry") || message.includes("ssl")) {
    return "Database requires SSL/network permission. Ensure Neon URL includes sslmode=require and host access is allowed.";
  }

  if (message.includes("relation") && message.includes("does not exist")) {
    return "Database schema appears missing. Run prisma migrate deploy against the same DATABASE_URL used in production.";
  }

  return null;
}
