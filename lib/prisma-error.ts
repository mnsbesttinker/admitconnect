export function mapPrismaError(error: unknown): string | null {
  const maybe = error as { code?: string; message?: string } | null;
  const code = maybe?.code;

  switch (code) {
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

  if (maybe?.message?.includes("does not exist")) {
    return "Database schema appears missing. Run prisma migrate deploy against the same DATABASE_URL used in production.";
  }

  return null;
}
