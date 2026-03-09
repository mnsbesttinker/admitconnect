"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error || "Login failed");
      return;
    }

    setSuccess("Logged in successfully. Redirecting...");
    router.refresh();
    setTimeout(() => {
      router.push("/");
    }, 600);
  }

  return (
    <div className="container">
      <h1>Login</h1>
      <section className="card auth-card">
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          {error && <p style={{ color: "#b10033", margin: 0 }}>{error}</p>}
          {success && <p style={{ color: "#1f7a3f", margin: 0 }}>{success}</p>}
        </form>
      </section>
    </div>
  );
}
