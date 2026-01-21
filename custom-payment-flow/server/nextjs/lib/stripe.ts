import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
      appInfo: {
        name: "stripe-samples/accept-a-payment/custom-payment-flow",
        version: "0.0.2",
        url: "https://github.com/stripe-samples/accept-a-payment",
      },
    });
  }
  return stripeInstance;
}
