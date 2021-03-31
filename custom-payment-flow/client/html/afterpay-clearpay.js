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
          currency: 'usd',
          paymentMethodType: 'afterpay_clearpay',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage(`Client secret returned.`);

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

    // Confirm the payment given the clientSecret from the payment intent that
    // was just created on the server.
    let {error: stripeError, paymentIntent} = await stripe.confirmAfterpayClearpayPayment(
      clientSecret,
      {
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
        return_url: `${window.location.origin}/return.html`,
      }
    );

    if (stripeError) {
      addMessage(stripeError.message);
      return;
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  });
});
