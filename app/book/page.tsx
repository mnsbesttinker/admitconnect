"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BookingFlow from "@/components/booking-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Book a Session</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm">Browse tutors and book an available slot from their profile.</p>
          <div>
            <Button asChild>
              <Link href="/mentors">Browse tutors</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>My bookings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {bookings.length === 0 && <p className="text-muted-foreground text-sm">No bookings yet.</p>}
          {bookings.map((booking) => (
            <p key={booking.id} className="text-sm">
              {booking.tutor?.fullName || booking.student?.fullName} ·{" "}
              {new Date(booking.slot.startTimeUtc).toLocaleString([], { timeZone: zone })} · {booking.status}
            </p>
          ))}
        </CardContent>
      </Card>

      <BookingFlow />
    </div>
  );
}
