<?php

require '../vendor/autoload.php';

// If the .env file was not configured properly, display a helpful message.
if(!file_exists('../.env')) {
  ?>
  <h1>Missing <code>.env</code></h1>

  <p>Make a copy of <code>.env.example</code>, place it in the same directory as composer.json, and name it <code>.env</code>, then populate the variables.</p>
  <p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>
  <pre>STRIPE_PUBLISHABLE_KEY=pk_test...
STRIPE_SECRET_KEY=sk_test...
STRIPE_WEBHOOK_SECRET=whsec_...
DOMAIN=http://localhost:4242</pre>
  <hr>

  <p>You can use this command to get started:</p>
  <pre>cp .env.example .env</pre>

  <?php
  exit;
}

// Load `.env` file from the server directory so that
// environment variables are available in $_ENV or via
// getenv().
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Make sure the configuration file is good.
if (!$_ENV['STRIPE_SECRET_KEY']) {
  ?>

  <h1>Invalid <code>.env</code></h1>
  <p>Make a copy of <code>.env.example</code> and name it <code>.env</code>, then populate the variables.</p>
  <p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>
  <pre>STRIPE_PUBLISHABLE_KEY=pk_test...
STRIPE_SECRET_KEY=sk_test...
STRIPE_WEBHOOK_SECRET=whsec_...
DOMAIN=http://localhost:4242</pre>
  <hr>

  <p>You can use this command to get started:</p>
  <pre>cp .env.example .env</pre>

  <?php
  exit;
}

// For sample support and debugging. Not required for production:
\Stripe\Stripe::setAppInfo(
  "stripe-samples/accept-a-payment/custom-payment-form",
  "0.0.2",
  "https://github.com/stripe-samples"
);

$stripe = new \Stripe\StripeClient([
  'api_key' => $_ENV['STRIPE_SECRET_KEY'],
  'stripe_version' => '2020-08-27',
]);
