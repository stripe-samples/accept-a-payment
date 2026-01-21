import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const orderAmount = 1400;

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      currency: "usd",
      amount: orderAmount,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    let message: string;
    if (typeof error === "string") {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = "An unknown error occurred";
    }
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
