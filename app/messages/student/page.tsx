"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Viewer = { name: string | null; email?: string | null; role: "student" | "tutor" | "admin" | null } | null;

const textareaClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function StudentMessagesPage() {
  const [status, setStatus] = useState("Ready");
  const [viewer, setViewer] = useState<Viewer>(null);

  useEffect(() => {
    async function loadViewer() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setStatus("Please login as a student to start a conversation.");
        return;
      }

      const payload = (await response.json()) as { data: Viewer };
      setViewer(payload.data);

      if (payload.data?.role !== "student") {
        setStatus("Only student accounts can initiate new conversations.");
      }
    }

    void loadViewer();
  }, []);

  async function startThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!viewer || viewer.role !== "student") {
      setStatus("Only student accounts can initiate new conversations.");
      return;
    }

    const form = new FormData(event.currentTarget);

    const payload = {
      tutorId: String(form.get("tutorId") ?? ""),
      text: String(form.get("text") ?? "")
    };

    const response = await fetch("/api/chat/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setStatus(response.ok ? `Thread started: ${data.data.id}` : data.error ?? "Failed to start thread");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="mx-auto max-w-3xl bg-white">
        <CardHeader>
          <CardTitle>Student Messages</CardTitle>
          <CardDescription>Students initiate contact. Tutors can only reply after a thread exists.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-4" onSubmit={startThread}>
            <div className="grid gap-2">
              <Label htmlFor="studentName">Your name</Label>
              <Input id="studentName" value={viewer?.name || ""} placeholder="Your name" disabled readOnly />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tutorId">Tutor ID</Label>
              <Input id="tutorId" name="tutorId" placeholder="Tutor ID (e.g. nora-mit)" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="text">First message</Label>
              <textarea id="text" name="text" placeholder="Your first message" required rows={3} className={textareaClassName} />
            </div>

            <Button type="submit" className="w-full md:w-auto">
              Start conversation
            </Button>
          </form>

          <p className="text-sm">
            <span className="font-semibold">Status:</span> {status}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
