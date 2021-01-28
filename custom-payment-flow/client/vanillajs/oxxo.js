document.addEventListener('DOMContentLoaded', async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file. In practice, most users hard code the
  // publishable key when initializing the Stripe object.
  const {publishableKey} = await fetch('/config').then(r => r.json());
  if(!publishableKey) {
    addMessage('No publishable key returned from the server. Please check `.env` and try again');
    alert('Please set your Stripe publishable API key in the .env file');
  }

  const stripe = Stripe(publishableKey);

  // When the form is submitted...
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Make a call to the server to create a new
    // payment intent and store its client_secret.
    const resp = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency: 'mxn',
        paymentMethodType: 'oxxo',
      }),
    }).then(r => r.json());

    if(resp.error) {
      addMessage(resp.error.message);
      return;
    }

    addMessage(`Client secret returned.`);

    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');

    // Confirm the payment given the clientSecret from the payment intent that
    // was just created on the server.
    let {error, paymentIntent} = await stripe.confirmOxxoPayment(resp.clientSecret, {
      payment_method: {
        billing_details: {
          name: nameInput.value,
          email: emailInput.value,
        }
      }
    });

    if(error) {
      addMessage(error.message);
      return;
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);

    // When passing {any_prefix}succeed_immediately@{any_suffix}
    // as the email address in the billing details, the payment
    // intent will succeed after 3 seconds. We set this timeout
    // to refetch the payment intent.
    const i = setInterval(async () => {
      let {error, paymentIntent} = await stripe.retrievePaymentIntent(resp.clientSecret);
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
      if(paymentIntent.status === 'succeeded') {
        clearInterval(i);
      }
    }, 500);
  });
});
