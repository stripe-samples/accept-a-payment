import React, {useEffect, useReducer} from 'react';
import { withRouter, useLocation } from 'react-router-dom';
import {
  FpxBankElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import StatusMessages from './StatusMessages';

const FpxForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  // helper for displaying status messages.
  const [messages, addMessage] = useReducer((messages, message) => {
    return [...messages, message];
  }, []);

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

    let response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodType: 'fpx',
        currency: 'myr',
      }),
    }).then(r => r.json());

    if(response.error) {
      addMessage(response.error.message);
      return;
    }

    addMessage('Client secret returned');

    let {error, paymentIntent} = await stripe.confirmFpxPayment(response.clientSecret, {
      payment_method: {
        fpx: elements.getElement(FpxBankElement),
      },
      return_url: 'http://localhost:3000/fpx?return=true',
    });

    if (error) {
      // Show error to your customer (e.g., insufficient funds)
      addMessage(error.message);
      return;
    }

    // Show a success message to your customer
    // There's a risk of the customer closing the window before callback
    // execution. Set up a webhook or plugin to listen for the
    // payment_intent.succeeded event that handles any business critical
    // post-payment actions.
    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  }

  return (
    <>
      <h1>FPX</h1>

      <form id="payment-form" onSubmit={handleSubmit}>
        <FpxBankElement options={{accountHolderType: 'individual'}} />
        <button type="submit">Pay</button>
      </form>

      <StatusMessages messages={messages} />
    </>
  )
};

// Component for displaying results after returning from
// bancontact redirect flow.
const FpxReturn = () => {
  const query = new URLSearchParams(useLocation().search);
  const clientSecret = query.get('payment_intent_client_secret');

  const stripe = useStripe();
  // helper for displaying status messages.
  const [messages, addMessage] = useReducer((messages, message) => {
    return [...messages, message];
  }, []);


  useEffect(() => {
    if(!stripe) {
      return;
    }
    const fetchPaymentIntent = async () => {
      const {error, paymentIntent} = await stripe.retrievePaymentIntent(clientSecret);
      if(error) {
        addMessage(error.message);
      }
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    }
    fetchPaymentIntent();
  }, [clientSecret, stripe]);

  return (
    <>
      <h1>FPX Return</h1>
      <StatusMessages messages={messages} />
    </>
  )
};

const Fpx = () => {
  const query = new URLSearchParams(useLocation().search);
  if(query.get('return')) {
    return <FpxReturn />
  } else {
    return <FpxForm />
  }
}

export default withRouter(Fpx);
