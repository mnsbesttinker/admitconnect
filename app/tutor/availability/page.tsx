"use client";

import { FormEvent, useEffect, useState } from "react";

type Slot = {
  id: string;
  startTimeUtc: string;
  endTimeUtc: string;
  isBooked: boolean;
};

export default function TutorAvailabilityPage() {
  const [status, setStatus] = useState("Ready");
  const [slots, setSlots] = useState<Slot[]>([]);

  async function loadSlots() {
    const response = await fetch("/api/availability", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      setSlots([]);
      setStatus(payload.error || "Failed to load slots");
      return;
    }

    setSlots(payload.data as Slot[]);
  }

  useEffect(() => {
    void loadSlots();
  }, []);

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
    if (!response.ok) {
      setStatus(payload.error || "Failed to create slot");
      return;
    }

    setStatus("Slot created");
    event.currentTarget.reset();
    await loadSlots();
  }

  return <div className="container"><h1>Tutor availability</h1><form className="card form-grid" onSubmit={handleSubmit}>
    <label>Start local datetime<input type="datetime-local" name="startLocal" required /></label>
    <label>End local datetime<input type="datetime-local" name="endLocal" required /></label>
    <button className="btn" type="submit">Add slot</button>
  </form><p><strong>Status:</strong> {status}</p>
    <section className="card" style={{ marginTop: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Open slots ({slots.length})</h3>
      {slots.length === 0 && <p className="muted">No slots created yet.</p>}
      {slots.map((slot) => (
        <p key={slot.id}>
          {new Date(slot.startTimeUtc).toLocaleString()} → {new Date(slot.endTimeUtc).toLocaleTimeString()}
        </p>
      ))}
    </section>
  </div>;
}
