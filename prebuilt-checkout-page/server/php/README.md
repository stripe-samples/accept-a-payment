# Checkout subscription with add-ons with PHP

## Requirements

* PHP
* [Configured .env file](../../README.md)

## How to run

1. Confirm `config.ini` configuration

Copy `config.ini.sample` to `config.ini`, replace with your Stripe API keys:

```sh
cp config.ini.sample config.ini
```

This sample requires a Price ID in the `price` config variable.

Confirm `price` is set equal to the ID of a Price from your
Stripe account. It should look something like:

```
price = price_1Hh1ZeCZ6qsJgndJaX9fauRl
```

Note that `price_12345` is a placeholder and the sample will not work with that
price ID. You can [create a price](https://stripe.com/docs/api/prices/create)
from the dashboard or with the Stripe CLI.

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
