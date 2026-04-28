require('dotenv').config({path: './.env'});
const express = require("express");
const app = express();
app.use(express.static(process.env.STATIC_DIR || "../../client/html"));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const client = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/accept-a-payment/elements-with-checkout-sessions",
    version: "0.0.2",
    url: "https://github.com/stripe-samples"
  }
});

const port = process.env.PORT || 4242;
const YOUR_DOMAIN = process.env.DOMAIN || `http://localhost:${port}`;

app.get("/config", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.get("/complete", (req, res) => {
  res.sendFile("complete.html", { root: process.env.STATIC_DIR || "../../client/html" });
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await client.checkout.sessions.create({
      ui_mode: "elements",
      line_items: [
        {
          price_data: {
            product_data: {
              name: "T-shirt",
            },
            currency: "usd",
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      adaptive_pricing: { enabled: true },
      // Set customer_email when the user is already known (e.g. logged in) —
      // the payment form will display it as read-only. In production, use your
      // authenticated user's email. The +location_FR suffix is a test-mode
      // feature that simulates a customer in France for Adaptive Pricing.
      customer_email: "test+location_FR@example.com",
      return_url: `${YOUR_DOMAIN}/complete?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.send({ clientSecret: session.client_secret });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.get("/session-status", async (req, res) => {
  try {
    const session = await client.checkout.sessions.retrieve(req.query.session_id, {expand: ["payment_intent"]});

    res.send({
      status: session.status,
      payment_status: session.payment_status,
      payment_intent_id: session.payment_intent?.id ?? null,
      payment_intent_status: session.payment_intent?.status ?? null
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

// Webhook handler for asynchronous events.
app.post('/webhook', async (req, res) => {
  let event;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    let signature = req.headers['stripe-signature'];

    try {
      event = client.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
  } else {
    event = req.body;
  }

  if (event.type === 'checkout.session.completed') {
    console.log(`Payment received!`);
  }

  res.sendStatus(200);
});

app.listen(port, () => console.log(`Running on port ${port}`));
