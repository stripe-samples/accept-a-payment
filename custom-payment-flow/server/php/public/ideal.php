<?php
require_once 'shared.php';

// Returning after redirecting to the Afterpay/Clearpay portal.
if(array_key_exists('return', $_GET) && $_GET['return'] == 'true') {
  $paymentIntent = \Stripe\PaymentIntent::retrieve([
    'id' => $_GET['payment_intent']
  ]);

?>
<p>Payment <?php echo $paymentIntent->id ?> has status: <?php echo $paymentIntent->status ?></p>
<a href='/ideal.php'>Try iDEAL again</a><br>
<a href='/'>Restart demo</a>
<?php
  exit;
}

try {
  $paymentIntent = \Stripe\PaymentIntent::create([
    'payment_method_types' => ['ideal'],
    'amount' => 1999,
    'currency' => 'eur',
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
    <title>iDEAL</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        const stripe = Stripe('<?php echo $config["stripe_publishable_key"] ?>');
        const elements = stripe.elements();
        const idealBank = elements.create('idealBank');
        idealBank.mount('#ideal-bank-element');


        const paymentForm = document.querySelector('#payment-form');
        paymentForm.addEventListener('submit', async (e) => {
          // Avoid a full page POST request.
          e.preventDefault();

          // Customer inputs
          const nameInput = document.querySelector('#name');

          // Confirm the payment that was created server side:
          const {error, paymentIntent} = await stripe.confirmIdealPayment(
            '<?php echo $paymentIntent->client_secret ?>', {
              payment_method: {
                ideal: idealBank,
              },
              return_url: `${window.location.origin}/ideal.php?return=true`,
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
      <h1>iDEAL</h1>

      <form id="payment-form">
        <label for="name">
          Name
        </label>
        <input id="name" value="Jenny Rosen" required>

        <!--
          Using a label with a for attribute that matches the ID of the
          Element container enables the Element to automatically gain focus
          when the customer clicks on the label.
        -->
        <label for="ideal-bank-element">
          iDEAL Bank
        </label>
        <div id="ideal-bank-element">
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
