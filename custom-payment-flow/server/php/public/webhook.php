<?php

require_once 'shared.php';

$event = null;

try {
	// Make sure the event is coming from Stripe by checking the signature header
	$event = \Stripe\Webhook::constructEvent($input, $_SERVER['HTTP_STRIPE_SIGNATURE'], $config['stripe_webhook_secret']);
}
catch (Exception $e) {
	http_response_code(403);
	echo json_encode([ 'error' => $e->getMessage() ]);
	exit;
}

$details = '';

if ($event->type == 'payment_intent.succeeded') {
	// Fulfill any orders, e-mail receipts, etc
	// To cancel the payment you will need to issue a Refund (https://stripe.com/docs/api/refunds)
	$details = '💰 Payment received!';
}
else if ($event->type == 'payment_intent.payment_failed') {
	$details = '❌ Payment failed.';
}

$output = [
	'status' => 'success',
	'details' => $details
];

echo json_encode($output, JSON_PRETTY_PRINT);
