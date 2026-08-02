import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    // Don't put any keys in code. Use an environment variable (as shown
    // here) or secrets vault to supply keys to your integration.
    //
    // See https://docs.stripe.com/keys-best-practices and find your
    // keys at https://dashboard.stripe.com/apikeys.
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-07-29.dahlia",
      appInfo: {
        name: "stripe-samples/accept-a-payment",
        version: "0.0.2",
        url: "https://github.com/stripe-samples/accept-a-payment",
      },
    });
  }
  return stripeInstance;
}
