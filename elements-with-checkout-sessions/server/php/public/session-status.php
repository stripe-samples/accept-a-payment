<?php

require_once '../vendor/autoload.php';
require_once '../secrets.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  exit();
}

$stripe = new \Stripe\StripeClient([
  "api_key" => $stripeSecretKey,
]);
header('Content-Type: application/json');

try {
  $session_id = $_GET['session_id'];

  $session = $stripe->checkout->sessions->retrieve($session_id, ['expand' => ['payment_intent']]);

  $pi = $session->payment_intent;
  echo json_encode(['status' => $session->status, 'payment_status' => $session->payment_status, 'payment_intent_id' => $pi ? $pi->id : null, 'payment_intent_status' => $pi ? $pi->status : null]);
} catch (Exception $e) {
  http_response_code(400);
  echo json_encode(['error' => ['message' => $e->getMessage()]]);
}
