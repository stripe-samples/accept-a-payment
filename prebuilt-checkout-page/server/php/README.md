# Accept payments with Stripe Checkout using PHP

This server example contains both the client and server bits required for
setting up a Checkout integration.

## Requirements

* PHP

## How to run

1. Confirm `.env` configuration

Copy `.env.example` from the root to `.env` in this server directory, replace with your Stripe API keys:

```sh
cp .env.example .env
```

This sample requires a Price ID in the `price` config variable.

Confirm `price` is set equal to the ID of a Price from your
Stripe account. It should look something like:

```
PRICE=price_12345
```

Note that `price_12345` is a placeholder and the sample will not work with that
price ID. You can [create a price](https://stripe.com/docs/api/prices/create)
from the dashboard or with the Stripe CLI.

<details>
<summary>Enabling Stripe Tax</summary>

   In the [`create-checkout-session.php`](./public/create-checkout-session.php) file you will find the following code commented out
   ```php
   // 'automatic_tax' => ['enabled' => true],
   ```

   Uncomment this line of code and the sales tax will be automatically calculated during the checkout.

   Make sure you previously went through the set up of Stripe Tax: [Set up Stripe Tax](https://stripe.com/docs/tax/set-up) and you have your products and prices updated with tax behavior and optionally tax codes: [Docs - Update your Products and Prices](https://stripe.com/docs/tax/checkout#product-and-price-setup)
</details>

2. Install dependencies with composer

From the directory that contains composer.json, run:

```
composer install
```

3. Run the server locally

Start the server from the public directory with:

```
cd public
php -S localhost:4242
```

4. Go to `localhost:4242` to see the demo.
