import env from "dotenv";
import path from "path";
import cors from "cors";
// Replace if using a different env file or config.
env.config({ path: "./.env" });

import bodyParser from "body-parser";
import express from "express";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/accept-a-payment",
    url: "https://github.com/stripe-samples",
    version: "0.0.2",
  },
  typescript: true,
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
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.get("/", (_: express.Request, res: express.Response): void => {
  // Serve checkout page.
  const indexPath = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(indexPath);
});

app.get("/config", (_: express.Request, res: express.Response): void => {
  // Serve checkout page.
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

app.post(
  "/create-payment-intent",
  async (req: express.Request, res: express.Response): Promise<void> => {
    const { currency, paymentMethodType, paymentMethodOptions }: { currency: string, paymentMethodType: string, paymentMethodOptions?: object  } = req.body;
    // Create a PaymentIntent with the order amount and currency.
    const params: Stripe.PaymentIntentCreateParams = {
      amount: 5999,
      currency,
      // Each payment method type has support for different currencies. In order to
      // support many payment method types and several currencies, this server
      // endpoint accepts both the payment method type and the currency as
      // parameters. To get compatible payment method types, pass 
      // `automatic_payment_methods[enabled]=true` and enable types in your dashboard 
      // at https://dashboard.stripe.com/settings/payment_methods.
      //
      // Some example payment method types include `card`, `ideal`, and `link`.
      payment_method_types: paymentMethodType === 'link' ? ['link', 'card'] : [paymentMethodType],
    };

    // If this is for an ACSS payment, we add payment_method_options to create
    // the Mandate.
    if (paymentMethodType === "acss_debit") {
      params.payment_method_options = {
        acss_debit: {
          mandate_options: {
            payment_schedule: "sporadic",
            transaction_type: "personal",
          },
        },
      };
    } else if (paymentMethodType === 'customer_balance') {
      params.payment_method_data = {
        type: 'customer_balance',
      } as any
      params.confirm = true
      params.customer = req.body.customerId || await stripe.customers.create().then(data => data.id)
    }

    /**
     * If API given this data, we can overwride it
     */
    if (paymentMethodOptions) {
      params.payment_method_options = paymentMethodOptions
    }

    try {
      const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.create(
        params
      );

      // Send publishable key and PaymentIntent client_secret to client.
      res.send({
        clientSecret: paymentIntent.client_secret,
        nextAction: paymentIntent.next_action,
      });
    } catch (e) {
      res.status(400).send({
        error: {
          message: e.message,
        }
      });
    }
  }
);

app.get('/payment/next', async (req, res) => {
  const paymentIntent : any = req.query.payment_intent; 
  const intent  = await stripe.paymentIntents.retrieve(
    paymentIntent,
    {
      expand: ['payment_method'],
    }
  );
  
  res.redirect(`/success?payment_intent_client_secret=${intent.client_secret}`);
});

app.get('/success', async (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/success.html');
  res.sendFile(path);
});

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
