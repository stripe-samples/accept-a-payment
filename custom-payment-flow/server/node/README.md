# Accepting a payment

An [Express server](http://expressjs.com) implementation

You can [🎥 watch a video](https://youtu.be/WG4ehXSEpz4) to see how this server was implemented and [read the transcripts](./TRANSCRIPTS.md).

## Requirements

- Node v10+
- [Configured .env file](../README.md)

## How to run

1. Confirm `.env` configuration

Ensure the API keys are configured in `.env` in this directory. It should include the following keys:

```yaml
# Stripe API keys - see https://stripe.com/docs/development/quickstart#api-keys
STRIPE_PUBLISHABLE_KEY=pk_test...
STRIPE_SECRET_KEY=sk_test...

# Required to verify signatures in the webhook handler.
# See README on how to use the Stripe CLI to test webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# Path to front-end implementation. Note: PHP has it's own front end implementation.
STATIC_DIR=../../client/html
DOMAIN=http://localhost:4242
```

2. Install dependencies and start the server

```
npm install
npm start
```

3. If you're using the html client, go to `localhost:4242` to see the demo. For
   react, visit `localhost:3000`.
