<?php

require '../vendor/autoload.php';

// If the config.ini file was not configured properly, display a helpful message.
if(!file_exists('../config.ini')) {
  echo "<p>Make a copy of <code>config.ini.sample</code> and name it <code>config.ini</code>, then populate the variables.</p>";
  echo "<p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>";
  echo "<pre>";
  echo "stripe_secret_key = sk_test_1234...\n";
  echo "stripe_publishable_key = pk_test_1234...\n";
  echo "stripe_webhook_secret = whsec_1234...\n";
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

\Stripe\Stripe::setApiKey($config['stripe_secret_key']);
