# Accepting a card payment with PHP

## Requirements

- PHP

## How to run

1. Run composer to set up dependencies

```
composer install
```

2. Copy config.ini.sample to config.ini and replace with your Stripe API keys

```
cp config.ini.sample config.ini
```

3. Run the server locally

```
cd public
php -S 127.0.0.1:4242
```

4. Go to localhost:4242

5) For mobile clients: Edit the client to use the "create-payment-intent.php" endpoint instead of "create-payment-intent"
