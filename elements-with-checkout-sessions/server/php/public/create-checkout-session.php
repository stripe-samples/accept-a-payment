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
    // Set customer_email when the user is already known (e.g. logged in) —
    // the payment form will display it as read-only. In production, use your
    // authenticated user's email. The +location_FR suffix is a test-mode
    // feature that simulates a customer in France for Adaptive Pricing.
    'customer_email' => 'test+location_FR@example.com',
  ]);

  echo json_encode(array('clientSecret' => $checkout_session->client_secret));
} catch (Exception $e) {
  http_response_code(400);
  echo json_encode(['error' => ['message' => $e->getMessage()]]);
}
