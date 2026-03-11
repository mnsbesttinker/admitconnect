"use client";

import { FormEvent, useEffect, useState } from "react";

type Viewer = { name: string | null; email?: string | null; role: "student" | "tutor" | "admin" | null } | null;

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
    <div className="container">
      <h1>Student Messages</h1>
      <p className="muted">Students initiate contact. Tutors can only reply after a thread exists.</p>
      <form className="card" onSubmit={startThread} style={{ display: "grid", gap: "0.7rem" }}>
        <input value={viewer?.name || ""} placeholder="Your name" disabled readOnly />
        <input name="tutorId" placeholder="Tutor ID (e.g. nora-mit)" required />
        <textarea name="text" placeholder="Your first message" required rows={3} />
        <button type="submit" className="btn">Start conversation</button>
      </form>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}
