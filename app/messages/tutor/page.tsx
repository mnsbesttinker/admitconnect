"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Viewer = { name: string | null; email?: string | null; role: "student" | "tutor" | "admin" | null } | null;

const textareaClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export default function TutorMessagesPage() {
  const [status, setStatus] = useState("Ready");
  const [viewer, setViewer] = useState<Viewer>(null);

  useEffect(() => {
    async function loadViewer() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setStatus("Please login as a tutor to reply.");
        return;
      }

      const payload = (await response.json()) as { data: Viewer };
      setViewer(payload.data);

      if (payload.data?.role !== "tutor") {
        setStatus("Only tutor accounts can send tutor replies.");
      }
    }

    void loadViewer();
  }, []);

  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!viewer || viewer.role !== "tutor") {
      setStatus("Only tutor accounts can send tutor replies.");
      return;
    }

    const form = new FormData(event.currentTarget);

    const threadId = String(form.get("threadId") ?? "");
    const payload = {
      text: String(form.get("text") ?? "")
    };

    const response = await fetch(`/api/chat/threads/${threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setStatus(response.ok ? `Reply sent in thread ${threadId}` : data.error ?? "Reply failed");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="mx-auto max-w-3xl bg-white">
        <CardHeader>
          <CardTitle>Tutor Messages</CardTitle>
          <CardDescription>Tutors can reply only in student-initiated threads.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <form className="grid gap-4" onSubmit={reply}>
            <div className="grid gap-2">
              <Label htmlFor="threadId">Thread ID</Label>
              <Input id="threadId" name="threadId" placeholder="Thread ID" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tutorName">Tutor display name</Label>
              <Input id="tutorName" value={viewer?.name || ""} placeholder="Tutor display name" disabled readOnly />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="text">Reply message</Label>
              <textarea id="text" name="text" placeholder="Reply message" required rows={3} className={textareaClassName} />
            </div>

            <Button type="submit" className="w-full md:w-auto">
              Send reply
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
