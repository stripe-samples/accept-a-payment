# Accept a payment

A Go implementation for creating a PaymentIntent on the server.

You can [🎥 watch a video](https://www.youtube.com/watch?v=cbsCxLDL4EY) to see how this server was implemented and [read the transcripts](./TRANSCRIPTS.md).


## Requirements

- Go 1.13
- [Configured .env file](../../README.md)

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

2. Install dependencies

From the server directory (the one with `server.go`) run:

```sh
go mod tidy
go mod vendor
```

3. Run the application

Again from the server directory run:

```sh
go run server.go
```

4. If you're using the html client, go to `localhost:4242` to see the demo. For
   react, visit `localhost:3000`.
