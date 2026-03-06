import { createHash, createHmac } from "node:crypto";

export type AppRole = "student" | "tutor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AppRole;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
};

type AuthState = {
  users: AuthUser[];
  sessions: Record<string, string>;
};

const authGlobal = globalThis as typeof globalThis & { __admitConnectAuthState?: AuthState };
const SESSION_HMAC_SECRET = process.env.ADMITCONNECT_SESSION_SECRET || "dev-session-secret-change-me";

if (!authGlobal.__admitConnectAuthState) {
  authGlobal.__admitConnectAuthState = {
    users: [
      {
        id: "seed-admin-1",
        name: "Platform Admin",
        email: "admin@admitconnect.dev",
        passwordHash: hashPassword("admin123"),
        role: "admin",
        createdAt: new Date().toISOString()
      }
    ],
    sessions: {}
  };
}

const state = authGlobal.__admitConnectAuthState;

function hashPassword(password: string) {
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

function createSessionToken(user: SessionUser) {
  const payload = JSON.stringify({ ...user, iat: Date.now() });
  const payloadEncoded = toBase64Url(payload);
  const signature = signPayload(payloadEncoded);
  return `v1.${payloadEncoded}.${signature}`;
}

function parseSessionToken(token: string): SessionUser | null {
  const [version, payloadEncoded, signature] = token.split(".");
  if (version !== "v1" || !payloadEncoded || !signature) {
    return null;
  }

  if (signPayload(payloadEncoded) !== signature) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(payloadEncoded)) as Partial<SessionUser>;
  if (!payload.id || !payload.name || !payload.email || !payload.role) {
    return null;
  }

  if (!["student", "tutor", "admin"].includes(payload.role)) {
    return null;
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role
  };
}

export function signup(input: { name: string; email: string; password: string; role: AppRole }) {
  const existing = state.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (existing) {
    return null;
  }

  const user: AuthUser = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: hashPassword(input.password),
    role: input.role,
    createdAt: new Date().toISOString()
  };

  state.users.push(user);
  return user;
}

export function login(email: string, password: string) {
  const user = state.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.passwordHash === hashPassword(password));
  if (!user) {
    return null;
  }

  const token = createSessionToken({ id: user.id, name: user.name, email: user.email, role: user.role });
  state.sessions[token] = user.id;
  return { user, token };
}

export function getUserFromToken(token: string | undefined): SessionUser | null {
  if (!token) {
    return null;
  }

  const statelessUser = parseSessionToken(token);
  if (statelessUser) {
    return statelessUser;
  }

  const userId = state.sessions[token];
  if (!userId) {
    return null;
  }

  const entry = state.users.find((user) => user.id === userId);
  if (!entry) {
    return null;
  }

  return { id: entry.id, name: entry.name, email: entry.email, role: entry.role };
}

export function logout(token: string | undefined) {
  if (token && state.sessions[token]) {
    delete state.sessions[token];
  }
}
