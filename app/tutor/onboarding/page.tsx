"use client";

import { FormEvent, useMemo, useState } from "react";
import { MEDAL_RANKS, MEDAL_SUBJECTS, TUTOR_TAG_OPTIONS } from "@/lib/tutor-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const medalDefaults = Object.fromEntries(MEDAL_SUBJECTS.map((subject) => [subject.id, "none"])) as Record<string, "none" | (typeof MEDAL_RANKS)[number]>;

const selectClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const textareaClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="mx-auto max-w-5xl bg-white">
        <CardHeader className="grid gap-3">
          <CardTitle className="text-3xl font-black tracking-tight">Tutor onboarding</CardTitle>
          <CardDescription className="text-base leading-7">
            Build your profile and specialties so students can quickly understand your strengths.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="school">School</Label>
                <Input id="school" name="school" placeholder="School" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="major">Major</Label>
                <Input id="major" name="major" placeholder="Major" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea id="bio" name="bio" placeholder="Bio" required rows={4} className={textareaClassName} />
            </div>

            <section className="grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold">Tutor tags</h3>
                <Badge variant="outline">Selected: {selectedTags.length}</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
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
              <h3 className="text-lg font-bold">Integer scores</h3>
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
              <h3 className="text-lg font-bold">Medal ranks by subject</h3>
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

            <div className="grid gap-2 md:max-w-sm">
              <Label htmlFor="hourlyRate">Hourly rate (USD)</Label>
              <Input id="hourlyRate" name="hourlyRate" type="number" placeholder="Hourly rate (USD)" required min={1} />
            </div>

            <Button type="submit" className="w-full bg-blue-600 font-semibold text-white hover:bg-blue-700 md:w-auto">
              Save profile
            </Button>
          </form>

          <p className="mt-5 text-base">
            <span className="font-semibold">Status:</span> {status}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
