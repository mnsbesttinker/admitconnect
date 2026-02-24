"use client";

import { FormEvent, useState } from "react";

export default function TutorMessagesPage() {
  const [status, setStatus] = useState("Ready");

  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const threadId = String(form.get("threadId") ?? "");
    const payload = {
      senderRole: "tutor",
      senderName: String(form.get("senderName") ?? ""),
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
        <input name="senderName" placeholder="Tutor display name" required />
        <textarea name="text" placeholder="Reply message" required rows={3} />
        <button type="submit" className="btn">Send reply</button>
      </form>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}
