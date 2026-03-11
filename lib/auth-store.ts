import { createHash, createHmac } from "node:crypto";

export type AppRole = "student" | "tutor" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  timezone: string;
};

const SESSION_HMAC_SECRET = process.env.ADMITCONNECT_SESSION_SECRET || "dev-session-secret-change-me";

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payloadEncoded: string) {
  return createHmac("sha256", SESSION_HMAC_SECRET).update(payloadEncoded).digest("base64url");
}

export function createSessionToken(user: SessionUser) {
  const payload = JSON.stringify({ ...user, iat: Date.now() });
  const payloadEncoded = toBase64Url(payload);
  const signature = signPayload(payloadEncoded);
  return `v1.${payloadEncoded}.${signature}`;
}

export function getUserFromToken(token: string | undefined): SessionUser | null {
  if (!token) {
    return null;
  }

  const [version, payloadEncoded, signature] = token.split(".");
  if (version !== "v1" || !payloadEncoded || !signature) {
    return null;
  }

  if (signPayload(payloadEncoded) !== signature) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(payloadEncoded)) as Partial<SessionUser>;
  if (!payload.id || !payload.name || !payload.email || !payload.role || !payload.timezone) {
    return null;
  }

  if (!(["student", "tutor", "admin"] as const).includes(payload.role)) {
    return null;
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    timezone: payload.timezone
  };
}

export function logout() {
  return;
}
