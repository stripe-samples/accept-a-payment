<?php
require_once 'shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->create([
    'payment_method_types' => ['sepa_debit'],
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
    <title>SEPA Direct Debit</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="./utils.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        const stripe = Stripe('<?= $_ENV["STRIPE_PUBLISHABLE_KEY"]; ?>', {
          apiVersion: '2020-08-27',
        });
        const elements = stripe.elements();
        const iban = elements.create('iban', {
          supportedCountries: ['SEPA'],
        });
        iban.mount('#iban-element');


        const paymentForm = document.querySelector('#payment-form');
        paymentForm.addEventListener('submit', async (e) => {
          // Avoid a full page POST request.
          e.preventDefault();

          // Customer inputs
          const nameInput = document.querySelector('#name');
          const emailInput = document.querySelector('#email');

          // Confirm the payment that was created server side:
          const {error, paymentIntent} = await stripe.confirmSepaDebitPayment(
            '<?= $paymentIntent->client_secret; ?>', {
              payment_method: {
                sepa_debit: iban,
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

          // Initially the test PaymentIntent will be in the `processing` state.
          // We'll refetch the payment intent client-side after 5 seconds to show
          // that it successfully transitions to the `succeeded` state.
          //
          // In practice, you should use webhook notifications for fulfillment.
          if(paymentIntent.status === 'processing') {
            addMessage(
              `Payment processing: ${paymentIntent.id} check webhook events for fulfillment.`
            );
            addMessage('Refetching payment intent in 5s.');
            setTimeout(async () => {
              const {paymentIntent: pi} = await stripe.retrievePaymentIntent(
                '<?= $paymentIntent->client_secret; ?>'
              );
              addMessage(`Payment (${pi.id}): ${pi.status}`);
            }, 5000)
          } else {
            addMessage(`Payment (${paymentIntent.id}): ${paymentIntent.status}`);
          }
        });
      });
    </script>
  </head>
  <body>
    <main>
      <a href="/">home</a>
      <h1>SEPA Direct Debit</h1>

      <p>
        <h4>Try a <a href="https://stripe.com/docs/testing#sepa-direct-debit">test IBAN account number</a>:</h4>
        <div>
          <code>DE89370400440532013000</code>
        </div>
        <div>
          <code>IE29AIBK93115212345678</code>
        </div>
      </p>

      <form id="payment-form">
        <label for="name">
          Name
        </label>
        <input id="name" placeholder="Jenny Rosen" value="Jenny Rosen" required />

        <label for="email">
          Email Address
        </label>
        <input id="email" type="email" value="jenny.rosen@example.com" placeholder="jenny.rosen@example.com" required />

        <label for="iban-element">
          IBAN
        </label>
        <div id="iban-element">
          <!-- A Stripe Element will be inserted here. -->
        </div>

        <button type="submit">Pay</button>

        <!-- Display mandate acceptance text. -->
        <div id="mandate-acceptance">
          By providing your payment information and confirming this payment, you authorise
          (A) <strong>INSERT YOUR BUSINESS NAME HERE</strong> and Stripe,
          our payment service provider and/or PPRO, its local service provider, to send
          instructions to your bank to debit your account and (B) your bank to debit your
          account in accordance with those instructions. As part of your rights, you are
          entitled to a refund from your bank under the terms and conditions of your agreement
          with your bank. A refund must be claimed within 8 weeks starting from the date on
          which your account was debited. Your rights are explained in a statement that you
          can obtain from your bank. You agree to receive notifications for future debits up
          to 2 days before they occur.
        </div>

        <!-- Used to display form errors. -->
        <div id="error-message" role="alert"></div>
      </form>

      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
