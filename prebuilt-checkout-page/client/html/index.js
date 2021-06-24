// When the form is submitted...
var submitBtn = document.querySelector('#submit');
submitBtn.addEventListener('click', async (e) => {
  // Fetch your Stripe publishable key to initialize Stripe.js
  // In practice, you might just hard code the publishable API
  // key here.
  const {publishableKey} = await fetch('/config').then((r) => r.json());
  const stripe = Stripe(publishableKey, {
    apiVersion: '2020-08-27',
  });

  // Create the checkout session on the server.
  const {error, sessionId} = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // If needed, pass data to the server here to configure the checkout
      // session.
    }),
  }).then((r) => r.json());

  // If the server responds with an error, display that to the user.
  if (error) {
    var displayError = document.getElementById('error-message');
    displayError.textContent = error;
    return;
  }

  // If the Checkout Session was created successfully on the server,
  // redirect to the Stripe hosted Checkout page.
  const {error: stripeError} = await stripe.redirectToCheckout({
    sessionId
  });

  // If the redirect fails, display an error to the user.
  if (stripeError) {
    var displayError = document.getElementById('error-message');
    displayError.textContent = error;
  }
});
