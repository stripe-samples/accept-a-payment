import env from "dotenv";
import path from "path";
// Replace if using a different env file or config.
env.config({ path: "./.env" });
const calculateTax = false;
import bodyParser from "body-parser";
import express, { Request, Response, NextFunction } from "express";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  appInfo: {
    name: "stripe-samples/accept-a-payment",
    url: "https://github.com/stripe-samples",
    version: "0.0.2",
  },
  typescript: true,
});

const app = express();

app.use(express.static(process.env.STATIC_DIR));
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
}
);

app.get("/", (_: Request, res: Response): void => {
  // Serve checkout page.
  const indexPath = path.resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(indexPath);
});

app.get("/config", (_: Request, res: Response): void => {
  // Serve checkout page.
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

const calculate_tax = async (orderAmount: number, currency: string) => {
  const taxCalculation = await stripe.tax.calculations.create({
    currency,
    customer_details: {
      address: {
        line1: "10709 Cleary Blvd",
        city: "Plantation",
        state: "FL",
        postal_code: "33322",
        country: "US",
      },
      address_source: "shipping",
    },
    line_items: [
      {
        amount: orderAmount,
        reference: "ProductRef",
        tax_behavior: "exclusive",
        tax_code: "txcd_30011000"
      }
    ],
  });

  return taxCalculation;
};

app.get("/create-payment-intent",
  async (req: Request, res: Response): Promise<void> => {
    let orderAmount = 1400;
    let paymentIntent: Stripe.PaymentIntent;

    try {

      if (calculateTax) {
        let taxCalculation = await calculate_tax(orderAmount, "usd")

        paymentIntent = await stripe.paymentIntents.create({
          currency: 'usd',
          amount: taxCalculation.amount_total,
          automatic_payment_methods: { enabled: true },
          metadata: { tax_calculation: taxCalculation.id }
        });
      }
      else {
        paymentIntent = await stripe.paymentIntents.create({
          currency: 'usd',
          amount: orderAmount,
          automatic_payment_methods: { enabled: true }
        });
      }

      // Send publishable key and PaymentIntent client_secret to client.
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    }
    catch (e) {
      let message: string;
      if (typeof e === "string") {
        message = e;
      } else if (e instanceof Error) {
        message = e.message;
      }
      res.status(400).send({ error: { message } });
    }
  }
);

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard:
// https://dashboard.stripe.com/test/webhooks
app.post("/webhook",
  // Use body-parser to retrieve the raw body as a buffer.
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      res.sendStatus(400);
      return;
    }

    // Extract the data from the event.
    const data: Stripe.Event.Data = event.data;
    const eventType: string = event.type;

    if (eventType === "payment_intent.succeeded") {
      // Cast the event into a PaymentIntent to make use of the types.
      const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
      // Funds have been captured
      // Fulfill any orders, e-mail receipts, etc
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds).
      console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
      console.log("💰 Payment captured!");
    } else if (eventType === "payment_intent.payment_failed") {
      // Cast the event into a PaymentIntent to make use of the types.
      const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
      console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
      console.log("❌ Payment failed.");
    }
    res.sendStatus(200);
  }
);

app.listen(4242, (): void =>
  console.log(`Node server listening on port ${4242}!`)
);
