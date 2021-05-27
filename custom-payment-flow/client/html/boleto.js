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
          currency: 'brl',
          paymentMethodType: 'boleto',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage(`Client secret returned.`);

    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const taxIdInput = document.querySelector('#tax_id');
    const countryInput = document.querySelector('#country');
    const stateInput = document.querySelector('#state');
    const cityInput = document.querySelector('#city');
    const postalCodeInput = document.querySelector('#postal_code');
    const line1Input = document.querySelector('#line1');
    
    // Confirm the payment given the clientSecret from the payment intent that
    // was just created on the server.
    const {error: stripeError, paymentIntent} = await stripe.confirmBoletoPayment(
      clientSecret,
      {
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

    if (stripeError) {
      addMessage(stripeError.message);
      return;
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);

    // When passing {any_prefix}succeed_immediately@{any_suffix}
    // as the email address in the billing details, the payment
    // intent will succeed after 3 seconds. We set this timeout
    // to refetch the payment intent.
    const i = setInterval(async () => {
      const {paymentIntent} = await stripe.retrievePaymentIntent(clientSecret);
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
      if (paymentIntent.status === 'succeeded') {
        clearInterval(i);
      }
    }, 500);
  });
});
