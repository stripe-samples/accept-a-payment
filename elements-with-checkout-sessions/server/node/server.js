require('dotenv').config();
const express = require("express");
const app = express();
app.use(express.static(process.env.STATIC_DIR || "../../client/html/public"));

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// In the Node SDK (v22), V1 API resources live directly on the client instance
// (e.g. client.checkout.sessions) — there is no .v1 namespace like other SDKs.
const client = require("stripe")(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = process.env.DOMAIN || "http://localhost:4242";

app.get("/config", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.get("/complete", (req, res) => {
  res.sendFile("complete.html", { root: process.env.STATIC_DIR || "../../client/html/public" });
});

app.post("/create-checkout-session", async (req, res) => {
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
    return_url: `${YOUR_DOMAIN}/complete?session_id={CHECKOUT_SESSION_ID}`,
  });

  res.send({ clientSecret: session.client_secret });
});

app.get("/session-status", async (req, res) => {
  const session = await client.checkout.sessions.retrieve(req.query.session_id, {expand: ["payment_intent"]});

  res.send({
    status: session.status,
    payment_status: session.payment_status,
    payment_intent_id: session.payment_intent.id,
    payment_intent_status: session.payment_intent.status
  });
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
