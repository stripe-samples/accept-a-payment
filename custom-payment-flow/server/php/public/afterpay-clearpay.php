<?php
require_once 'shared.php';

try {
  $paymentIntent = $stripe->paymentIntents->create([
    'payment_method_types' => ['afterpay_clearpay'],
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
    <title>Afterpay / Clearpay</title>
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

          // billing inputs
          const nameInput = document.querySelector('#name');
          const emailInput = document.querySelector('#email');
          const line1Input = document.querySelector('#line1');
          const line2Input = document.querySelector('#line2');
          const cityInput = document.querySelector('#city');
          const stateInput = document.querySelector('#state');
          const postalCodeInput = document.querySelector('#postal_code');
          const countryInput = document.querySelector('#country');

          // shipping inputs
          const shippingNameInput = document.querySelector('#shipping_name');
          const shippingLine1Input = document.querySelector('#shipping_line1');
          const shippingLine2Input = document.querySelector('#shipping_line2');
          const shippingCityInput = document.querySelector('#shipping_city');
          const shippingStateInput = document.querySelector('#shipping_state');
          const shippingPostalCodeInput = document.querySelector('#shipping_postal_code');
          const shippingCountryInput = document.querySelector('#shipping_country');

          // Confirm the payment that was created server side:
          const {error, paymentIntent} = await stripe.confirmAfterpayClearpayPayment(
            '<?= $paymentIntent->client_secret; ?>', {
              payment_method: {
                billing_details: {
                  name: nameInput.value,
                  email: emailInput.value,
                  address: {
                    line1: line1Input.value,
                    line2: line2Input.value,
                    city: cityInput.value,
                    state: stateInput.value,
                    postal_code: postalCodeInput.value,
                    country: countryInput.value,
                  }
                },
              },
              shipping: {
                name: shippingNameInput.value,
                address: {
                  line1: shippingLine1Input.value,
                  line2: shippingLine2Input.value,
                  city: shippingCityInput.value,
                  state: shippingStateInput.value,
                  postal_code: shippingPostalCodeInput.value,
                  country: shippingCountryInput.value,
                }
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
      <h1>Afterpay / Clearpay</h1>

      <form id="payment-form">
        <fieldset>
          <legend>Billing</legend>

          <label for="name">
            Name
          </label>
          <input id="name" value="Jenny Rosen" required />
          <label for="email">
            Email
          </label>
          <input type="email" id="email" value="jenny.rosen@example.com" required />

          <label for="line1">
            Line 1
          </label>
          <input id="line1" value="123 Main St." required />

          <label for="line2">
            Line 2
          </label>
          <input id="line2" value="" />

          <label for="city">
            City
          </label>
          <input id="city" value="San Francisco" />

          <label for="state">
            State
          </label>
          <input id="state" value="CA" />

          <label for="postal_code">
            Postal code
          </label>
          <input id="postal_code" value="94111" />

          <label for="country">
            Country
          </label>
          <select id="country">
            <option value="AU">Australia</option>
            <option value="NZ">New Zealand</option>
            <option value="UK">United Kingdom</option>
            <option value="US">United States</option>
          </select>
        </fieldset>

        <fieldset>
          <legend>Shipping</legend>

          <label for="name">
            Name
          </label>
          <input id="shipping_name" value="Jenny Rosen" required />

          <label for="shipping_line1">
            Line 1
          </label>
          <input id="shipping_line1" value="123 Main St." required />

          <label for="shipping_line2">
            Line 2
          </label>
          <input id="shipping_line2" value="" />

          <label for="shipping_city">
            City
          </label>
          <input id="shipping_city" value="San Francisco" />

          <label for="shipping_state">
            State
          </label>
          <input id="shipping_state" value="CA" />

          <label for="shipping_postal_code">
            Postal code
          </label>
          <input id="shipping_postal_code" value="94111" />

          <label for="shipping_country">
            Country
          </label>
          <select id="shipping_country">
            <option value="AU">Australia</option>
            <option value="NZ">New Zealand</option>
            <option value="UK">United Kingdom</option>
            <option value="US">United States</option>
          </select>
        </fieldset>

        <button id="submit">Pay</button>
      </form>

      <div id="messages" role="alert" style="display: none;"></div>
    </main>
  </body>
</html>
