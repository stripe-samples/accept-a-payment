# Accept a payment

An implementation in PHP

You can [🎥 watch a video](https://youtu.be/BPfpPGl85tk) to see how this server was implemented and [read the transcripts](./TRANSCRIPTS.md).


## Requirements

- PHP

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

2. Run composer to set up dependencies

```
composer install
```

3. Copy .env.example from root to .env and replace with your Stripe API keys

```
cp ../../.env.example .env
```

4. Run the server locally

```
composer start
```

or

```
cd public
php -S 127.0.0.1:4242
```

4. Go to [localhost:4242](http://localhost:4242)
