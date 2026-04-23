<?php

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// Also set via putenv so getenv() works in endpoint files
foreach ($_ENV as $key => $value) {
    putenv("$key=$value");
}

$stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'];

// For sample support and debugging, not required for production:
\Stripe\Stripe::setAppInfo(
  'stripe-samples/accept-a-payment/elements-with-checkout-sessions',
  '0.0.2',
  'https://github.com/stripe-samples'
);
