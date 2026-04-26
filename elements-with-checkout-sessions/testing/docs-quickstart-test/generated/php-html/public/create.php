<?php

require_once '../vendor/autoload.php';
require_once '../secrets.php';

$stripe = new \Stripe\StripeClient([
  "api_key" => $stripeSecretKey,
  "stripe_version" => "2025-08-04"
]);
header('Content-Type: application/json');

$YOUR_DOMAIN = 'http://localhost:4245';


$checkout_session = $stripe->checkout->sessions->create([

  'ui_mode' => 'elements',
  'line_items' => [[
    # Provide the exact Price ID (for example, price_1234) of the product you want to sell
    'price' => getenv('STRIPE_PRICE_ID'),
    'quantity' => 1,
  ]],
  'mode' => 'payment',
  'return_url' => $YOUR_DOMAIN . '/complete.html?session_id={CHECKOUT_SESSION_ID}',
]);

echo json_encode(array('clientSecret' => $checkout_session->client_secret));
