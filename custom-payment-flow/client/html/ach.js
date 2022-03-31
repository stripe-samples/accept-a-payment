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
  let paymentIntentClientSecret;

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
          paymentMethodType: 'us_bank_account',
        }),
      }
    ).then((r) => r.json());
    // Store off the client secret for the confirmation step below.
    paymentIntentClientSecret = clientSecret;

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage(`Client secret returned.`);

    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');

    // Confirm the payment given the clientSecret from the payment intent that
    // was just created on the server.
    let {error: stripeError, paymentIntent} = await stripe.collectBankAccountForPayment({
      clientSecret,
      params: {
        payment_method_type: 'us_bank_account',
        payment_method_data: {
          billing_details: {
            name: nameInput.value,
            email: emailInput.value,
          },
        },
      },
    });

    if (stripeError) {
      addMessage(stripeError.message);
      return;
    }

    if(paymentIntent.status === 'requires_payment_method') {
      addMessage(`Connection flow cancelled.`);
    } else if (paymentIntent.status === 'requires_confirmation') {
      // We collected an account - possibly instantly verified, but possibly
      // manually-entered. Display payment method details and mandate text
      // to the customer and confirm the intent once they accept
      // the mandate.
      confirmationForm.style.display = 'block';
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  });

  var confirmationForm = document.getElementById('confirmation-form');
  confirmationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const {paymentIntent, error} = await stripe.confirmUsBankAccountPayment(paymentIntentClientSecret);
    if (error) {
      // The payment failed for some reason.
      addMessage(error);
    } else if (paymentIntent.status === "requires_payment_method") {
      // Confirmation failed. Attempt again with a different payment method.
      addMessage(`Payment requires payment method`);
      confirmationForm.style.display = 'none';
    } else if (paymentIntent.status === "processing") {
      // Confirmation succeeded! The account will be debited.
      // Display a message to customer.
      addMessage(`Payment processing successfully!`);
    } else if (paymentIntent.next_action?.type === "verify_with_microdeposits") {
      // The account needs to be verified via microdeposits.
      // Display a message to consumer with next steps (consumer waits for
      // microdeposits, then enters an amount on a page sent to them via email).
      console.log(paymentIntent.next_action)
      addMessage(`Microdeposit verification required. Please follow the instructions in the email you'll receive.`)
      addMessage(`<a href="${paymentIntent.next_action?.verify_with_microdeposits?.hosted_verification_url}">verify micro deposits</a>`)
    }
  });

});
