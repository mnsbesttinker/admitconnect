"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Student onboarding</CardTitle>
          <CardDescription>Share your academic context so tutors can personalize support.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" placeholder="Country" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="intendedMajor">Intended major</Label>
              <Input id="intendedMajor" name="intendedMajor" placeholder="Intended major" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="curriculum">Curriculum</Label>
              <Input id="curriculum" name="curriculum" placeholder="Curriculum" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="satScore">SAT score (optional)</Label>
              <Input id="satScore" name="satScore" type="number" placeholder="SAT score" min={400} max={1600} />
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Save profile
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
