"use client";

import { FormEvent, useState } from "react";

export default function TutorApplyPage() {
  const [status, setStatus] = useState("Ready to submit");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get("name") ?? ""),
      university: String(form.get("university") ?? ""),
      graduationYear: Number(form.get("graduationYear") ?? 0),
      major: String(form.get("major") ?? ""),
      bio: String(form.get("bio") ?? ""),
      languages: String(form.get("languages") ?? "").split(",").map((v) => v.trim()).filter(Boolean),
      credibilityTags: String(form.get("credibilityTags") ?? "").split(",").map((v) => v.trim()).filter(Boolean),
      hourlyRateUsd: Number(form.get("hourlyRateUsd") ?? 0),
      offeringSummary: String(form.get("offeringSummary") ?? ""),
      credentialDocuments: String(form.get("credentialDocuments") ?? "").split("\n").map((v) => v.trim()).filter(Boolean)
    };

    setStatus("Submitting application...");
    const response = await fetch("/api/mentors/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Submission failed");
      return;
    }

    setStatus(`Submitted for verification: ${data.data.id}`);
    event.currentTarget.reset();
  }

  return (
    <div className="container">
      <h1>Tutor Application</h1>
      <p className="muted">Create your profile, set your hourly rate, and attach proof document links for admin verification.</p>
      <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <input name="name" placeholder="Full name" required />
        <input name="university" placeholder="University" required />
        <input name="graduationYear" type="number" placeholder="Graduation year" required />
        <input name="major" placeholder="Major" required />
        <textarea name="bio" placeholder="Short bio" required rows={3} />
        <input name="hourlyRateUsd" type="number" min={1} placeholder="Hourly rate (USD)" required />
        <textarea name="offeringSummary" placeholder="What you offer students" required rows={3} />
        <input name="languages" placeholder="Languages (comma-separated)" required />
        <input name="credibilityTags" placeholder="Credibility tags (comma-separated)" required />
        <textarea name="credentialDocuments" placeholder="Credential document URLs (one per line)" required rows={3} />
        <button type="submit" className="btn">Submit for verification</button>
      </form>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}
