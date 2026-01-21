import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    const domainURL = process.env.DOMAIN || "http://localhost:4242";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.PRICE!,
          quantity: 1,
        },
      ],
      success_url: `${domainURL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/canceled`,
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
