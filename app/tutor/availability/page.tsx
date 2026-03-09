"use client";

import { FormEvent, useState } from "react";

export default function TutorAvailabilityPage() {
  const [status, setStatus] = useState("Ready");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startLocal = String(form.get("startLocal") || "");
    const endLocal = String(form.get("endLocal") || "");

    const startUtc = new Date(startLocal).toISOString();
    const endUtc = new Date(endLocal).toISOString();

    const response = await fetch("/api/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startTimeUtc: startUtc, endTimeUtc: endUtc })
    });

    const payload = await response.json();
    setStatus(response.ok ? "Slot created" : payload.error || "Failed to create slot");
  }

  return <div className="container"><h1>Tutor availability</h1><form className="card form-grid" onSubmit={handleSubmit}>
    <label>Start local datetime<input type="datetime-local" name="startLocal" required /></label>
    <label>End local datetime<input type="datetime-local" name="endLocal" required /></label>
    <button className="btn" type="submit">Add slot</button>
  </form><p><strong>Status:</strong> {status}</p></div>;
}
