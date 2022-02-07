<?php
// For more information about Stripe webhooks, take a look at the official
// documentation: https://stripe.com/docs/webhooks/build.
require_once 'shared.php';

// If this request is a POST request, then deserialize the input.
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $input = file_get_contents('php://input');
  $body = json_decode($input);
} else {
  // This route should only ever receive POST requests directly
  // from Stripe.
  error_log('Received non POST request to webhook.php');
  exit;
}

$event = null;
try {
  // Make sure the event is coming from Stripe by checking the signature header.
  $event = \Stripe\Webhook::constructEvent(
    $input,
    $_SERVER['HTTP_STRIPE_SIGNATURE'],
    $_ENV['STRIPE_WEBHOOK_SECRET']
  );
} catch (Exception $e) {
  // If deserialization fails, this error message will be rendered back to Stripe.
  http_response_code(403);
  echo json_encode([ 'error' => $e->getMessage() ]);
  exit;
}

// Switch on the type of the event and automate. View the API reference for a
// full list of available event types.
//
// https://stripe.com/docs/api/events/types
if($event->type == 'checkout.session.completed') {
  error_log('🔔  Checkout Session was completed!');
  //
} else {
  error_log('🔔  Other webhook received! ' . $event->type);
}

echo json_encode(['status' => 'success']);
