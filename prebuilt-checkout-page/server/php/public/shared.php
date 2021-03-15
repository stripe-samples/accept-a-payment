<?php
// Import the third party libraries, including stripe-php, which are managed by
// composer.
require '../vendor/autoload.php';

// If the config.ini file was not configured properly, display a helpful message.
if(!file_exists('../config.ini')) {
  ?>
  <p>Make a copy of <code>config.ini.sample</code> and name it <code>config.ini</code>, then populate the variables.</p>
  <p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>
  <pre>stripe_secret_key = sk_test_1234...
stripe_publishable_key = pk_test_1234...
stripe_webhook_secret = whsec_1234...
price = price_123...
domain = http://localhost:4242</pre>
  <hr>

  <p>You can use this command to get started:</p>
  <pre>cp config.ini.sample config.ini</pre>

  <?php
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
