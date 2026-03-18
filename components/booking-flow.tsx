"use client";

import { useEffect, useMemo, useState } from "react";
import { mentors, sessionTypes } from "@/lib/mentors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type BookingResponse = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  mentorId: string;
  sessionTypeId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  status: string;
  meetingLink: string | null;
};

type PaymentResponse = {
  providerPaymentIntentId: string;
  status: string;
};

type AvailabilitySlot = {
  id: string;
  mentorId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  isBooked: boolean;
};

type Viewer = { name: string | null; email?: string | null; role: "student" | "tutor" | "admin" | null } | null;

const selectClassName =
  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

function formatSlot(start: string, end: string) {
  return `${new Date(start).toLocaleString()} → ${new Date(end).toLocaleTimeString()}`;
}

export default function BookingFlow() {
  const [viewer, setViewer] = useState<Viewer>(null);
  const [mentorId, setMentorId] = useState(mentors[0]?.id ?? "");
  const [sessionTypeId, setSessionTypeId] = useState<string>(sessionTypes[1]?.id ?? "deep-dive");
  const [slot, setSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [myBookings, setMyBookings] = useState<BookingResponse[]>([]);
  const [paymentIntent, setPaymentIntent] = useState<PaymentResponse | null>(null);
  const [message, setMessage] = useState<string>("");

  const selectedMentor = useMemo(() => mentors.find((mentor) => mentor.id === mentorId), [mentorId]);
  const canBook = viewer?.role === "student";

  useEffect(() => {
    async function loadViewer() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setViewer(null);
        setMessage("Login as a student before booking a session.");
        return;
      }

      const payload = (await response.json()) as { data: Viewer };
      setViewer(payload.data);

      if (payload.data?.role !== "student") {
        setMessage("Only student accounts can create bookings.");
      }
    }

    void loadViewer();
  }, []);

  useEffect(() => {
    async function loadAvailability() {
      setMessage("Loading mentor availability...");
      setBooking(null);
      setPaymentIntent(null);

      const response = await fetch(`/api/mentors/${mentorId}/availability`);
      const data = await response.json();

      if (!response.ok) {
        setAvailableSlots([]);
        setSlot("");
        setMessage(data.error ?? "Failed to load availability");
        return;
      }

      const openSlots = (data.data as AvailabilitySlot[]).filter((entry) => !entry.isBooked);
      setAvailableSlots(openSlots);
      setSlot(openSlots[0]?.startTimeUtc ?? "");
      setMessage(openSlots.length ? "Select a slot and create booking." : "No open slots for this mentor yet.");
    }

    if (mentorId) {
      void loadAvailability();
    }
  }, [mentorId]);

  async function loadMyBookings() {
    const response = await fetch("/api/bookings/my", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setMyBookings([]);
      setMessage(data.error ?? "Unable to load your bookings");
      return;
    }

    setMyBookings(data.data as BookingResponse[]);
  }

  useEffect(() => {
    if (canBook) {
      void loadMyBookings();
    }
  }, [canBook]);

  async function createBooking() {
    if (!canBook) {
      setMessage("Only student accounts can create bookings.");
      return;
    }

    if (!slot) {
      setMessage("Please select an available slot first.");
      return;
    }

    setMessage("Creating booking...");
    setBooking(null);
    setPaymentIntent(null);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId, sessionTypeId, startTimeUtc: slot })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Booking creation failed");
      return;
    }

    setBooking(data.data);
    setMessage(`Booking created: ${data.data.id}`);
    await loadMyBookings();
  }

  async function createPaymentIntent() {
    if (!booking) {
      setMessage("Create a booking first.");
      return;
    }

    setMessage("Creating payment intent...");
    const response = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Failed to create payment intent");
      return;
    }

    setPaymentIntent(data.data);
    setMessage(`Payment intent created: ${data.data.providerPaymentIntentId}`);
  }

  async function confirmPaymentWebhook() {
    if (!paymentIntent) {
      setMessage("Create a payment intent first.");
      return;
    }

    setMessage("Simulating Stripe webhook...");
    const response = await fetch("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "payment_intent.succeeded",
        providerPaymentIntentId: paymentIntent.providerPaymentIntentId
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Webhook failed");
      return;
    }

    setBooking(data.data.booking);
    setMessage("Payment confirmed and booking marked confirmed.");
    await loadMyBookings();
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>MVP Booking + Payment Flow Tester</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <p className="text-muted-foreground text-sm">A signed-in student can book a mentor slot. Payments remain mocked for now.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="viewer">Signed in as</Label>
            <input
              id="viewer"
              value={viewer ? `${viewer.name || "Unknown"} (${viewer.email || "no-email"})` : "Guest"}
              className={selectClassName}
              disabled
              readOnly
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mentor">Mentor</Label>
            <select id="mentor" value={mentorId} onChange={(event) => setMentorId(event.target.value)} className={selectClassName}>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name} — {mentor.university}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sessionType">Session type</Label>
            <select
              id="sessionType"
              value={sessionTypeId}
              onChange={(event) => {
                setSessionTypeId(event.target.value);
                setBooking(null);
                setPaymentIntent(null);
              }}
              className={selectClassName}
            >
              {sessionTypes.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} (${session.priceUsd})
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="slot">Available slot</Label>
            <select
              id="slot"
              value={slot}
              onChange={(event) => {
                setSlot(event.target.value);
                setBooking(null);
                setPaymentIntent(null);
              }}
              className={selectClassName}
            >
              {availableSlots.length === 0 && <option value="">No available slots</option>}
              {availableSlots.map((entry) => (
                <option key={entry.id} value={entry.startTimeUtc}>
                  {formatSlot(entry.startTimeUtc, entry.endTimeUtc)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={createBooking} disabled={!slot || !canBook}>
            1) Create booking
          </Button>
          <Button type="button" onClick={createPaymentIntent} disabled={!booking} variant="secondary">
            2) Create payment intent
          </Button>
          <Button type="button" onClick={confirmPaymentWebhook} disabled={!paymentIntent} variant="outline">
            3) Confirm payment webhook
          </Button>
        </div>

        <p className="text-sm">
          <span className="font-semibold">Status:</span> {message || "Ready"}
        </p>

        <div className="text-muted-foreground grid gap-1 text-sm">
          <p>
            <span className="font-semibold">Mentor:</span> {selectedMentor?.name}
          </p>
          <p>
            <span className="font-semibold">Booking:</span> {booking ? `${booking.id} (${booking.status})` : "none"}
          </p>
          <p>
            <span className="font-semibold">Payment intent:</span> {paymentIntent ? paymentIntent.providerPaymentIntentId : "none"}
          </p>
        </div>

        <section className="grid gap-3 rounded-lg border bg-muted/20 p-4">
          <h3 className="text-lg font-semibold">My bookings</h3>
          {myBookings.length === 0 && <p className="text-muted-foreground text-sm">No bookings yet.</p>}
          {myBookings.map((entry) => (
            <Card key={entry.id} className="py-4">
              <CardContent className="px-4">
                <p className="text-sm">
                  <strong>{entry.applicantName}</strong> booked <strong>{entry.mentorId}</strong> at{" "}
                  {new Date(entry.startTimeUtc).toLocaleString()} ({entry.status})
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}
