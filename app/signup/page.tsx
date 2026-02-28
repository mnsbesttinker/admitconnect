"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const roles = ["student", "tutor"] as const;

type Role = (typeof roles)[number];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error || "Sign-up failed");
      return;
    }

    setSuccess("Account created. You can now login.");
    setTimeout(() => {
      router.push("/login");
    }, 800);
  }

  return (
    <div className="container">
      <h1>Create an account</h1>
      <p className="muted">Admin accounts are provisioned internally.</p>
      <section className="card auth-card">
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Full name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              {roles.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <button className="btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
          {error && <p style={{ color: "#b10033", margin: 0 }}>{error}</p>}
          {success && <p style={{ color: "#1f7a3f", margin: 0 }}>{success}</p>}
        </form>
      </section>
    </div>
  );
}
