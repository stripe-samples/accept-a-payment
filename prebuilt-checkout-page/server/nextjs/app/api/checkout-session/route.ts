import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return NextResponse.json(session);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
