<?php
// Import the third party libraries, including stripe-php, which are managed by
// composer.
require '../vendor/autoload.php';

// If the .env file was not configured properly, display a helpful message.
if(!file_exists('../.env')) {
  http_response_code(400);
  ?>
  <p>Make a copy of <code>.env.example</code>, place it in the same directory as composer.json, and name it <code>.env</code>, then populate the variables.</p>
  <p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>
  <pre>STRIPE_PUBLISHABLE_KEY=pk_test...
STRIPE_SECRET_KEY=sk_test...
STRIPE_WEBHOOK_SECRET=whsec_...
PRICE=price_abc123...
DOMAIN=http://localhost:4242</pre>
  <hr>

  <p>You can use this command to get started:</p>
  <pre>cp .env.example .env</pre>

  <?php
  exit;
}

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Make sure the configuration file is good.
if (!$_ENV['STRIPE_SECRET_KEY']) {
  http_response_code(400);
  ?>

  <h1>Invalid <code>.env</code></h1>
  <p>Make a copy of <code>.env.example</code>, place it in the same directory as composer.json, and name it <code>.env</code>, then populate the variables.</p>
  <p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>
  <pre>STRIPE_PUBLISHABLE_KEY=pk_test...
STRIPE_SECRET_KEY=sk_test...
STRIPE_WEBHOOK_SECRET=whsec_...
PRICE=price_abc123...
DOMAIN=http://localhost:4242</pre>
  <hr>

  <hr>

  <p>You can use this command to get started:</p>
  <pre>cp .env.example .env</pre>

  <?php
  exit;
}

// This sample requires that a Stripe Price was created. You can create a
// Product and Price from the Stripe dashboard, or using the Stripe CLI.
//
// https://stripe.com/docs/api/prices/create
$price = $_ENV['PRICE'];
if (!$price || $price == 'price_12345...') {
  http_response_code(400);
  ?>

  <h1>Missing price ID in <code>.env</code></h1>
  <p>Make a copy of <code>.env.example</code>, place it in the same directory as composer.json, and name it <code>.env</code>, then populate the variables.</p>
  <p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>
  <pre>STRIPE_PUBLISHABLE_KEY=pk_test...
STRIPE_SECRET_KEY=sk_test...
STRIPE_WEBHOOK_SECRET=whsec_...
PRICE=price_abc123...
DOMAIN=http://localhost:4242</pre>
  <hr>

  <p>You can use this command to <a href="https://stripe.com/docs/api/prices/create">create a price</a> with the Stripe CLI:</p>
  <pre>stripe prices create --unit-amount 1000 --currency usd</pre>

  <?php
  exit;
}

// For sample support and debugging. Not required for production:
\Stripe\Stripe::setAppInfo(
  "stripe-samples/accept-a-payment/prebuilt-checkout-page",
  "0.0.1",
  "https://github.com/stripe-samples"
);

$stripe = new \Stripe\StripeClient($_ENV['STRIPE_SECRET_KEY']);
