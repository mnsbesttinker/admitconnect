"use client";

import { FormEvent, useMemo, useState } from "react";
import { MEDAL_RANKS, MEDAL_SUBJECTS, TUTOR_TAG_OPTIONS } from "@/lib/tutor-tags";

const medalDefaults = Object.fromEntries(MEDAL_SUBJECTS.map((subject) => [subject.id, "none"])) as Record<string, "none" | (typeof MEDAL_RANKS)[number]>;

export default function TutorOnboardingPage() {
  const [status, setStatus] = useState("Ready");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [satScore, setSatScore] = useState("");
  const [ibScore, setIbScore] = useState("");
  const [gpaScore, setGpaScore] = useState("");
  const [medalSelections, setMedalSelections] = useState(medalDefaults);

  const specialtyTags = useMemo(() => {
    const tags = new Set<string>(selectedTags);

    if (satScore) tags.add(`sat-${satScore}/1600`);
    if (ibScore) tags.add(`ib-${ibScore}/45`);
    if (gpaScore) tags.add(`gpa-${gpaScore}/4.0`);

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

    if (specialtyTags.length === 0) {
      setStatus("Please select at least one tutor tag/specialty.");
      return;
    }

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/profiles/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        school: String(form.get("school") || ""),
        major: String(form.get("major") || ""),
        bio: String(form.get("bio") || ""),
        specialties: specialtyTags.join(","),
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

    <section>
      <h3 style={{ marginBottom: "0.4rem" }}>Tutor tags</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.35rem" }}>
        {TUTOR_TAG_OPTIONS.map((option) => (
          <label key={option.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" checked={selectedTags.includes(option.id)} onChange={(event) => toggleTag(option.id, event.target.checked)} />
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
            <select value={medalSelections[subject.id]} onChange={(event) => {
              const next = event.target.value as "none" | (typeof MEDAL_RANKS)[number];
              setMedalSelections((prev) => ({ ...prev, [subject.id]: next }));
            }}>
              <option value="none">No medal</option>
              {MEDAL_RANKS.map((rank) => <option key={rank} value={rank}>{rank[0].toUpperCase() + rank.slice(1)}</option>)}
            </select>
          </label>
        ))}
      </div>
    </section>

    <input name="hourlyRate" type="number" placeholder="Hourly rate (USD)" required min={1} />
    <button className="btn" type="submit">Save profile</button>
  </form><p><strong>Status:</strong> {status}</p></div>;
}
