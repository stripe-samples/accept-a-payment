<?php
require_once 'shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->create([
    'payment_method_types' => ['au_becs_debit'],
    'amount' => 1999,
    'currency' => 'aud',
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
    <title>BECS Debit</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="./utils.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        const stripe = Stripe('<?= $_ENV["STRIPE_PUBLISHABLE_KEY"]; ?>', {
          apiVersion: '2020-08-27',
        });
        const elements = stripe.elements();
        const auBankAccount = elements.create('auBankAccount');
        auBankAccount.mount('#au-bank-account-element');


        const paymentForm = document.querySelector('#payment-form');
        paymentForm.addEventListener('submit', async (e) => {
          // Avoid a full page POST request.
          e.preventDefault();

          // Customer inputs
          const nameInput = document.querySelector('#name');
          const emailInput = document.querySelector('#email');

          // Confirm the payment that was created server side:
          const {error, paymentIntent} = await stripe.confirmAuBecsDebitPayment(
            '<?= $paymentIntent->client_secret; ?>', {
              payment_method: {
                au_becs_debit: auBankAccount,
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
      <h1>BECS Direct Debit</h1>

      <p>
        <h4>Try a <a href="https://stripe.com/docs/testing#becs-direct-debit-in-australia">test number</a>:</h4>
        <div>
          <code>000-000</code> (Test BSB)
        </div>
        <div>
          <code>000123456</code>
        </div>
        <div>
          <code>900123456</code>
        </div>
      </p>

      <form id="payment-form">
        <label for="name">
          Name
        </label>
        <input id="name" value="Jenny Rosen" required />

        <label for="email">
          Email Address
        </label>
        <input id="email" type="email" value="jenny.rosen@example.com" required />

        <label for="au-bank-account-element">
          Bank Account
        </label>
        <div id="au-bank-account-element">
          <!-- A Stripe Element will be inserted here. -->
        </div>

        <button type="submit">Pay</button>

        <!-- Used to display form errors. -->
        <div id="error-message" role="alert"></div>

        <!-- Display mandate acceptance text. -->
        <div class="col" id="mandate-acceptance">
          By providing your bank account details and confirming this payment,
          you agree to this Direct Debit Request and the
          <a href="https://stripe.com/au-becs-dd-service-agreement/legal">Direct Debit Request service agreement</a>,
          and authorise Stripe Payments Australia Pty Ltd ACN 160 180 343
          Direct Debit User ID number 507156 (“Stripe”) to debit your account
          through the Bulk Electronic Clearing System (BECS) on behalf of
          <strong>{{INSERT YOUR BUSINESS NAME HERE}}</strong> (the "Merchant")
          for any amounts separately communicated to you by the Merchant. You
          certify that you are either an account holder or an authorised
          signatory on the account listed above.
        </div>

      </form>
      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
