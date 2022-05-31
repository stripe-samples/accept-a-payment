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
          currency: 'usd',
          paymentMethodType: 'affirm',
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

    const emailInput = document.querySelector('#email');
    const nameInput = document.querySelector('#name');
    const line1Input = document.querySelector('#line1');
    const cityInput = document.querySelector('#city');
    const stateInput = document.querySelector('#state');
    const postalCodeInput = document.querySelector('#postal-code');
    const countryInput = document.querySelector('#country');

    const shippingNameInput = document.querySelector('#shipping-name');
    const shippingLine1Input = document.querySelector('#shipping-line1');
    const shippingCityInput = document.querySelector('#shipping-city');
    const shippingStateInput = document.querySelector('#shipping-state');
    const shippingPostalCodeInput = document.querySelector('#shipping-postal-code');
    const shippingCountryInput = document.querySelector('#shipping-country');

    // Confirm the affirm payment given the clientSecret from the payment
    // intent that was just created on the server.
    const {error: stripeError, paymentIntent} = await stripe.confirmAffirmPayment(
      clientSecret,
      {
        payment_method: {
          // Optional but recommended
          billing_details: {
            email: emailInput.value,
            name: nameInput.value,
            address: {
              line1: line1Input.value,
              city: cityInput.value,
              state: stateInput.value,
              postal_code: postalCodeInput.value,
              country: countryInput.value,
            }
          },

        },

        // Required
        shipping: {
          name: shippingNameInput.value,
          address: {
            line1: shippingLine1Input.value,
            city: shippingCityInput.value,
            state: shippingStateInput.value,
            postal_code: shippingPostalCodeInput.value,
            country: shippingCountryInput.value,
          }
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
