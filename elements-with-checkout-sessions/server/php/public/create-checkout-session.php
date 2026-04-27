<?php

require_once '../vendor/autoload.php';
require_once '../secrets.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit();
}

$stripe = new \Stripe\StripeClient([
  "api_key" => $stripeSecretKey,
]);
header('Content-Type: application/json');

$port = getenv('PORT') ?: '4242';
$YOUR_DOMAIN = getenv('DOMAIN') ?: "http://localhost:$port";

try {
  $checkout_session = $stripe->checkout->sessions->create([
    'ui_mode' => 'elements',
    // You can also use an existing Price: ['price' => 'price_xxx', 'quantity' => 1]
    'line_items' => [[
      'price_data' => [
        'product_data' => [
          'name' => 'T-shirt',
        ],
        'currency' => 'usd',
        'unit_amount' => 2000,
      ],
      'quantity' => 1,
    ]],
    'mode' => 'payment',
    'return_url' => $YOUR_DOMAIN . '/complete?session_id={CHECKOUT_SESSION_ID}',
    'adaptive_pricing' => ['enabled' => true],
  ] + (getenv('CUSTOMER_EMAIL') ? ['customer_email' => getenv('CUSTOMER_EMAIL')] : []));

  echo json_encode(array('clientSecret' => $checkout_session->client_secret));
} catch (Exception $e) {
  http_response_code(400);
  echo json_encode(['error' => ['message' => $e->getMessage()]]);
}
