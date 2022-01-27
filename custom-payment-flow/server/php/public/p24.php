<?php
require_once 'shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->create([
    'payment_method_types' => ['p24'],
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
    <title>Przelewy24 (P24)</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="./utils.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        const stripe = Stripe('<?= $_ENV["STRIPE_PUBLISHABLE_KEY"]; ?>', {
          apiVersion: '2020-08-27',
        });

        const elements = stripe.elements();
        const p24 = elements.create('p24Bank');
        p24.mount('#p24-bank-element');


        const paymentForm = document.querySelector('#payment-form');
        paymentForm.addEventListener('submit', async (e) => {
          // Avoid a full page POST request.
          e.preventDefault();

          // Customer inputs
          const nameInput = document.querySelector('#name');
          const emailInput = document.querySelector('#email');

          // Confirm the payment that was created server side:
          const {error, paymentIntent} = await stripe.confirmP24Payment(
            '<?= $paymentIntent->client_secret; ?>', {
              payment_method: {
                p24: p24,
                billing_details: {
                  name: nameInput.value,
                  email: emailInput.value,
                },
              },
              payment_method_options: {
                p24: {
                  // In order to be able to pass the `tos_shown_and_accepted` parameter, you must
                  // ensure that the P24 regulations and information obligation consent
                  // text is clearly visible to the customer. See
                  // https://stripe.com/docs/payments/p24/accept-a-payment#requirements
                  // for directions.
                  tos_shown_and_accepted: true,
                },
              },
              return_url: `${window.location.origin}/return.php`,
            },
          );
          if(error) {
            addMessage(error.message);
            return;
          }
          addMessage(`Payment (${paymentIntent.id}): ${paymentIntent.status}`);
        });
      });
    </script>
  </head>
  <body>
    <main>
      <a href="/">home</a>
      <h1>Przelewy24 (P24)</h1>

      <form id="payment-form">
        <label for="name">
          Name
        </label>
        <input id="name" placeholder="Jenny Rosen" value="Jenny Rosen" required />
        <label for="email">
          Email
        </label>
        <input id="email" placeholder="jenny.rosen@example.com" value="jenny.rosen@example.com" required />


        <label for="p24-bank-element">
          P24 Bank
        </label>
        <div id="p24-bank-element">
          <!-- Elements will create input elements here -->
        </div>

        <button id="submit">Pay</button>
      </form>

      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
