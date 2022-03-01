import React, { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const KonbiniForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [messages, addMessage] = useMessages();
  const [name, setName] = useState('Jenny Rosen')
  const [email, setEmail] = useState('jr.succeed_immediately@example.com')

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
            currency: 'jpy',
            paymentMethodType: 'konbini',
            paymentMethodOptions: {
              konbini: {
                product_description: 'Tシャツ',
                expires_after_days: 3,
              },
            },
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage('Client secret returned');

    const {error: stripeError, paymentIntent} = await stripe.confirmKonbiniPayment(
      clientSecret,
      {
        payment_method: {
          billing_details: {
            name,
            email,
          },
        },
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
      <h1>Konbini</h1>

      <form id="payment-form" onSubmit={handleSubmit}>
        <label>
            <span>Name</span>
            <input value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
            <span>Email</span>
            <input value={email} onChange={e => setEmail(e.target.value)} />
        </label>

        
        <button type="submit">Pay</button>
      </form>
      <StatusMessages messages={messages} />
    </>
  );
};

export default KonbiniForm;