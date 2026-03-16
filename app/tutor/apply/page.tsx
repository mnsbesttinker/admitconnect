"use client";

import { FormEvent, useMemo, useState } from "react";
import { MEDAL_RANKS, MEDAL_SUBJECTS, TUTOR_TAG_OPTIONS } from "@/lib/tutor-tags";

const medalDefaultSelections = Object.fromEntries(MEDAL_SUBJECTS.map((subject) => [subject.id, "none"])) as Record<string, "none" | (typeof MEDAL_RANKS)[number]>;

export default function TutorApplyPage() {
  const [status, setStatus] = useState("Ready to submit");
  const [selectedTags, setSelectedTags] = useState<string[]>(["need-based-scholarship", "full-ride"]);
  const [satScore, setSatScore] = useState("");
  const [ibScore, setIbScore] = useState("");
  const [gpaScore, setGpaScore] = useState("");
  const [medalSelections, setMedalSelections] = useState(medalDefaultSelections);

  const normalizedTags = useMemo(() => {
    const tags = new Set<string>(selectedTags);

    if (satScore) {
      tags.add(`sat-${satScore}/1600`);
    }

    if (ibScore) {
      tags.add(`ib-${ibScore}/45`);
    }

    if (gpaScore) {
      tags.add(`gpa-${gpaScore}/4.0`);
    }

    for (const [subjectId, rank] of Object.entries(medalSelections)) {
      if (rank !== "none") {
        tags.add(`medal-${subjectId}-${rank}`);
      }
    }

    return Array.from(tags);
  }, [selectedTags, satScore, ibScore, gpaScore, medalSelections]);

  function toggleTag(tagId: string, checked: boolean) {
    setSelectedTags((prev) => {
      if (checked) {
        return prev.includes(tagId) ? prev : [...prev, tagId];
      }

      return prev.filter((tag) => tag !== tagId);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    if (normalizedTags.length === 0) {
      setStatus("Select at least one tutor tag before submitting.");
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
    setSelectedTags([]);
    setSatScore("");
    setIbScore("");
    setGpaScore("");
    setMedalSelections(medalDefaultSelections);
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

        <section>
          <h3 style={{ marginBottom: "0.4rem" }}>Tutor tags</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.35rem" }}>
            {TUTOR_TAG_OPTIONS.map((option) => (
              <label key={option.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={selectedTags.includes(option.id)}
                  onChange={(event) => toggleTag(option.id, event.target.checked)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: "0.4rem" }}>Integer scores</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.5rem" }}>
            <label>
              SAT (X/1600)
              <input type="number" min={400} max={1600} step={1} value={satScore} onChange={(event) => setSatScore(event.target.value)} placeholder="e.g. 1540" />
            </label>
            <label>
              IB (X/45)
              <input type="number" min={1} max={45} step={1} value={ibScore} onChange={(event) => setIbScore(event.target.value)} placeholder="e.g. 42" />
            </label>
            <label>
              GPA (X/4.0)
              <input type="number" min={1} max={4} step={1} value={gpaScore} onChange={(event) => setGpaScore(event.target.value)} placeholder="e.g. 4" />
            </label>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: "0.4rem" }}>Medal ranks by subject</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.5rem" }}>
            {MEDAL_SUBJECTS.map((subject) => (
              <label key={subject.id}>
                {subject.label}
                <select
                  value={medalSelections[subject.id]}
                  onChange={(event) => {
                    const next = event.target.value as "none" | (typeof MEDAL_RANKS)[number];
                    setMedalSelections((prev) => ({ ...prev, [subject.id]: next }));
                  }}
                >
                  <option value="none">No medal</option>
                  {MEDAL_RANKS.map((rank) => <option key={rank} value={rank}>{rank[0].toUpperCase() + rank.slice(1)}</option>)}
                </select>
              </label>
            ))}
          </div>
        </section>

        <input name="credibilityTags" type="hidden" value={normalizedTags.join(",")} readOnly />

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
