<?php
require_once 'shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->create([
    'payment_method_types' => ['acss_debit'],
    'amount' => 1999,
    'currency' => 'usd',
    'payment_method_options' => [
      'acss_debit' => [
        'mandate_options' => [
          'payment_schedule' => 'sporadic',
          'transaction_type' => 'personal'
        ]
      ]
    ]
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
    <title>Pre-authorized debit in Canada (ACSS)</title>
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

          // Confirm the payment that was created server side:
          const {error, paymentIntent} = await stripe.confirmAcssDebitPayment(
            '<?= $paymentIntent->client_secret; ?>', {
              payment_method: {
                billing_details: {
                  name: nameInput.value,
                  email: emailInput.value,
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
      <h1>Pre-authorized debit in Canada (ACSS)</h1>

      <p>
        <h4>Try these test email addresses:</h4>
        <dl>
          <dt><strong>Immediately attempt</strong></dt>
          <dd><code>{any_prefix}+skip_waiting@{any_domain}</code></dd>
          <dt><strong>Skip the mandate delay and receive the micro-deposit verification</strong></dt>
          <dd><code>{any_prefix}+skip_waiting+test_email@{any_domain}</code></dd>
        </dl>
      </p>


      <form id="payment-form">
        <label for="name">
          Name
        </label>
        <input id="name" value="Jenny Rosen" required />
        <label for="email">
          Email
        </label>
        <input id="email" value="jenny+skip_waiting@example.com" required />

        <button id="submit">Pay</button>
      </form>

      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
