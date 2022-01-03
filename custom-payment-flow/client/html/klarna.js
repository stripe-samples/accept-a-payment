const COUNTRY_CURRENCY = {
  AT: 'EUR',
  BE: 'EUR',
  DK: 'DKK',
  FI: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  NO: 'NOK',
  ES: 'EUR',
  SE: 'SEK',
  UK: 'GBP',
  US: 'USD',
}

document.addEventListener('DOMContentLoaded', async () => {


  // Load the publishable key from the server. The publishable key
  // is set in your .env file.
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
  const form = document.getElementById('payment-form');
  let submitted = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable double submission of the form
    if(submitted) { return; }
    submitted = true;
    form.querySelector('button').disabled = true;

    const emailInput = document.querySelector('#email');
    const countryInput = document.querySelector('#country');

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
          currency: COUNTRY_CURRENCY[countryInput.value],
          paymentMethodType: 'klarna',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);

      // reenable the form.
      submitted = false;
      form.querySelector('button').disabled = false;
      return;
    }

    addMessage(`Client secret returned.`);


    // Confirm the card payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const {error: stripeError, paymentIntent} = await stripe.confirmKlarnaPayment(
      clientSecret,
      {
        payment_method: {
          billing_details: {
            email: emailInput.value,
            address: {
              country: countryInput.value,
            }
          },
        },
        return_url: `${window.location.origin}/return.html`,
      }
    );

    if (stripeError) {
      addMessage(stripeError.message);

      // reenable the form.
      submitted = false;
      form.querySelector('button').disabled = false;
      return;
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  });
});
