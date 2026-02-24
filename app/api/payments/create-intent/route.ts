import { NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ bookingId: string }>;

  if (!body.bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }

  const payment = createPaymentIntent(body.bookingId);
  if (!payment) {
    return NextResponse.json({ error: "Booking not found or invalid session type" }, { status: 404 });
  }

  return NextResponse.json({
    data: payment,
    clientSecret: `${payment.providerPaymentIntentId}_secret_mock`
  });
}
