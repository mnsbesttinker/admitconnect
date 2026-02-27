export type AppRole = "student" | "tutor" | "admin";

export type RequestIdentity = {
  role: AppRole | null;
  name: string | null;
};

export function readIdentityFromHeaders(headers: Headers): RequestIdentity {
  const role = headers.get("x-user-role") as AppRole | null;
  const name = headers.get("x-user-name");

  if (!role || !["student", "tutor", "admin"].includes(role)) {
    return { role: null, name: name?.trim() || null };
  }

  return { role, name: name?.trim() || null };
}
