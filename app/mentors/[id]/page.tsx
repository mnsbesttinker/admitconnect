"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = { id: string; startTimeUtc: string; endTimeUtc: string };
type Tutor = {
  id: string;
  fullName: string;
  school: string;
  major: string;
  bio: string;
  specialties: string;
  hourlyRate: number;
  slots: Slot[];
};

type Viewer = { timezone?: string | null; role: "student" | "tutor" | null } | null;

export default function MentorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    async function load() {
      const [tutorRes, meRes] = await Promise.all([
        fetch(`/api/tutors/${params.id}`, { cache: "no-store" }),
        fetch("/api/auth/me", { cache: "no-store" })
      ]);
      const tutorPayload = await tutorRes.json();
      if (tutorRes.ok) {
        setTutor(tutorPayload.data as Tutor);
      }

      if (meRes.ok) {
        const me = (await meRes.json()) as { data: Viewer };
        setViewer(me.data);
      }
    }

    void load();
  }, [params.id]);

  async function bookSlot(slotId: string) {
    setStatus("Booking...");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slotId })
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Booking failed");
      return;
    }

    router.push(`/bookings/success/${payload.data.id}`);
  }

  const zone = viewer?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  if (!tutor) {
    return <div className="container"><p>Loading tutor...</p></div>;
  }

  return (
    <div className="container">
      <Link href="/mentors" className="muted">← Back to tutors</Link>
      <section className="card" style={{ marginTop: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>{tutor.fullName}</h1>
        <p className="muted">{tutor.school} · {tutor.major}</p>
        <p>{tutor.bio}</p>
        <p><strong>Specialties:</strong> {tutor.specialties}</p>
        <p><strong>Rate:</strong> ${tutor.hourlyRate}/hr</p>

        <h3>Available slots ({zone})</h3>
        {tutor.slots.length === 0 && <p className="muted">No slots available right now.</p>}
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {tutor.slots.map((slot) => (
            <div key={slot.id} className="card">
              <p style={{ marginTop: 0 }}>
                {new Date(slot.startTimeUtc).toLocaleString([], { timeZone: zone })} → {new Date(slot.endTimeUtc).toLocaleTimeString([], { timeZone: zone })}
              </p>
              <button className="btn" disabled={viewer?.role !== "student"} onClick={() => bookSlot(slot.id)}>Book this slot</button>
            </div>
          ))}
        </div>

        <p style={{ marginTop: "1rem" }}><strong>Status:</strong> {status}</p>
      </section>
    </div>
  );
}
