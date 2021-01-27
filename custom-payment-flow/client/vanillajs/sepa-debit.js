document.addEventListener('DOMContentLoaded', async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file.
  const {publishableKey} = await fetch('/config').then(r => r.json());
  if(!publishableKey) {
    addMessage('No publishable key returned from the server. Please check `.env` and try again');
    alert('Please set your Stripe publishable API key in the .env file');
  }

  const stripe = Stripe(publishableKey);
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
    const {clientSecret} = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency: 'eur',
        paymentMethodType: 'sepa_debit',
      }),
    }).then(r => r.json());

    addMessage(`Client secret returned.`);

    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');

    // Confirm the card payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const {error, paymentIntent} = await stripe.confirmSepaDebitPayment(clientSecret, {
      payment_method: {
        sepa_debit: iban,
        billing_details: {
          name: nameInput.value,
          email: emailInput.value
        }
      }
    })

    if(error) {
      addMessage(error.message);
    }

    if(paymentIntent.status === 'processing') {
      addMessage(`Payment processing: ${paymentIntent.id} check webhook events for fulfillment.`);
    }
  });
});

// Helper for displaying status messages.
const addMessage = (message) => {
  const messagesDiv = document.querySelector('#messages')
  messagesDiv.innerHTML += `${message}<br>`;
  console.log(`Debug: ${message}`);
}
