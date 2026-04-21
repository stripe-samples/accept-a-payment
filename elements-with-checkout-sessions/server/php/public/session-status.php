<?php

require_once '../vendor/autoload.php';
require_once '../secrets.php';

$stripe = new \Stripe\StripeClient($stripeSecretKey);
header('Content-Type: application/json');

try {
  $session_id = $_GET['session_id'];

  $session = $stripe->checkout->sessions->retrieve($session_id, ['expand' => ['payment_intent']]);

  echo json_encode(['status' => $session->status, 'payment_status' => $session->payment_status, 'payment_intent_id' => $session->payment_intent->id, 'payment_intent_status' => $session->payment_intent->status]);
  http_response_code(200);
} catch (Error $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
