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
  const elements = stripe.elements();
  const idealBank = elements.create('idealBank');
  idealBank.mount('#ideal-bank-element');

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
        currency: 'eur',
        paymentMethodType: 'ideal',
      }),
    }).then(r => r.json());

    if(resp.error) {
      addMessage(resp.error.message);
      return;
    }

    addMessage(`Client secret returned.`);

    const nameInput = document.querySelector('#name');

    // Confirm the idealBank payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    let {error, paymentIntent} = await stripe.confirmIdealPayment(resp.clientSecret, {
      payment_method: {
        ideal: idealBank,
        billing_details: {
          name: nameInput.value,
        }
      },
      return_url: 'http://localhost:4242/ideal-return.html'
    });

    if(error) {
      addMessage(error.message);
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  });
});

// Helper for displaying status messages.
const addMessage = (message) => {
  const messagesDiv = document.querySelector('#messages')
  messagesDiv.innerHTML += `${message}<br>`;
  console.log(`Debug: ${message}`);
}
