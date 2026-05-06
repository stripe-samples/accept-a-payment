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
| `DOMAIN` | Base URL for return URLs | Set by CLI | `http://localhost:4242` (HTML) or `:3000` (React) |
| `PORT` | Server port | `4242` | `4242` |

## How to run

### Stripe CLI

If you used `stripe samples create accept-a-payment`, `cd server` and see your language's README:

[Node](server/node/README.md) | [Python](server/python/README.md) | [Ruby](server/ruby/README.md) | [PHP](server/php/README.md) | [Java](server/java/README.md) | [Go](server/go/README.md) | [.NET](server/dotnet/README.md)

> **Not working?** Make sure you ran `stripe login` before `stripe samples create`. The CLI uses your login to write `server/.env` with API keys and `STATIC_DIR=../client`. If `.env` is missing, either re-run with login or create it manually:
> ```
> STRIPE_PUBLISHABLE_KEY=pk_test_...
> STRIPE_SECRET_KEY=sk_test_...
> STATIC_DIR=../client
> ```

### Cloned from GitHub

Pick a server language and follow its README:

[Node](server/node/README.md) | [Python](server/python/README.md) | [Ruby](server/ruby/README.md) | [PHP](server/php/README.md) | [Java](server/java/README.md) | [Go](server/go/README.md) | [.NET](server/dotnet/README.md)

## Clients

### HTML

The HTML client lives in `client/html/`. Every server is configured
to serve this directory as static files by default (via the `STATIC_DIR`
environment variable). No separate build step is needed.

### React

The React client uses Vite and proxies API requests to the backend:

```bash
cd client/react-cra
npm install
npm start
```

The dev server starts on port 3000 and proxies `/api` requests to
`http://127.0.0.1:4242`. Navigate to
[http://localhost:3000](http://localhost:3000) to see the payment form.
Make sure a backend server is running on port 4242 first.

**Important:** Set `DOMAIN` to your Vite dev server URL so Stripe
redirects back to the React app after payment:

```bash
# In your server's .env
DOMAIN=http://localhost:3000
```
