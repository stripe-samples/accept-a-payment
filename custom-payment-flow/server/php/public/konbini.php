<?php
require_once 'shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->create([
    'payment_method_types' => ['konbini'],
    'amount' => 1999,
    'currency' => 'jpy',
    'payment_method_options' => [
        'konbini' => [
            'product_description' => 'Tシャツ',
            'expires_after_days' => 3,
        ],
    ],
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
    <title>Card</title>
    <link rel="stylesheet" href="css/base.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="./utils.js"></script>
    <script>
        
        document.addEventListener('DOMContentLoaded', async () => {
            const stripe = Stripe('<?= $_ENV["STRIPE_PUBLISHABLE_KEY"]; ?>', {
                apiVersion: '2020-08-27',
            });
        
            // When the form is submitted...
            var form = document.getElementById('payment-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                form.querySelector('button').disabled = true;
                addMessage(`Client secret returned.`);            
                const nameInput = document.querySelector('#name');
                const emailInput = document.querySelector('#email');
                const phonelInput = document.querySelector('#phone');
            
                // Confirm the payment given the clientSecret from the payment intent that
                // was just created on the server.
                let { error, paymentIntent } = await stripe.confirmKonbiniPayment(
                    '<?= $paymentIntent->client_secret; ?>',
                    {
                        payment_method: {
                            billing_details: {
                                name: nameInput.value,
                                email: emailInput.value,
                            },
                        },
                        payment_method_options: {
                            konbini: {
                                confirmation_number: phonelInput.value.replace(/\D/g,''),
                            },
                        },
                    }
                );
            
                if (error) {
                    addMessage(error.message);
                    form.querySelector('button').disabled = false;
                    return;
                }
            
                addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
            
                // When passing {any_prefix}succeed_immediately@{any_suffix}
                // as the email address in the billing details, the payment
                // intent will succeed after 3 seconds. We set this timeout
                // to refetch the payment intent.
                const i = setInterval(async () => {
                    let { error, paymentIntent } = await stripe.retrievePaymentIntent(
                        '<?= $paymentIntent->client_secret; ?>'
                    );
                    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
                    if (paymentIntent.status === 'succeeded') {
                        clearInterval(i);
                    }
                }, 500);
            });
        });
    </script>
  </head>
  <body>
    <main>
      <a href="/">home</a>
      <h1>Konbini(コンビニ)</h1>

      <div>
        <ul>
            <li>Email: <code>{any_prefix}@{any_domain}</code><small>(Example: hanako@test.com)</small></li>
            <li>Phone Number: <code>11111111110</code></li>
            <li>Simulates a Konbini payment which succeeds after 3 minutes and the payment_intent.succeeded webhook arrives after that.</li>
        </ul>
        <ul>
            <li>Email: <code>{any_prefix}succeed_immediately@{any_domain}</code><small>(Example: succeed_immediately@test.com)</small></li>
            <li>Phone Number: <code>22222222220</code></li>
            <li>Simulates a Konbini payment which succeeds immediately and the payment_intent.succeeded webhook arrives after that.</li>
        </ul>
      </div>

      <form id="payment-form">
        <label for="name"> Name </label>
        <input id="name" value="Jenny Rosen" required />

        <label for="email"> Email </label>
        <input id="email" value="jr.succeed_immediately@example.com" required />

        <label for="phone"> Phone Number </label>
        <input id="phone" value="22222222220" required />

        <!-- Used to display form errors. -->
        <div id="error-message" role="alert"></div>

        <button type="submit">Pay</button>
      </form>

      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
