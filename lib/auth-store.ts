export type AppRole = "student" | "tutor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AppRole;
  createdAt: string;
};

type AuthState = {
  users: AuthUser[];
  sessions: Record<string, string>;
};

const authGlobal = globalThis as typeof globalThis & { __admitConnectAuthState?: AuthState };

if (!authGlobal.__admitConnectAuthState) {
  authGlobal.__admitConnectAuthState = {
    users: [
      {
        id: "seed-admin-1",
        name: "Platform Admin",
        email: "admin@admitconnect.dev",
        password: "admin123",
        role: "admin",
        createdAt: new Date().toISOString()
      }
    ],
    sessions: {}
  };
}

const state = authGlobal.__admitConnectAuthState;

export function signup(input: { name: string; email: string; password: string; role: AppRole }) {
  const existing = state.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (existing) {
    return null;
  }

  const user: AuthUser = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    createdAt: new Date().toISOString()
  };

  state.users.push(user);
  return user;
}

export function login(email: string, password: string) {
  const user = state.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);
  if (!user) {
    return null;
  }

  const token = crypto.randomUUID();
  state.sessions[token] = user.id;
  return { user, token };
}

export function getUserFromToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const userId = state.sessions[token];
  if (!userId) {
    return null;
  }

  return state.users.find((entry) => entry.id === userId) ?? null;
}

export function logout(token: string | undefined) {
  if (token && state.sessions[token]) {
    delete state.sessions[token];
  }
}
