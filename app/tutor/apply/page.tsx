"use client";

import { FormEvent, useMemo, useState } from "react";
import { MEDAL_RANKS, MEDAL_SUBJECTS, TUTOR_TAG_OPTIONS } from "@/lib/tutor-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const medalDefaultSelections = Object.fromEntries(MEDAL_SUBJECTS.map((subject) => [subject.id, "none"])) as Record<string, "none" | (typeof MEDAL_RANKS)[number]>;

const selectClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const textareaClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="mx-auto max-w-5xl bg-white">
        <CardHeader>
          <CardTitle>Tutor Application</CardTitle>
          <CardDescription>
            Create your profile, set your hourly rate, and upload identity + credential files for admin verification.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" placeholder="Full name" required minLength={2} maxLength={80} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="university">University</Label>
                <Input id="university" name="university" placeholder="University" required minLength={2} maxLength={120} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="graduationYear">Graduation year</Label>
                <Input
                  id="graduationYear"
                  name="graduationYear"
                  type="number"
                  min={2010}
                  max={2035}
                  placeholder="Graduation year"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="major">Major</Label>
                <Input id="major" name="major" placeholder="Major" required minLength={2} maxLength={80} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Short bio</Label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Short bio"
                required
                rows={3}
                minLength={40}
                maxLength={500}
                className={textareaClassName}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="hourlyRateUsd">Hourly rate (USD, 10-300)</Label>
                <Input id="hourlyRateUsd" name="hourlyRateUsd" type="number" min={10} max={300} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input id="languages" name="languages" placeholder="Languages (comma-separated)" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="offeringSummary">What you offer students</Label>
              <textarea
                id="offeringSummary"
                name="offeringSummary"
                placeholder="What you offer students"
                required
                rows={3}
                minLength={40}
                maxLength={500}
                className={textareaClassName}
              />
            </div>

            <section className="grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Tutor tags</h3>
                <Badge variant="outline">Selected: {selectedTags.length}</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {TUTOR_TAG_OPTIONS.map((option) => (
                  <label key={option.id} className="flex items-center gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm">
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

            <section className="grid gap-3">
              <h3 className="text-lg font-semibold">Integer scores</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="satScore">SAT (X/1600)</Label>
                  <Input
                    id="satScore"
                    type="number"
                    min={400}
                    max={1600}
                    step={1}
                    value={satScore}
                    onChange={(event) => setSatScore(event.target.value)}
                    placeholder="e.g. 1540"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ibScore">IB (X/45)</Label>
                  <Input
                    id="ibScore"
                    type="number"
                    min={1}
                    max={45}
                    step={1}
                    value={ibScore}
                    onChange={(event) => setIbScore(event.target.value)}
                    placeholder="e.g. 42"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gpaScore">GPA (X/4.0)</Label>
                  <Input
                    id="gpaScore"
                    type="number"
                    min={1}
                    max={4}
                    step={1}
                    value={gpaScore}
                    onChange={(event) => setGpaScore(event.target.value)}
                    placeholder="e.g. 4"
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-3">
              <h3 className="text-lg font-semibold">Medal ranks by subject</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {MEDAL_SUBJECTS.map((subject) => (
                  <div key={subject.id} className="grid gap-2">
                    <Label htmlFor={`subject-${subject.id}`}>{subject.label}</Label>
                    <select
                      id={`subject-${subject.id}`}
                      value={medalSelections[subject.id]}
                      onChange={(event) => {
                        const next = event.target.value as "none" | (typeof MEDAL_RANKS)[number];
                        setMedalSelections((prev) => ({ ...prev, [subject.id]: next }));
                      }}
                      className={selectClassName}
                    >
                      <option value="none">No medal</option>
                      {MEDAL_RANKS.map((rank) => (
                        <option key={rank} value={rank}>
                          {rank[0].toUpperCase() + rank.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>

            <input name="credibilityTags" type="hidden" value={normalizedTags.join(",")} readOnly />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="profilePhoto">Profile photo (required, JPG/PNG/WEBP)</Label>
                <input
                  id="profilePhoto"
                  name="profilePhoto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="credentialDocuments">Credential documents (required, PDFs; multiple allowed)</Label>
                <input
                  id="credentialDocuments"
                  name="credentialDocuments"
                  type="file"
                  accept="application/pdf"
                  multiple
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              Submit for verification
            </Button>
          </form>

          <p className="mt-4 text-sm">
            <span className="font-semibold">Status:</span> {status}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
