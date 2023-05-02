<?php
require_once 'shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->create([
    'payment_method_types' => ['link', 'card'],
    'amount' => 1999,
    'currency' => 'usd',
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
    <title>Link</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="./utils.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        const stripe = Stripe('<?= $_ENV["STRIPE_PUBLISHABLE_KEY"]; ?>', {
          apiVersion: '2022-11-15',
        });
          // Enable the skeleton loader UI for the optimal loading experience.
        const loader = 'auto';
        const clientSecret = '<?= $paymentIntent->client_secret; ?>';
        const elements = stripe.elements({clientSecret, loader});
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        const linkAuthenticationElement = elements.create('linkAuthentication');
        linkAuthenticationElement.mount('#link-authentication-element');

        const paymentForm = document.querySelector('#payment-form');
        paymentForm.addEventListener('submit', async (e) => {
          // Avoid a full page POST request.
          e.preventDefault();

          // Disable the form from submitting twice.
          paymentForm.querySelector('button').disabled = true;

          const {error} = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: 'http://localhost:4242/payment/next',
            },
          });
          if(error) {
            addMessage(error.message);

            // Re-enable the form so the customer can resubmit.
            paymentForm.querySelector('button').disabled = false;
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
      <h1>Link</h1>

      <p>
        <h4>Try a <a href="https://stripe.com/docs/testing#cards" target="_blank">test card</a>:</h4>
        <div>
          <code>4242424242424242</code> (Visa)
        </div>
        <div>
          <code>5555555555554444</code> (Mastercard)
        </div>
        <div>
          <code>4000002500003155</code> (Requires <a href="https://www.youtube.com/watch?v=2kc-FjU2-mY" target="_blank">3DSecure</a>)
        </div>
      </p>

      <p>
        Use any future expiration, any 3 digit CVC, and any postal code.
      </p>

      <form id="payment-form">
        <h3>Contact info</h3>
        <div id="link-authentication-element"></div>
         <!--Stripe.js injects the Link Authentication Element-->
         <h3>Payment</h3>
         <div id="payment-element"></div>
         <!--Stripe.js injects the Payment Element-->

        <!-- We'll put the error messages in this element -->
        <div id="card-errors" role="alert"></div>

        <button id="submit">Pay</button>
      </form>

      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
