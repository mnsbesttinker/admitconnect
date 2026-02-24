"use client";

import { FormEvent, useState } from "react";

export default function StudentMessagesPage() {
  const [status, setStatus] = useState("Ready");

  async function startThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      studentName: String(form.get("studentName") ?? ""),
      tutorId: String(form.get("tutorId") ?? ""),
      text: String(form.get("text") ?? ""),
      senderRole: "student"
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
        <input name="studentName" placeholder="Your name" required />
        <input name="tutorId" placeholder="Tutor ID (e.g. nora-mit)" required />
        <textarea name="text" placeholder="Your first message" required rows={3} />
        <button type="submit" className="btn">Start conversation</button>
      </form>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}
