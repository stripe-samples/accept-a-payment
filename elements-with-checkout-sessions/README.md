# Elements with Checkout Sessions

This Stripe sample shows how to accept payments using
[Elements with Checkout Sessions](https://docs.stripe.com/payments/quickstart-checkout-sessions)
(`ui_mode: 'elements'`). A Checkout Session is created on the server,
its `client_secret` is passed to the front end, and Stripe Elements renders
the payment form.

## Directory structure

```
.
├── client
│   ├── html            # Vanilla HTML/JS client
│   │   ├── index.html
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── complete.html
│   │   ├── complete.css
│   │   └── complete.js
│   └── react-cra       # React client (Vite dev server)
│       └── ...
├── server
│   ├── node
│   ├── python
│   ├── ruby
│   ├── php
│   ├── java
│   ├── go
│   └── dotnet
├── testing
│   └── manual-test.sh  # Run all 14 server×client combinations
├── .mise.toml          # Tool versions (mise install)
└── .env.example        # Root env template
```

## Prerequisites

- A [Stripe account](https://dashboard.stripe.com/register)
- One of the following runtimes:
  - **Node** >= 18
  - **Python** >= 3.12
  - **Ruby** >= 3.3
  - **PHP** >= 8.2 with Composer
  - **Java** >= 17 with Maven
  - **Go** >= 1.22
  - **.NET** >= 9.0

## Environment variables

| Variable | Description | CLI | Clone |
|---|---|---|---|
| `STRIPE_PUBLISHABLE_KEY` | Your publishable key (`pk_test_...`) | Set by CLI | *required* |
| `STRIPE_SECRET_KEY` | Your secret key (`sk_test_...`) | Set by CLI | *required* |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret (`whsec_...`) | Set by CLI | *optional* |
| `STATIC_DIR` | Path to client files | `../client` | `../../client/html` |
| `DOMAIN` | Base URL for return URLs | `http://localhost:4242` (HTML) or `:3000` (React) | `http://localhost:4242` (HTML) or `:3000` (React) |
| `PORT` | Server port | `4242` | `4242` |

## How to run

Pick your server language:

[Node](server/node/README.md) | [Python](server/python/README.md) | [Ruby](server/ruby/README.md) | [PHP](server/php/README.md) | [Java](server/java/README.md) | [Go](server/go/README.md) | [.NET](server/dotnet/README.md)

Each README covers both setup methods (Stripe CLI and cloning) and both clients (HTML and React).

> **Downloaded via `stripe samples create` and something's not working?** Make sure you ran `stripe login` first. The CLI needs this to write `server/.env`. If `.env` is missing, create it manually:
> ```
> STRIPE_PUBLISHABLE_KEY=pk_test_...
> STRIPE_SECRET_KEY=sk_test_...
> STATIC_DIR=../client
> ```
