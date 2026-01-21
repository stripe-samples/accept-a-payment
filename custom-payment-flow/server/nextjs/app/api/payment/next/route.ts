import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const paymentIntentId = searchParams.get("payment_intent");

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "Missing payment_intent parameter" },
      { status: 400 }
    );
  }

  try {
    const intent = await getStripe().paymentIntents.retrieve(paymentIntentId, {
      expand: ["payment_method"],
    });

    return NextResponse.redirect(
      new URL(
        `/success?payment_intent_client_secret=${intent.client_secret}`,
        req.url
      )
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
