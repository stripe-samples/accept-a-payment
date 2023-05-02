document.addEventListener('DOMContentLoaded', async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file.
  const { publishableKey } = await fetch('/config').then((r) => r.json());
  if (!publishableKey) {
    addMessage(
      'No publishable key returned from the server. Please check `.env` and try again'
    );
    alert('Please set your Stripe publishable API key in the .env file');
  }

  const stripe = Stripe(publishableKey, {
    apiVersion: '2022-11-15',
  });

  const { clientSecret } = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currency: 'usd',
      paymentMethodType: 'link',
    }),
  }).then((r) => r.json());

  addMessage(`Client secret returned. ${clientSecret}`);

  // Enable the skeleton loader UI for the optimal loading experience.
  const loader = 'auto';

  // Create an elements group from the Stripe instance passing in the clientSecret and enabling the loader UI.
  const elements = stripe.elements({ clientSecret, loader });

  const linkAuthenticationElement = elements.create('linkAuthentication');

  // Passing in defaultValues is optional, but useful if you want to prefill customer information to simplify the customer experience.
  const paymentElement = elements.create('payment', {
    defaultValues: {
      billingDetails: {
        name: 'John Doe',
        phone: '888-888-8888',
      },
    },
  });

  // Mount the Elements to their corresponding DOM node
  linkAuthenticationElement.mount('#link-authentication-element');
  paymentElement.mount('#payment-element');

  // When the form is submitted...
  const form = document.getElementById('payment-form');
  let submitted = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable double submission of the form
    if (submitted) {
      return;
    }
    submitted = true;
    form.querySelector('button').disabled = true;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:4242/payment/next',
      },
    });

    if (error) {
      addMessage(error.message);

      // reenable the form.
      submitted = false;
      form.querySelector('button').disabled = false;
      return;
    }
  });
});
