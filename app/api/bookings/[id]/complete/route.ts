import { NextResponse } from "next/server";
import { completeBooking } from "@/lib/store";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const booking = completeBooking(params.id);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ data: booking });
}
