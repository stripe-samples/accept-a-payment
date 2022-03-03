document.addEventListener('DOMContentLoaded', async () => {
    // Load the publishable key from the server. The publishable key
    // is set in your .env file. In practice, most users hard code the
    // publishable key when initializing the Stripe object.
    const { publishableKey } = await fetch('http://localhost:4242/config').then((r) => r.json());
    if (!publishableKey) {
      addMessage(
        'No publishable key returned from the server. Please check `.env` and try again'
      );
      alert('Please set your Stripe publishable API key in the .env file');
    }
  
    const stripe = Stripe(publishableKey, {
      betas: ['konbini_pm_beta_1'],
      apiVersion: '2020-08-27; konbini_beta=v1',
    });
  
    // When the form is submitted...
    var form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Make a call to the server to create a new
      // payment intent and store its client_secret.
      const resp = await fetch('http://localhost:4242/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: 'jpy',
          paymentMethodType: 'konbini',
          paymentMethodOptions: {
            konbini: {
              product_description: 'Tシャツ',
              expires_after_days: 3,
            },
          },
        }),
      }).then((r) => r.json());
  
      if (resp.error) {
        addMessage(resp.error.message);
        return;
      }
  
      addMessage(`Client secret returned.`);
  
      const nameInput = document.querySelector('#name');
      const emailInput = document.querySelector('#email');
      const phonelInput = document.querySelector('#phone');
  
      // Confirm the payment given the clientSecret from the payment intent that
      // was just created on the server.
      let { error, paymentIntent } = await stripe.confirmKonbiniPayment(
        resp.clientSecret,
        {
          payment_method: {
            billing_details: {
              name: nameInput.value,
              email: emailInput.value,
            },
          },
          payment_method_options: {
              konbini: {
                  confirmation_number: phonelInput.value.replace(/\D/g,''),
              },
          },
        }
      );
  
      if (error) {
        addMessage(error.message);
        return;
      }
  
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  
      // When passing {any_prefix}succeed_immediately@{any_suffix}
      // as the email address in the billing details, the payment
      // intent will succeed after 3 seconds. We set this timeout
      // to refetch the payment intent.
      const i = setInterval(async () => {
        const { error, paymentIntent } = await stripe.retrievePaymentIntent(
          resp.clientSecret
        );
        if (error) {
          addMessage(`Error: ${JSON.stringify(error, null, 2)}`);
          clearInterval(i);
          return;
        }
        addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
        if (paymentIntent.status === 'succeeded') {
          clearInterval(i);
        }
      }, 500);
    });
  });