import React, {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {
  IdealBankElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const IdealForm = () => {
  const stripe = useStripe();
  const elements = useElements();
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
          paymentMethodType: 'ideal',
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
    } = await stripe.confirmIdealPayment(clientSecret, {
      payment_method: {
        ideal: elements.getElement(IdealBankElement),
        billing_details: {
          name: 'Jenny Rosen',
        },
      },
      return_url: `${window.location.origin}/ideal?return=true`,
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
      <h1>iDEAL</h1>
      <form id="payment-form" onSubmit={handleSubmit}>
        <label htmlFor="ideal-bank-element">iDEAL Bank</label>
        <IdealBankElement id="ideal-bank-element" />

        <button type="submit">Pay</button>
      </form>
      <StatusMessages messages={messages} />
    </>
  );
};

// Component for displaying results after returning from
// iDEAL redirect flow.
const IdealReturn = () => {
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
        error,
        paymentIntent,
      } = await stripe.retrievePaymentIntent(clientSecret);
      if (error) {
        addMessage(error.message);
      }
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    };
    fetchPaymentIntent();
  }, [clientSecret, stripe, addMessage]);

  return (
    <>
      <h1>Ideal Return</h1>
      <StatusMessages messages={messages} />
    </>
  );
};

const Ideal = () => {
  const query = new URLSearchParams(useLocation().search);
  if (query.get('return')) {
    return <IdealReturn />;
  } else {
    return <IdealForm />;
  }
};

export default Ideal;
