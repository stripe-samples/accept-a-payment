import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

// Inner form component that uses PaymentElement
const FpxForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [messages, addMessage] = useMessages();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      addMessage('Stripe.js has not yet loaded.');
      return;
    }

    addMessage('Processing payment...');

    const {error, paymentIntent} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/fpx?return=true`,
      },
      redirect: 'if_required',
    });

    if (error) {
      addMessage(error.message);
      return;
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || !elements}>Pay</button>
      <StatusMessages messages={messages} />
    </form>
  );
};

// Component for displaying results after returning from redirect flow.
const FpxReturn = () => {
  const stripe = useStripe();
  const [messages, addMessage] = useMessages();

  const query = new URLSearchParams(useLocation().search);
  const clientSecret = query.get('payment_intent_client_secret');

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }
    const fetchPaymentIntent = async () => {
      const {error, paymentIntent} = await stripe.retrievePaymentIntent(
        clientSecret
      );
      if (error) {
        addMessage(error.message);
      }
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    };
    fetchPaymentIntent();
  }, [clientSecret, stripe, addMessage]);

  return (
    <>
      <h1>FPX Return</h1>
      <StatusMessages messages={messages} />
    </>
  );
};

// Wrapper component that fetches clientSecret and sets up Elements
const FpxWrapper = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const {publishableKey} = await fetch('/api/config').then((r) => r.json());
        setStripePromise(loadStripe(publishableKey));

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            paymentMethodType: 'fpx',
            currency: 'myr',
          }),
        });
        const data = await response.json();

        if (data.error) {
          setError(data.error.message);
        } else {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    init();
  }, []);

  return (
    <>
      <h1>FPX</h1>

      {error && <div className="error">{error}</div>}

      {clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {theme: 'stripe'},
          }}
        >
          <FpxForm />
        </Elements>
      )}

      {!clientSecret && !error && <div>Loading...</div>}
    </>
  );
};

const Fpx = () => {
  const query = new URLSearchParams(useLocation().search);
  if (query.get('return')) {
    return <FpxReturn />;
  } else {
    return <FpxWrapper />;
  }
};

export default Fpx;
