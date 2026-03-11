"use client";

import { FormEvent, useState } from "react";

export default function TutorOnboardingPage() {
  const [status, setStatus] = useState("Ready");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/profiles/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        school: String(form.get("school") || ""),
        major: String(form.get("major") || ""),
        bio: String(form.get("bio") || ""),
        specialties: String(form.get("specialties") || ""),
        hourlyRate: Number(form.get("hourlyRate") || 0)
      })
    });

    const payload = await response.json();
    setStatus(response.ok ? "Tutor profile saved" : payload.error || "Failed to save profile");
  }

  return <div className="container"><h1>Tutor onboarding</h1><form className="card form-grid" onSubmit={handleSubmit}>
    <input name="school" placeholder="School" required />
    <input name="major" placeholder="Major" required />
    <textarea name="bio" placeholder="Bio" required rows={4} />
    <input name="specialties" placeholder="Specialties (comma separated)" required />
    <input name="hourlyRate" type="number" placeholder="Hourly rate (USD)" required min={1} />
    <button className="btn" type="submit">Save profile</button>
  </form><p><strong>Status:</strong> {status}</p></div>;
}
