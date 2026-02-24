"use client";

import { FormEvent, useMemo, useState } from "react";

const allowedCredibilityTags = [
  "full-ride",
  "need-based",
  "merit",
  "t20",
  "first-gen",
  "stem",
  "essay-strategy",
  "interview-prep"
] as const;

function normalizeTags(raw: string) {
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export default function TutorApplyPage() {
  const [status, setStatus] = useState("Ready to submit");
  const [credibilityTagsInput, setCredibilityTagsInput] = useState("need-based, full-ride");
  const normalizedTags = useMemo(() => normalizeTags(credibilityTagsInput), [credibilityTagsInput]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const invalidTag = normalizedTags.find((tag) => !allowedCredibilityTags.includes(tag as (typeof allowedCredibilityTags)[number]));
    if (invalidTag) {
      setStatus(`Invalid credibility tag: ${invalidTag}. Use only the allowed list shown below.`);
      return;
    }

    form.set("credibilityTags", normalizedTags.join(","));

    setStatus("Submitting application...");
    const response = await fetch("/api/mentors/onboard", {
      method: "POST",
      body: form
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Submission failed");
      return;
    }

    setStatus(`Submitted for verification: ${data.data.id}`);
    formElement.reset();
    setCredibilityTagsInput("");
  }

  return (
    <div className="container">
      <h1>Tutor Application</h1>
      <p className="muted">Create your profile, set your hourly rate, and upload identity + credential files for admin verification.</p>

      <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <input name="name" placeholder="Full name" required minLength={2} maxLength={80} />
        <input name="university" placeholder="University" required minLength={2} maxLength={120} />
        <input name="graduationYear" type="number" min={2010} max={2035} placeholder="Graduation year" required />
        <input name="major" placeholder="Major" required minLength={2} maxLength={80} />
        <textarea name="bio" placeholder="Short bio" required rows={3} minLength={40} maxLength={500} />
        <input name="hourlyRateUsd" type="number" min={10} max={300} placeholder="Hourly rate (USD, 10-300)" required />
        <textarea name="offeringSummary" placeholder="What you offer students" required rows={3} minLength={40} maxLength={500} />
        <input name="languages" placeholder="Languages (comma-separated)" required />

        <label>
          Credibility tags (comma-separated, standardized)
          <input
            name="credibilityTags"
            value={credibilityTagsInput}
            onChange={(event) => setCredibilityTagsInput(event.target.value)}
            placeholder="need-based, full-ride"
            required
          />
        </label>
        <p className="muted" style={{ marginTop: 0 }}>
          Allowed: {allowedCredibilityTags.join(", ")}
        </p>

        <label>
          Profile photo (required, JPG/PNG/WEBP)
          <input name="profilePhoto" type="file" accept="image/jpeg,image/png,image/webp" required />
        </label>

        <label>
          Credential documents (required, PDFs; multiple allowed)
          <input name="credentialDocuments" type="file" accept="application/pdf" multiple required />
        </label>

        <button type="submit" className="btn">Submit for verification</button>
      </form>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}
