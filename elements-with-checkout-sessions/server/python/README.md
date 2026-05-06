# Elements with Checkout Sessions — Python

A [Flask](https://flask.palletsprojects.com/) server implementation.

## Requirements

- Python >= 3.12

## How to run

### Stripe CLI

If you downloaded with `stripe samples create` (and ran `stripe login` first):

```bash
pip install -r requirements.txt
python server.py
```

#### HTML client

Open http://localhost:4242.

#### React client

Add `DOMAIN=http://localhost:3000` to your `.env`, then start the React dev server:

```bash
cd ../client
npm install
npm start
```

Open http://localhost:3000.

---

> **Not working?** Make sure you ran `stripe login` before `stripe samples create`. The CLI needs this to write `.env`. If it's missing, create it manually:
> ```
> STRIPE_PUBLISHABLE_KEY=pk_test_...
> STRIPE_SECRET_KEY=sk_test_...
> STATIC_DIR=../client
> ```
> For React, also add `DOMAIN=http://localhost:3000`.

### Cloned repo

```bash
cp ../../.env.example .env
```

Edit `.env` — add your [test API keys](https://dashboard.stripe.com/test/apikeys). Confirm `STATIC_DIR=../../client/html` (already set by the template).

```bash
pip install -r requirements.txt
python server.py
```

#### HTML client

Open http://localhost:4242.

#### React client

Set `DOMAIN=http://localhost:3000` in your `.env`, then start the React dev server:

```bash
cd ../../client/react-cra
npm install
npm start
```

Open http://localhost:3000.
