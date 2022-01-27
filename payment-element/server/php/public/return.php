<?php
require_once 'shared.php';

// Returning after redirecting to a payment method portal.
$paymentIntent = $stripe->paymentIntents->retrieve(
   $_GET['payment_intent'],
);
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PaymentIntent</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
  </head>
  <body>
    <main>
      <a href="/">home</a>
      <h1>Payment Status</h1>

      <h3>PaymentIntent</h3>
      <p><a href="https://dashboard.stripe.com/test/payments/<?= $paymentIntent->id; ?>" target="_blank">Dashboard</a></p>
      <p>ID <?= $paymentIntent->id; ?></p>
      <p>Status: <?= $paymentIntent->status; ?></p>
      <p>Amount: <?= $paymentIntent->amount; ?></p>
      <p>Currency: <?= $paymentIntent->currency; ?></p>
      <p>Payment Method: <?= $paymentIntent->payment_method; ?></p>
      <a href='/'>Restart demo</a>
    </main>
  </body>
</html>
