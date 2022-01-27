import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {EpsBankElement, useStripe, useElements} from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const EpsForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('Jenny Rosen');
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

    const {error: backendError, clientSecret} = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodType: 'eps',
        currency: 'eur',
      }),
    }).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage('Client secret returned');

    const {error: stripeError, paymentIntent} = await stripe.confirmEpsPayment(
      clientSecret,
      {
        payment_method: {
          eps: elements.getElement(EpsBankElement),
          billing_details: {
            name,
          },
        },
        return_url: `${window.location.origin}/eps?return=true`,
      }
    );

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
      <h1>EPS</h1>

      <form id="payment-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <EpsBankElement />
        <button type="submit">Pay</button>
      </form>

      <StatusMessages messages={messages} />
    </>
  );
};

// Component for displaying results after returning from the redirect flow.
const EpsReturn = () => {
  const stripe = useStripe();
  const [messages, addMessage] = useMessages();

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
      <h1>EPS Return</h1>
      <StatusMessages messages={messages} />
    </>
  );
};

const Eps = () => {
  const query = new URLSearchParams(useLocation().search);
  if (query.get('return')) {
    return <EpsReturn />;
  } else {
    return <EpsForm />;
  }
};

export default Eps;
