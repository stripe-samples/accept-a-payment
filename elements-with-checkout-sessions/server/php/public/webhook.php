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

$payload = file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$webhook_secret = getenv('STRIPE_WEBHOOK_SECRET');

if ($webhook_secret) {
  try {
    $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $webhook_secret);
  } catch (Exception $e) {
    echo 'Webhook signature verification failed.';
    http_response_code(400);
    exit();
  }
} else {
  $event = json_decode($payload, true);
}

$type = is_array($event) ? $event['type'] : $event->type;

if ($type === 'checkout.session.completed') {
  error_log('Payment received!');
}

http_response_code(200);
