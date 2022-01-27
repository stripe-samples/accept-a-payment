<?php
require_once 'shared.php';

// This is the root of the URL and includes the scheme. It usually looks like
// `http://localhost:4242`. This is used when constructing the fully qualified
// URL where the user will be redirected to after going through the payment
// flow.
$domain_url = $_ENV['DOMAIN'];

// Create new Checkout Session for the order
// ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
$checkout_session = $stripe->checkout->sessions->create([
  'success_url' => $domain_url . '/success.php?session_id={CHECKOUT_SESSION_ID}',
  'cancel_url' => $domain_url . '/canceled.html',
  'mode' => 'payment',
  // 'automatic_tax' => ['enabled' => true],
  'line_items' => [[
    'price' => $_ENV['PRICE'],
    'quantity' => 1,
  ]]
]);

header("HTTP/1.1 303 See Other");
header("Location: " . $checkout_session->url);
