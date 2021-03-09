import React from 'react';
import {loadStripe} from '@stripe/stripe-js';

// Load the publishable key from the server, install Stripe.js.
let stripe;
(async () => {
  const {publishableKey} = await fetch('/config').then(r=>r.json());
  stripe = await loadStripe(publishableKey);
})();

const Checkout = () => {
  // When the buy button is clicked...
  const handleClick = async (event) => {
    if(!stripe) {
      alert('Stripe is not loaded yet.');
      return;
    }

    // Create a Checkout Session on the server
    const {sessionId} = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }).then(r => r.json());

    // Redirect to the Stripe hosted Checkout page.
    const {error} = await stripe.redirectToCheckout({ sessionId });

    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `error.message`.
    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="sr-root">
      <div className="sr-main">
        <header className="sr-header">
          <div className="sr-header__logo"></div>
        </header>
        <section className="container">
          <div>
            <h1>Single photo</h1>
            <h4>Purchase a Pasha original photo</h4>
            <div className="pasha-image">
              <img
                alt="Random asset from Picsum"
                src="https://picsum.photos/280/320?random=4"
                width="140"
                height="160"
              />
            </div>
          </div>

          <button role="link" onClick={handleClick}>Buy</button>
        </section>
      </div>
    </div>
  );
};

export default Checkout;
