<?php
// Import the third party libraries, including stripe-php, which are managed by
// composer.
require '../vendor/autoload.php';

// If the config.ini file was not configured properly, display a helpful message.
if(!file_exists('../config.ini')) {
  echo "<p>Make a copy of <code>config.ini.sample</code> and name it <code>config.ini</code>, then populate the variables.</p>";
  echo "<p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a> and a <a href='https://stripe.com/docs/api/prices/create'>Price ID</a>.:</p>";
  echo "<pre>";
  echo "stripe_secret_key = sk_test_1234...\n";
  echo "stripe_publishable_key = pk_test_1234...\n";
  echo "stripe_webhook_secret = whsec_1234...\n";
  echo "price = price_123...\n";
  echo "domain = http://localhost:4242\n";
  echo "</pre>";
  echo "<hr>";
  echo "You can use this command to get started:<br>";
  echo "<pre>cp config.ini.sample config.ini</pre>";
  exit;
}

$config = parse_ini_file('../config.ini');

// Make sure the configuration file is good.
if (!$config) {
  http_response_code(500);
  echo json_encode([ 'error' => 'Internal server error.' ]);
  exit;
}

// This sample requires that a Stripe Price was created. You can create a
// Product and Price from the Stripe dashboard, or using the Stripe CLI.
//
// https://stripe.com/docs/api/prices/create
$price = $config['price'];
if (!$price || $price == 'price_12345') {
  http_response_code(500);
  echo "You must set a Price ID in the config.ini file. Please see the README";
  exit;
}

\Stripe\Stripe::setApiKey($config['stripe_secret_key']);
