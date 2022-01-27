import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {useStripe, useElements} from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const SofortForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jenny.rosen@example.com');
  const [messages, addMessage] = useMessages();

  const handleSubmit = async (e) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      addMessage('Stripe.js has not yet loaded.');
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
          paymentMethodType: 'sofort',
          currency: 'eur',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage('Client secret returned');

    const {
      error: stripeError,
      paymentIntent,
    } = await stripe.confirmSofortPayment(clientSecret, {
      payment_method: {
        sofort: {
          country: 'DE',
        },
        billing_details: {
          name,
          email,
        },
      },
      return_url: `${window.location.origin}/sofort?return=true`,
    });

    if (stripeError) {
      // Show error to your customer (e.g., insufficient funds)
      addMessage(stripeError.message);
      return;
    }

    // Show a success message to your customer
    // There's a risk of the customer closing the window before callback
    // execution. Set up a webhook or plugin to listen for the
    // payment_intent.succeeded event that handles any business critical
    // post-payment actions.
    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  };

  return (
    <>
      <h1>Sofort</h1>

      <form id="payment-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Pay</button>
      </form>

      <StatusMessages messages={messages} />
    </>
  );
};

// Component for displaying results after returning from
// bancontact redirect flow.
const SofortReturn = () => {
  const stripe = useStripe();
  const [messages, addMessage] = useMessages();

  // Extract the client secret from the query string params.
  const query = new URLSearchParams(useLocation().search);
  const clientSecret = query.get('payment_intent_client_secret');

  useEffect(() => {
    if (!stripe) {
      return;
    }
    const fetchPaymentIntent = async () => {
      const {
        error: stripeError,
        paymentIntent,
      } = await stripe.retrievePaymentIntent(clientSecret);
      if (stripeError) {
        addMessage(stripeError.message);
      }
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    };
    fetchPaymentIntent();
  }, [clientSecret, stripe, addMessage]);

  return (
    <>
      <h1>Sofort Return</h1>
      <StatusMessages messages={messages} />
    </>
  );
};

const Sofort = () => {
  const query = new URLSearchParams(useLocation().search);
  if (query.get('return')) {
    return <SofortReturn />;
  } else {
    return <SofortForm />;
  }
};

export default Sofort;
