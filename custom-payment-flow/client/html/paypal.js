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

  // 1. Initialize Stripe
  const stripe = Stripe(publishableKey, {
    apiVersion: '2024-06-20',
  });

  MODE = 'payment';
  AMOUNT = 5999;
  CURRENCY = 'eur';

  const elements = stripe.elements({
    mode: MODE,
    amount: AMOUNT,
    currency: CURRENCY,
    paymentMethodTypes: ['paypal'],
  });

  const expressCheckoutElement = elements.create('expressCheckout');
  expressCheckoutElement.mount('#express-checkout-element');

  expressCheckoutElement.on('click', (event) => {
    const options = {
      phoneNumberRequired: true,
    };
    event.resolve(options);
  });

  const handleError = (error) => {
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message + `Is the amount equal to ${AMOUNT} on the server?`;
  };

  expressCheckoutElement.on('confirm', async (event) => {
    const {error: submitError} = await elements.submit();
    if (submitError) {
      handleError(submitError);
      return;
    }

    const {error: backendError, clientSecret} = await fetch(
      '/create-payment-intent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: CURRENCY,
          paymentMethodType: 'paypal',
        }),
      }
    ).then((r) => r.json());

    const {error} = await stripe.confirmPayment({
      // `elements` instance used to create the Express Checkout Element
      elements,
      // `clientSecret` from the created PaymentIntent
      clientSecret,
      confirmParams: {
        return_url: 'https://example.com/order/123/complete',
      },
    });

    if (error) {
      // This point is only reached if there's an immediate error when
      // confirming the payment. Show the error to your customer (for example, payment details incomplete)
      handleError(error);
    } else {
      // The payment UI automatically closes with a success animation.
      // Your customer is redirected to your `return_url`.
    }
  });
});
