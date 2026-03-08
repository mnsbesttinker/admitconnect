"use client";

import Link from "next/link";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  status: string;
  slot: { startTimeUtc: string; endTimeUtc: string };
  tutor?: { fullName: string };
  student?: { fullName: string };
};

type Viewer = { role: "student" | "tutor" | null; timezone?: string | null } | null;

export default function BookPage() {
  const [viewer, setViewer] = useState<Viewer>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!meRes.ok) {
        return;
      }

      const me = (await meRes.json()) as { data: Viewer };
      setViewer(me.data);

      const bookingsRes = await fetch("/api/bookings/my", { cache: "no-store" });
      if (!bookingsRes.ok) {
        return;
      }
      const payload = await bookingsRes.json();
      setBookings(payload.data as Booking[]);
    }

    void load();
  }, []);

  const zone = viewer?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return (
    <div className="container">
      <h1>Book a Session</h1>
      <p>Browse tutors and book an available slot from their profile.</p>
      <Link className="btn" href="/mentors">Browse tutors</Link>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>My bookings</h3>
        {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
        {bookings.map((booking) => (
          <p key={booking.id}>
            {booking.tutor?.fullName || booking.student?.fullName} · {DateTime.fromISO(booking.slot.startTimeUtc, { zone: "utc" }).setZone(zone).toFormat("DDD t")} · {booking.status}
          </p>
        ))}
      </section>
    </div>
  );
}
