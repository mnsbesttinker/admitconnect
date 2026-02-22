"use client";

import { useMemo, useState } from "react";
import { mentors, sessionTypes } from "@/lib/mentors";

type BookingResponse = {
  id: string;
  mentorId: string;
  sessionTypeId: string;
  status: string;
  meetingLink: string | null;
};

type PaymentResponse = {
  providerPaymentIntentId: string;
  status: string;
};

export default function BookingFlow() {
  const [applicantName, setApplicantName] = useState("Tymur");
  const [mentorId, setMentorId] = useState(mentors[0]?.id ?? "");
  const [sessionTypeId, setSessionTypeId] = useState(sessionTypes[1]?.id ?? "deep-dive");
  const [slot, setSlot] = useState("2026-03-01T15:00:00.000Z");
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentResponse | null>(null);
  const [message, setMessage] = useState<string>("");

  const selectedMentor = useMemo(() => mentors.find((mentor) => mentor.id === mentorId), [mentorId]);

  async function createBooking() {
    setMessage("Creating booking...");

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicantName, mentorId, sessionTypeId, startTimeUtc: slot })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Booking creation failed");
      return;
    }

    setBooking(data.data);
    setMessage(`Booking created: ${data.data.id}`);
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
  }

  return (
    <section className="card" style={{ padding: "1.25rem" }}>
      <h2 style={{ marginTop: 0 }}>MVP Booking + Payment Flow Tester</h2>
      <p className="muted">Create booking, create mock payment intent, then simulate webhook confirmation.</p>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        <label>
          Applicant name
          <input value={applicantName} onChange={(event) => setApplicantName(event.target.value)} style={{ width: "100%" }} />
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
          <select value={sessionTypeId} onChange={(event) => setSessionTypeId(event.target.value)} style={{ width: "100%" }}>
            {sessionTypes.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} (${session.priceUsd})
              </option>
            ))}
          </select>
        </label>

        <label>
          Start slot (seed slot for selected mentor)
          <input value={slot} onChange={(event) => setSlot(event.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={createBooking}>1) Create booking</button>
        <button type="button" className="btn" onClick={createPaymentIntent}>2) Create payment intent</button>
        <button type="button" className="btn" onClick={confirmPaymentWebhook}>3) Confirm payment webhook</button>
      </div>

      <p style={{ marginTop: "1rem" }}><strong>Status:</strong> {message || "Ready"}</p>

      <div className="muted">
        <p style={{ marginBottom: "0.3rem" }}><strong>Mentor:</strong> {selectedMentor?.name}</p>
        <p style={{ margin: 0 }}><strong>Booking:</strong> {booking ? `${booking.id} (${booking.status})` : "none"}</p>
      </div>
    </section>
  );
}
