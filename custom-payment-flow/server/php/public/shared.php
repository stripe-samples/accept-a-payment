<?php

require '../vendor/autoload.php';

// If the config.ini file was not configured properly, display a helpful message.
if(!file_exists('../config.ini')) {
  ?>
  <h1>Missing <code>config.ini</code></h1>

  <p>Make a copy of <code>config.ini.sample</code> and name it <code>config.ini</code>, then populate the variables.</p>
  <p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>
  <pre>stripe_secret_key = sk_test_1234...
stripe_publishable_key = pk_test_1234...
stripe_webhook_secret = whsec_1234...
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
  ?>

  <h1>Invalid <code>config.ini</code></h1>
  <p>Make a copy of <code>config.ini.sample</code> and name it <code>config.ini</code>, then populate the variables.</p>
  <p>It should look something like the following, but contain your <a href='https://dashboard.stripe.com/test/apikeys'>API keys</a>:</p>
  <pre>stripe_secret_key = sk_test_1234...
stripe_publishable_key = pk_test_1234...
stripe_webhook_secret = whsec_1234...
domain = http://localhost:4242</pre>
  <hr>

  <p>You can use this command to get started:</p>
  <pre>cp config.ini.sample config.ini</pre>

  <?php
  exit;
}

$stripe = new \Stripe\StripeClient($config['stripe_secret_key']);
