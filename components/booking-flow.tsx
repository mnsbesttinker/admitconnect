"use client";

import { useEffect, useMemo, useState } from "react";
import { mentors, sessionTypes } from "@/lib/mentors";

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
    <section className="card" style={{ padding: "1.25rem" }}>
      <h2 style={{ marginTop: 0 }}>MVP Booking + Payment Flow Tester</h2>
      <p className="muted">A signed-in student can book a mentor slot. Payments remain mocked for now.</p>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        <label>
          Signed in as
          <input value={viewer ? `${viewer.name || "Unknown"} (${viewer.email || "no-email"})` : "Guest"} style={{ width: "100%" }} disabled readOnly />
        </label>

        <label>
          Mentor
          <select value={mentorId} onChange={(event) => setMentorId(event.target.value)} style={{ width: "100%" }}>
            {mentors.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.name} — {mentor.university}
              </option>
            ))}
          </select>
        </label>

        <label>
          Session type
          <select
            value={sessionTypeId}
            onChange={(event) => {
              setSessionTypeId(event.target.value);
              setBooking(null);
              setPaymentIntent(null);
            }}
            style={{ width: "100%" }}
          >
            {sessionTypes.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} (${session.priceUsd})
              </option>
            ))}
          </select>
        </label>

        <label>
          Available slot
          <select
            value={slot}
            onChange={(event) => {
              setSlot(event.target.value);
              setBooking(null);
              setPaymentIntent(null);
            }}
            style={{ width: "100%" }}
          >
            {availableSlots.length === 0 && <option value="">No available slots</option>}
            {availableSlots.map((entry) => (
              <option key={entry.id} value={entry.startTimeUtc}>
                {formatSlot(entry.startTimeUtc, entry.endTimeUtc)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={createBooking} disabled={!slot || !canBook}>1) Create booking</button>
        <button type="button" className="btn" onClick={createPaymentIntent} disabled={!booking}>2) Create payment intent</button>
        <button type="button" className="btn" onClick={confirmPaymentWebhook} disabled={!paymentIntent}>3) Confirm payment webhook</button>
      </div>

      <p style={{ marginTop: "1rem" }}><strong>Status:</strong> {message || "Ready"}</p>

      <div className="muted">
        <p style={{ marginBottom: "0.3rem" }}><strong>Mentor:</strong> {selectedMentor?.name}</p>
        <p style={{ marginBottom: "0.3rem" }}><strong>Booking:</strong> {booking ? `${booking.id} (${booking.status})` : "none"}</p>
        <p style={{ margin: 0 }}><strong>Payment intent:</strong> {paymentIntent ? paymentIntent.providerPaymentIntentId : "none"}</p>
      </div>

      <section style={{ marginTop: "1rem" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>My bookings</h3>
        {myBookings.length === 0 && <p className="muted">No bookings yet.</p>}
        {myBookings.map((entry) => (
          <div key={entry.id} className="card" style={{ marginBottom: "0.5rem" }}>
            <p style={{ margin: 0 }}>
              <strong>{entry.applicantName}</strong> booked <strong>{entry.mentorId}</strong> at {new Date(entry.startTimeUtc).toLocaleString()} ({entry.status})
            </p>
          </div>
        ))}
      </section>
    </section>
  );
}
