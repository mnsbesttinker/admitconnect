"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const roles = ["student", "tutor"] as const;
type Role = (typeof roles)[number];

export default function SignupPage() {
  const router = useRouter();
  const timezoneGuess = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [timezone, setTimezone] = useState(timezoneGuess);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const signupRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password, role, timezone })
    });

    if (!signupRes.ok) {
      const payload = (await signupRes.json()) as { error?: string };
      setError(payload.error || "Sign-up failed");
      setIsSubmitting(false);
      return;
    }

    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setIsSubmitting(false);

    if (!loginRes.ok) {
      setError("Account created but auto-login failed. Please login manually.");
      router.push("/login");
      return;
    }

    router.push(role === "tutor" ? "/tutor/onboarding" : "/student/onboarding");
  }

  return (
    <div className="container">
      <h1>Create an account</h1>
      <section className="card auth-card">
        <form onSubmit={handleSubmit} className="form-grid">
          <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <label>Role
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              {roles.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
          </label>
          <label>Timezone<input value={timezone} onChange={(event) => setTimezone(event.target.value)} required /></label>
          <button className="btn" disabled={isSubmitting} type="submit">{isSubmitting ? "Creating..." : "Sign up"}</button>
          {error && <p style={{ color: "#b10033", margin: 0 }}>{error}</p>}
        </form>
      </section>
    </div>
  );
}
