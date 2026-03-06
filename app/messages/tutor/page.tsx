"use client";

import { FormEvent, useEffect, useState } from "react";

type Viewer = { name: string | null; email?: string | null; role: "student" | "tutor" | "admin" | null } | null;

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
    <div className="container">
      <h1>Tutor Messages</h1>
      <p className="muted">Tutors can reply only in student-initiated threads.</p>
      <form className="card" onSubmit={reply} style={{ display: "grid", gap: "0.7rem" }}>
        <input name="threadId" placeholder="Thread ID" required />
        <input value={viewer?.name || ""} placeholder="Tutor display name" disabled readOnly />
        <textarea name="text" placeholder="Reply message" required rows={3} />
        <button type="submit" className="btn">Send reply</button>
      </form>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}
