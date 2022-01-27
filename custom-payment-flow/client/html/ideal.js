document.addEventListener('DOMContentLoaded', async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file. In practice, most users hard code the
  // publishable key when initializing the Stripe object.
  const {publishableKey} = await fetch('/config').then((r) => r.json());
  if (!publishableKey) {
    addMessage(
      'No publishable key returned from the server. Please check `.env` and try again'
    );
    alert('Please set your Stripe publishable API key in the .env file');
  }

  const stripe = Stripe(publishableKey, {
    apiVersion: '2020-08-27',
  });

  const elements = stripe.elements();
  const idealBank = elements.create('idealBank');
  idealBank.mount('#ideal-bank-element');

  // When the form is submitted...
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Make a call to the server to create a new
    // payment intent and store its client_secret.
    const {error: backendError, clientSecret} = await fetch(
      '/create-payment-intent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: 'eur',
          paymentMethodType: 'ideal',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage(`Client secret returned.`);

    const nameInput = document.querySelector('#name');

    // Confirm the idealBank payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    let {error: stripeError, paymentIntent} = await stripe.confirmIdealPayment(
      clientSecret,
      {
        payment_method: {
          ideal: idealBank,
          billing_details: {
            name: nameInput.value,
          },
        },
        return_url: `${window.location.origin}/return.html`,
      }
    );

    if (stripeError) {
      addMessage(stripeError.message);
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  });
});
