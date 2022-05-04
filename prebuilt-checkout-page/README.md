# Accept a payment with Stripe Checkout

This integration shows you how to accept payments with Stripe
[Checkout](https://stripe.com/docs/checkout).

Building a payment form UI from scratch is difficult -- input field
validation, error message handing, and localization are just a few things
to think about when designing a simple checkout flow.

We built [Checkout](https://stripe.com/docs/payments/checkout) to do that
work for you so now you can focus on building the best storefront
experience for your customers.

Once your customer is ready to pay, use Stripe.js to redirect them to the
URL of your Stripe hosted payment page. 🥳

## How to run locally

Recommended approach is to install with the [Stripe CLI](https://stripe.com/docs/stripe-cli#install):

```sh
stripe samples create accept-a-payment
```

Then pick:

```sh
prebuilt-checkout-page
```

This sample includes several different server implementations and several
different client implementations. The servers all implement the same routes and
the clients all work with the same server routes.

Pick a server:

- [dotnet](./server/dotnet)
- [go](./server/go)
- [java](./server/java)
- [node](./server/node)
- [php](./server/php)
- [python](./server/python)
- [ruby](./server/ruby)
- [php-slim](./server/php-slim)

Pick a client:

- [html](./client/html)
- [react-cra](./client/react-cra) (React with create-react-app)
- [vue-cva](./client/vue-cva)  (React with Create Vite App)


**Installing and cloning manually**

If you do not want to use the Stripe CLI, you can manually clone and configure
the sample yourself:

```
git clone https://github.com/stripe-samples/accept-a-payment
```

Rename and move the [`.env.example`](.env.example) file into a file named
`.env` in the specific folder of the server language you want to use. For
example:

```
cp .env.example prebuilt-checkout-page/server/node/.env
```

Example `.env` file:

```sh
STRIPE_PUBLISHABLE_KEY=<replace-with-your-publishable-key>
STRIPE_SECRET_KEY=<replace-with-your-secret-key>
PRICE=<replace-with-a-price-id-from-your-account>
STATIC_DIR=../../client/html
DOMAIN=http://localhost:4242
```

You will need a Stripe account in order to run the demo. Once you set up
your account, go to the Stripe [developer
dashboard](https://stripe.com/docs/development#api-keys) to find your API
keys.

The other environment variables are configurable:

`STATIC_DIR` tells the server where to the client files are located and does
not need to be modified unless you move the server files.

`DOMAIN` is the domain of your website, where Checkout will redirect back to
after the customer completes the payment on the Checkout page.

**2. Create a Price**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Products and Prices in the Dashboard or with the API. This
sample requires a Price to run. Once you've created a Price, and add its ID to
your `.env`.

`PRICE` is the ID of a [Price](https://stripe.com/docs/products-prices/manage-prices?dashboard-or-api=dashboard#create-price) for
your product. A Price has a unit amount and currency.

You can quickly create a Price with the Stripe CLI like so:

```sh
stripe prices create --unit-amount 500 --currency usd -d "product_data[name]=demo"
```

<details>
<summary>With Stripe Tax</summary>
  Stripe Tax lets you calculate and collect sales tax, VAT and GST with one line of code.

  Before creating a price, make sure you have Stripe Tax set up in the dashboard: [Docs - Set up Stripe Tax](https://stripe.com/docs/tax/set-up).

  Stripe needs to know what kind of product you are selling to calculate the taxes. For this example we will submit a tax code describing what kind of product is used: `txcd_10000000` which is 'General - Electronically Supplied Services'. You can find a list of all tax codes here: [Available tax codes](https://stripe.com/docs/tax/tax-codes). If you leave the tax code empty, Stripe will use the default one from your [Tax settings](https://dashboard.stripe.com/test/settings/tax).

  ```sh
  stripe products create \
    --name="demo" \
    --tax-code="txcd_10000000"
  ```

  From the response, copy the `id` and create a price. The tax behavior can be either `inclusive` or `exclusive`. For our example, we are using `exclusive`.

  ```sh
  stripe prices create \
    --unit-amount=500 \
    --currency=usd \
    --tax-behavior=exclusive \
    --product=<INSERT_ID, like prod_ABC123>
  ```

  More Information: [Docs - Update your Products and Prices](https://stripe.com/docs/tax/checkout#product-and-price-setup)
</details>

Which will return the json:

```json
{
  "id": "price_1Hh1ZeCZ6qsJgndJaX9fauRl",
  "object": "price",
  "active": true,
  "billing_scheme": "per_unit",
  "created": 1603841250,
  "currency": "usd",
  "livemode": false,
  "lookup_key": null,
  "metadata": {
  },
  "nickname": null,
  "product": "prod_IHalmba0p05ZKD",
  "recurring": null,
  "tiers_mode": null,
  "transform_quantity": null,
  "type": "one_time",
  "unit_amount": 500,
  "unit_amount_decimal": "500"
}
```

Take the Price ID, in the example case `price_1Hh1ZeCZ6qsJgndJaX9fauRl`, and set the environment variable in `.env`:

```sh
PRICE=price_1Hh1ZeCZ6qsJgndJaX9fauRl
```

**3. Follow the server instructions on how to run**

Pick the server language you want and follow the instructions in the server
folder README on how to run.

For example, if you want to run the Node server:

```
cd server/node 
# There's a README in this folder with instructions to run the server and how to enable Stripe Tax.
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

The CLI will print a webhook secret key to the console. Set
`STRIPE_WEBHOOK_SECRET` to this value in your `.env` file.

You should see events logged in the console where the CLI is running.

When you are ready to create a live webhook endpoint, follow our guide in the
docs on [configuring a webhook endpoint in the
dashboard](https://stripe.com/docs/webhooks/setup#configure-webhook-settings).
