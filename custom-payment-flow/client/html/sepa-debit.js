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
  const iban = elements.create('iban', {
    supportedCountries: ['SEPA'],
  });
  iban.mount('#iban-element');

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
          paymentMethodType: 'sepa_debit',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
    }

    addMessage(`Client secret returned.`);

    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');

    // Confirm the card payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const {error, paymentIntent} = await stripe.confirmSepaDebitPayment(
      clientSecret,
      {
        payment_method: {
          sepa_debit: iban,
          billing_details: {
            name: nameInput.value,
            email: emailInput.value,
          },
        },
      }
    );

    if (error) {
      addMessage(error.message);
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
        const {paymentIntent: pi} = await stripe.retrievePaymentIntent(clientSecret);
        addMessage(`Payment (${pi.id}): ${pi.status}`);
      }, 5000)
    } else {
      addMessage(`Payment (${paymentIntent.id}): ${paymentIntent.status}`);
    }

  });
});
