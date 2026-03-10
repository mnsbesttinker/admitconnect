import { getUserFromToken, type AppRole } from "@/lib/auth-store";

export type RequestIdentity = {
  id?: string | null;
  role: AppRole | null;
  name: string | null;
  email?: string | null;
  timezone?: string | null;
};

function readCookieToken(headers: Headers) {
  const cookieHeader = headers.get("cookie") || "";
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const tokenPart = parts.find((part) => part.startsWith("admitconnect_session="));
  if (!tokenPart) {
    return undefined;
  }

  const rawValue = tokenPart.slice("admitconnect_session=".length);
  return decodeURIComponent(rawValue);
}

export function readIdentityFromHeaders(headers: Headers): RequestIdentity {
  const token = readCookieToken(headers);
  const user = getUserFromToken(token);

  if (user) {
    return { id: user.id, role: user.role, name: user.name, email: user.email, timezone: user.timezone };
  }

  const role = headers.get("x-user-role") as AppRole | null;
  const name = headers.get("x-user-name");

  if (!role || !["student", "tutor"].includes(role)) {
    return { role: null, name: name?.trim() || null, email: null, timezone: null, id: null };
  }

  return { role, name: name?.trim() || null, email: null, timezone: null, id: null };
}
