<?php
require_once 'shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->create([
    'payment_method_types' => ['boleto'],
    'amount' => 5000,
    'currency' => 'brl',
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
    <title>Boleto</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="./utils.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        const stripe = Stripe('<?= $_ENV["STRIPE_PUBLISHABLE_KEY"]; ?>', {
          apiVersion: '2020-08-27',
        });

        const paymentForm = document.querySelector('#payment-form');
        paymentForm.addEventListener('submit', async (e) => {
          // Avoid a full page POST request.
          e.preventDefault();

          // Customer inputs
          const nameInput = document.querySelector('#name');
          const emailInput = document.querySelector('#email');
          const taxIdInput = document.querySelector('#tax_id');
          const countryInput = document.querySelector('#country');
          const stateInput = document.querySelector('#state');
          const cityInput = document.querySelector('#city');
          const postalCodeInput = document.querySelector('#postal_code');
          const line1Input = document.querySelector('#line1');

          // Confirm the payment that was created server side:
          const {error, paymentIntent} = await stripe.confirmBoletoPayment(
            '<?= $paymentIntent->client_secret; ?>', {
              payment_method: {
                billing_details: {
                  address: {
                    country: countryInput.value,
                    state: stateInput.value,
                    city: cityInput.value,
                    postal_code: postalCodeInput.value,
                    line1: line1Input.value,
                  },
                  name: nameInput.value,
                  email: emailInput.value,
                },
                boleto: {
                  tax_id: taxIdInput.value,
                },
              },
            }
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
      <h1>Boleto</h1>

      <form id="payment-form">
        
        <label for="name">
          Name
        </label>
        <input id="name" value="Jenny Rosen" required>

        <label for="email">
          Email
        </label>
        <input id="email" value="jr.succeed_immediately@example.com" required>

        <label for="tax_id">
          Tax id
        </label>
        <input id="tax_id" value="000.000.000-00" required>

        <label for="country">
          Country
        </label>
        <input id="country" value="BR" required>

        <label for="state">
          State
        </label>
        <input id="state" value="SP" required>

        <label for="city">
          City
        </label>
        <input id="city" value="São Paulo" required>

        <label for="postal_code">
          Postal Code
        </label>
        <input id="postal_code" value="01227-200" required>

        <label for="line1">
          Address
        </label>
        <input id="line1" value="Av Angelica 2491, Conjunto 91E" required>

        <!-- Used to display form errors. -->
        <div id="error-message" role="alert"></div>

        <button type="submit">Pay</button>
      </form>

      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
