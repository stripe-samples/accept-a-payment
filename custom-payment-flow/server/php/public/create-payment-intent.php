<?php

require_once 'shared.php';

try {
  $paymentIntent = \Stripe\PaymentIntent::create([
    'payment_method_types' => [$body->paymentMethodType],
    'amount' => 1999,
    'currency' => $body->currency,
  ]);

  echo json_encode(['clientSecret' => $paymentIntent->client_secret]);

} catch (\Stripe\Exception\ApiErrorException $e) {
  http_response_code(400);
  echo json_encode(['error' => ['message' => $e->getError()->message]]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode($e);
}
