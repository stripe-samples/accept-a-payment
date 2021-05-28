# Accept a payment

An implementation with Flask.

You can [🎥 watch a video](https://youtu.be/Tgjwx-38Dic) to see how this server was implemented and [read the transcripts](./TRANSCRIPTS.md).

## Requirements

- Python 3
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


2. Create and activate a new virtual environment

**MacOS / Unix**

```
python3 -m venv env
source env/bin/activate
```

**Windows (PowerShell)**

```
python3 -m venv env
.\env\Scripts\activate.bat
```

3. Install dependencies

```
pip install -r requirements.txt
```

4. Export and run the application

**MacOS / Unix**

```
export FLASK_APP=server.py
python3 -m flask run --port=4242
```

**Windows (PowerShell)**

```
$env:FLASK_APP=“server.py"
python3 -m flask run --port=4242
```

5. Go to `localhost:4242` in your browser to see the demo
