# Accepting a card payment with TypeScript

As of 8.0.1, [stripe-node](https://github.com/stripe/stripe-node) provides types for the latest [API version](https://stripe.com/docs/api/versioning). These types offer a beneficial developer experience when working with [TypeScript](https://www.typescriptlang.org/), including enhanced code completion.

To find out more about usage with TypeScript, see the [stripe-node README](https://github.com/stripe/stripe-node#usage-with-typescript).

### Requirements

You’ll need the following:

- [Node.js](http://nodejs.org) >=10.0.0
- Stripe account to accept payments ([sign up](https://dashboard.stripe.com/register) for free).
- [Stripe CLI](https://github.com/stripe/stripe-cli) or [ngrok](https://ngrok.com/) to tunnel webhook events to your local server.

### Setup

Copy the environment variables file from the root of the repository:

    cp ../../../.env.example .env

Update `.env` with your own [Stripe API keys](https://dashboard.stripe.com/account/apikeys).

### Install and run

Install dependencies using npm:

    npm install

Next, follow [these installation steps](https://github.com/stripe/stripe-cli#installation) to install the Stripe CLI which we'll use for webhook forwarding.

After the installation has finished, authenticate the CLI with your Stripe account:

    stripe login

To start the webhook forwarding run:

    stripe listen --forward-to localhost:4242/webhook

The Stripe CLI will let you know that webhook forwarding is ready and output your webhook signing secret:

    > Ready! Your webhook signing secret is whsec_xxx

Copy the webhook signing secret (`whsec_xxx`) to your `.env` file.

In a separate terminal window, start the local server:

    npm run start # Compiles and runs the TypeScript example.
