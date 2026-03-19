"use client";

import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="mx-auto max-w-2xl bg-white">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-black tracking-tight sm:text-3xl">Student onboarding</CardTitle>
          <CardDescription className="text-sm leading-6 sm:text-base">
            Share your academic context so tutors can personalize support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form id="student-onboarding-form" className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
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
          </form>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={status === "Student profile saved" ? "secondary" : "outline"}>{status}</Badge>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-5">
          <Button
            type="submit"
            form="student-onboarding-form"
            className="w-full bg-blue-600 font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            Save profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
