<?php
require_once 'shared.php';

// This is the root of the URL and includes the scheme. It usually looks like
// `http://localhost:4242`. This is used when constructing the fully qualified
// URL where the user will be redirected to after going through the payment
// flow.
$domain_url = $config['domain'];

// Create new Checkout Session for the order
// ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
$checkout_session = $stripe->checkout->sessions->create([
  'success_url' => $domain_url . '/success.php?session_id={CHECKOUT_SESSION_ID}',
  'cancel_url' => $domain_url . '/canceled.html',
  'payment_method_types' => [
    'card',
    // 'alipay',
    // 'ideal',
    // 'sepa_debit',
    // 'giropay',
  ],
  'mode' => 'payment',
  'line_items' => [[
    'price' => $config['price'],
    'quantity' => 1,
  ]]
]);
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Stripe Checkout Sample</title>

    <link rel="stylesheet" href="css/normalize.css" />
    <link rel="stylesheet" href="css/global.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async (e) => {
        const stripe = Stripe("<?= $config['stripe_publishable_key']; ?>");
        const submitButton = document.getElementById('submit');
        submitButton.addEventListener('click', function(e) {
          e.preventDefault();
          stripe.redirectToCheckout({ sessionId: "<?= $checkout_session->id; ?>" });
        });
      });
    </script>
  </head>

  <body>
    <div class="sr-root">
      <div class="sr-main">
        <header class="sr-header">
          <div class="sr-header__logo"></div>
        </header>
        <section class="container">

          <div>
            <h1>Single photo</h1>
            <h4>Purchase a Pasha original photo</h4>
            <div class="pasha-image">
              <img src="https://picsum.photos/280/320?random=4" width="140" height="160" />
            </div>
          </div>

          <button id="submit">Buy</button>
        </section>
      </div>
    </div>
  </body>
</html>
