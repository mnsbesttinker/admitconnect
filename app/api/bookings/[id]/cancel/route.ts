import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/store";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const booking = cancelBooking(params.id);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ data: booking });
}
