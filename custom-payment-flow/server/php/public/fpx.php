<?php
require_once 'shared.php';

// Returning after redirecting to the Afterpay/Clearpay portal.
if(array_key_exists('return', $_GET) && $_GET['return'] == 'true') {
  $paymentIntent = \Stripe\PaymentIntent::retrieve([
    'id' => $_GET['payment_intent']
  ]);
?>
<p>Payment <?php echo $paymentIntent->id ?> has status: <?php echo $paymentIntent->status ?></p>
<a href='/fpx.php'>Try FPX again</a><br>
<a href='/'>Restart demo</a>
<?php
  exit;
}

try {
  $paymentIntent = \Stripe\PaymentIntent::create([
    'payment_method_types' => ['fpx'],
    'amount' => 1999,
    'currency' => 'myr',
  ]);
} catch (\Stripe\Exception\ApiErrorException $e) {
  http_response_code(400);
  error_log($e->getError()->message);
?>
  <h1>Error</h1>
  <p>Failed to create a PaymentIntent</p>
  <p>Please check the server logs for more information</p>
<?php
  exit;
} catch (Exception $e) {
  error_log($e);
  http_response_code(500);
  exit;
}
?>


<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FPX</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        const stripe = Stripe('<?php echo $config["stripe_publishable_key"] ?>');

        const elements = stripe.elements();
        const fpxBank = elements.create('fpxBank', {
          accountHolderType: 'individual',
        });
        fpxBank.mount('#fpx-bank-element');

        const paymentForm = document.querySelector('#payment-form');
        paymentForm.addEventListener('submit', async (e) => {
          // Avoid a full page POST request.
          e.preventDefault();

          // Customer inputs
          const nameInput = document.querySelector('#name');

          // Confirm the payment that was created server side:
          const {error, paymentIntent} = await stripe.confirmFpxPayment(
            '<?php echo $paymentIntent->client_secret ?>', {
              payment_method: {
                fpx: fpxBank,
              },
              return_url: `${window.location.origin}/fpx.php?return=true`,
            },
          );
          if(error) {
            alert(error.message);
            return;
          }
          alert(`Payment (${paymentIntent.id}): ${paymentIntent.status}`);
        });
      });
    </script>
  </head>
  <body>
    <main>
      <a href="/">home</a>
      <h1>FPX</h1>

      <form id="payment-form">
        <label for="fpx-bank-element">
          FPX Bank
        </label>
        <div id="fpx-bank-element">
          <!-- A Stripe Element will be inserted here. -->
        </div>

        <button type="submit">Pay</button>

        <!-- Used to display form errors. -->
        <div id="error-message" role="alert"></div>
      </form>

      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
