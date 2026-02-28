import { getUserFromToken, type AppRole } from "@/lib/auth-store";

export type RequestIdentity = {
  role: AppRole | null;
  name: string | null;
  email?: string | null;
};

function readCookieToken(headers: Headers) {
  const cookieHeader = headers.get("cookie") || "";
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const tokenPart = parts.find((part) => part.startsWith("admitconnect_session="));
  return tokenPart?.split("=")[1];
}

export function readIdentityFromHeaders(headers: Headers): RequestIdentity {
  const token = readCookieToken(headers);
  const user = getUserFromToken(token);

  if (user) {
    return { role: user.role, name: user.name, email: user.email };
  }

  const role = headers.get("x-user-role") as AppRole | null;
  const name = headers.get("x-user-name");

  if (!role || !["student", "tutor", "admin"].includes(role)) {
    return { role: null, name: name?.trim() || null, email: null };
  }

  return { role, name: name?.trim() || null, email: null };
}
