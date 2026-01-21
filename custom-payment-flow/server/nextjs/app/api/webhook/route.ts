import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let data: Stripe.Event.Data;
  let eventType: string;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
    // Retrieve the event by verifying the signature using the raw body and secret.
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
    // Webhook signing is recommended, but if the secret is not configured,
    // we can retrieve the event data directly from the request body.
    const payload = JSON.parse(body);
    data = payload.data;
    eventType = payload.type;
  }

  if (eventType === "payment_intent.succeeded") {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log("Payment captured!");
  } else if (eventType === "payment_intent.payment_failed") {
    console.log("Payment failed.");
  }

  return NextResponse.json({ received: true });
}
