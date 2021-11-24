# Accept a payment with a payment element

Stripe Elements is a set of prebuilt UI components, like inputs and buttons,
for building your checkout flow. It’s available as a feature of Stripe.js.
Stripe.js tokenizes the sensitive information within an Element without ever
having it touch your server.

This integration shows you how to accept payments with the
[Stripe Payment Element](https://stripe.com/docs/payments/payment-element).

## How to run locally

Recommended approach is to install with the [Stripe CLI](https://stripe.com/docs/stripe-cli#install):

```sh
stripe samples create accept-a-payment
```

Then pick:

```sh
payment-element
```

This sample includes several different server implementations and several
different client implementations. The servers all implement the same routes and
the clients all work with the same server routes.

Pick a server:

- [dotnet](./server/dotnet)
- [go](./server/go)
- [java](./server/java)
- [node](./server/node)
- [node-typescript](./server/node-typescript)
- [php](./server/php)
- [python](./server/python)
- [ruby](./server/ruby)

Pick a client:

- [html](./client/html)


**Installing and cloning manually**

If you do not want to use the Stripe CLI, you can manually clone and configure the sample yourself:

```
git clone https://github.com/stripe-samples/accept-a-payment
```

Rename and move the [`.env.example`](.env.example) file into a file named
`.env` in the specific folder of the server language you want to use. For
example:

```
cp .env.example custom-payment-flow/server/node/.env
```

Example `.env` file:

```sh
STRIPE_PUBLISHABLE_KEY=<replace-with-your-publishable-key>
STRIPE_SECRET_KEY=<replace-with-your-secret-key>
STATIC_DIR=../../client/html
```

You will need a Stripe account in order to run the demo. Once you set up
your account, go to the Stripe [developer
dashboard](https://stripe.com/docs/development#api-keys) to find your API
keys.

The other environment variables are configurable:

`STATIC_DIR` tells the server where to the client files are located and does not need to be modified unless you move the server files.

`DOMAIN` is the domain of your website, where Checkout will redirect back to after the customer completes the payment on the Checkout page.

**2. Follow the server instructions on how to run**

Pick the server language you want and follow the instructions in the server folder README on how to run.

For example, if you want to run the Node server:

```
cd server/node # there's a README in this folder with instructions
npm install
npm start
```

If you're running the react client, then the sample will run in the browser at
`localhost:3000` otherwise visit `localhost:4242`.


**4. [Optional] Run a webhook locally**

You can use the Stripe CLI to easily spin up a local webhook.

First [install the CLI](https://stripe.com/docs/stripe-cli) and [link your Stripe account](https://stripe.com/docs/stripe-cli#link-account).

```
stripe listen --forward-to localhost:4242/webhook
```

The CLI will print a webhook secret key to the console. Set `STRIPE_WEBHOOK_SECRET` to this value in your `.env` file.

You should see events logged in the console where the CLI is running.

When you are ready to create a live webhook endpoint, follow our guide in the
docs on [configuring a webhook endpoint in the
dashboard](https://stripe.com/docs/webhooks/setup#configure-webhook-settings).
