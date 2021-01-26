import env from "dotenv";
import path from "path";
// Replace if using a different env file or config.
env.config({ path: "./.env" });

import bodyParser from "body-parser";
import express from "express";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
  typescript: true
});

const app = express();
const resolve = path.resolve;

app.use(express.static(process.env.STATIC_DIR));
app.use(
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    if (req.originalUrl === "/webhook") {
      next();
    } else {
      bodyParser.json()(req, res, next);
    }
  }
);

app.get("/checkout", (_: express.Request, res: express.Response): void => {
  // Serve checkout page.
  const indexPath = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(indexPath);
});

// tslint:disable-next-line: interface-name
interface Order {
  items: object[];
}

const calculateOrderAmount = (order: Order): number => {
  // Replace this constant with a calculation of the order's amount.
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client.
  return 1400;
};

app.post(
  "/create-payment-intent",
  async (req: express.Request, res: express.Response): Promise<void> => {
    const { items, currency }: { items: Order; currency: string } = req.body;
    // Create a PaymentIntent with the order amount and currency.
    const params: Stripe.PaymentIntentCreateParams = {
      amount: calculateOrderAmount(items),
      currency
    };

    const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.create(
      params
    );

    // Send publishable key and PaymentIntent client_secret to client.
    res.send({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  }
);

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard:
// https://dashboard.stripe.com/test/webhooks
app.post(
  "/webhook",
  // Use body-parser to retrieve the raw body as a buffer.
  bodyParser.raw({ type: "application/json" }),
  async (req: express.Request, res: express.Response): Promise<void> => {
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
