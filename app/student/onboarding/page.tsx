"use client";

import { FormEvent, useState } from "react";

export default function StudentOnboardingPage() {
  const [status, setStatus] = useState("Ready");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/profiles/student", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        country: String(form.get("country") || ""),
        intendedMajor: String(form.get("intendedMajor") || ""),
        curriculum: String(form.get("curriculum") || ""),
        satScore: form.get("satScore") ? Number(form.get("satScore")) : null
      })
    });

    const payload = await response.json();
    setStatus(response.ok ? "Student profile saved" : payload.error || "Failed to save profile");
  }

  return <div className="container"><h1>Student onboarding</h1><form className="card form-grid" onSubmit={handleSubmit}>
    <input name="country" placeholder="Country" />
    <input name="intendedMajor" placeholder="Intended major" />
    <input name="curriculum" placeholder="Curriculum" />
    <input name="satScore" type="number" placeholder="SAT score" min={400} max={1600} />
    <button className="btn" type="submit">Save profile</button>
  </form><p><strong>Status:</strong> {status}</p></div>;
}
