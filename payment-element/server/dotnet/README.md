# Accept a payment

An [.NET Core](https://dotnet.microsoft.com/download/dotnet-core) implementation

You can [🎥 watch a video](https://www.youtube.com/watch?v=mqEjRgoZWdo) to see how this server was implemented and [read the transcripts](./TRANSCRIPTS.md).

## Requirements

* .NET Core
* [Configured .env file](../../README.md)

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


<details>
<summary>Optionally - Add Stripe Tax</summary>
Stripe Tax lets you calculate and collect sales tax, VAT and GST with one line of code.
To enable Stripe Tax set up in the dashboard: [Docs - Set up Stripe Tax](https://stripe.com/docs/tax/set-up).

In ["appsettings.json"](./appsettings.json), set CalculateTax to true if you want Stripe to calculate tax for the transactions in this application.

```json
"Stripe": {
   "CalculateTax": true
}
```

</details>

2. Run the application

```
dotnet run 
```

4. If you're using the html client, go to `localhost:4242` to see the demo.
