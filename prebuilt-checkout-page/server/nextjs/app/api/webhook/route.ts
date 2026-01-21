import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let data: Stripe.Event.Data;
  let eventType: string;

  if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
    try {
      const event = getStripe().webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      data = event.data;
      eventType = event.type;
    } catch (err) {
      const error = err as Error;
      console.log(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } else {
    const payload = JSON.parse(body);
    data = payload.data;
    eventType = payload.type;
  }

  if (eventType === "checkout.session.completed") {
    console.log("Payment received!");
  }

  return NextResponse.json({ received: true });
}
