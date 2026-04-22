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
│   │   ├── checkout.html
│   │   ├── checkout.css
│   │   ├── checkout.js
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
└── .env.example        # Root env template
```

## Prerequisites

- A [Stripe account](https://dashboard.stripe.com/register)
- One of the following runtimes:
  - **Node** >= 14
  - **Python** >= 3.8
  - **Ruby** >= 2.6
  - **PHP** >= 7.2 with Composer
  - **Java** >= 11 with Maven
  - **Go** >= 1.22
  - **.NET** >= 9.0

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (`sk_test_...`) | *required* |
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (`pk_test_...`) | *required* |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret (`whsec_...`) | *optional* |
| `STATIC_DIR` | Path to the static files directory | `../../client/html` |
| `DOMAIN` | Base URL for return URLs | `http://localhost:4242` |

## How to run

### 1. Set up environment variables

Copy the `.env.example` file into the server directory you plan to use and
fill in your Stripe API keys:

```bash
cp .env.example server/node/.env
# Edit server/node/.env and add your keys
```

### 2. Pick a server and start it

#### Node

```bash
cd server/node
cp ../../.env.example .env  # add your keys
npm install
npm start
```

#### Python

```bash
cd server/python
cp ../../.env.example .env  # add your keys
pip install -r requirements.txt
python server.py
```

#### Ruby

```bash
cd server/ruby
cp ../../.env.example .env  # add your keys
bundle install
ruby server.rb
```

#### PHP

```bash
cd server/php
cp ../../.env.example .env  # add your keys
composer install
php -S localhost:4242 router.php
```

#### Java

```bash
cd server/java
cp ../../.env.example .env  # add your keys
mvn compile exec:java
```

#### Go

```bash
cd server/go
cp ../../.env.example .env  # add your keys
go run server.go
```

#### .NET

```bash
cd server/dotnet
cp ../../.env.example .env  # add your keys
dotnet run
```

### 3. Open in the browser

Visit [http://localhost:4242/checkout.html](http://localhost:4242/checkout.html) to
see the payment form.

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
[http://localhost:3000/checkout](http://localhost:3000/checkout) to see the
payment form. Make sure a backend server is running on port 4242 first.
