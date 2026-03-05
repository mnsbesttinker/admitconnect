import { NextResponse } from "next/server";
import { markPaymentPaid } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ type: string; providerPaymentIntentId: string }>;

  if (body.type !== "payment_intent.succeeded" || !body.providerPaymentIntentId) {
    return NextResponse.json({ error: "Unsupported event payload" }, { status: 400 });
  }

  const result = markPaymentPaid(body.providerPaymentIntentId);
  if (!result) {
    return NextResponse.json({ error: "Payment intent not found" }, { status: 404 });
  }

  return NextResponse.json({ data: result });
}
