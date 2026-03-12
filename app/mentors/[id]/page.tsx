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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const tutorRes = await fetch(`/api/tutors/${params.id}`, { cache: "no-store" });
        const tutorPayload = await tutorRes.json();

        if (!tutorRes.ok) {
          setTutor(null);
          setLoadError(tutorPayload.error || "Failed to load tutor profile.");
          setIsLoading(false);
          return;
        }

        setTutor(tutorPayload.data as Tutor);

        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (meRes.ok) {
          const me = (await meRes.json()) as { data: Viewer };
          setViewer(me.data);
        } else {
          setViewer(null);
        }
      } catch {
        setTutor(null);
        setLoadError("Failed to load tutor profile.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [params.id]);

  async function bookSlot(slotId: string) {
    setStatus("Booking...");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slotId }),
        signal: controller.signal
      });

      const payload = await response.json();
      if (!response.ok) {
        const detail = payload.detail ? ` (${payload.detail})` : "";
        setStatus((payload.error || "Booking failed") + detail);
        return;
      }

      router.push(`/bookings/success/${payload.data.id}`);
    } catch {
      setStatus("Booking request timed out. Please retry; if this persists, verify Google Calendar credentials.");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const zone = viewer?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  if (isLoading) {
    return <div className="container"><p>Loading tutor...</p></div>;
  }

  if (loadError || !tutor) {
    return (
      <div className="container">
        <Link href="/mentors" className="muted">← Back to tutors</Link>
        <section className="card" style={{ marginTop: "1rem" }}>
          <h1 style={{ marginTop: 0 }}>Tutor unavailable</h1>
          <p className="muted">{loadError || "Tutor not found."}</p>
        </section>
      </div>
    );
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
              {viewer?.role !== "student" && <p className="muted" style={{ marginBottom: 0 }}>Only logged-in students can book.</p>}
            </div>
          ))}
        </div>

        <p style={{ marginTop: "1rem" }}><strong>Status:</strong> {status}</p>
      </section>
    </div>
  );
}
