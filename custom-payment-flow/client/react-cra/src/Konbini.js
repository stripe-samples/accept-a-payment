import React, { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const KonbiniForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [messages, addMessage] = useMessages();
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jr.succeed_immediately@example.com');
  const [phoneNumber, setPhoneNumber] = useState('22222222220');

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
        payment_method_options: {
          konbini: {
            confirmation_number: phoneNumber,
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
    // When passing {any_prefix}succeed_immediately@{any_suffix}
    // as the email address in the billing details, the payment
    // intent will succeed after 3 seconds. We set this timeout
    // to refetch the payment intent.
    const i = setInterval(async () => {
      const { error, paymentIntent } = await stripe.retrievePaymentIntent(
        clientSecret
      );
      if (error) {
        addMessage(`Error: ${JSON.stringify(error, null, 2)}`);
        clearInterval(i);
        return;
      }
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
      if (paymentIntent.status === 'succeeded') {
        clearInterval(i);
      }
    }, 500);
  };

  return (
    <>
      <h1>Konbini(コンビニ)</h1>

      <div>
        <ul>
            <li>Email: <code>{`{any_prefix}@{any_domain}`}</code><small>(Example: hanako@test.com)</small></li>
            <li>Phone Number: <code>11111111110</code></li>
            <li>Simulates a Konbini payment which succeeds after 3 minutes and the payment_intent.succeeded webhook arrives after that.</li>
        </ul>
        <ul>
            <li>Email: <code>{`{any_prefix}succeed_immediately@{any_domain}`}</code><small>(Example: succeed_immediately@test.com)</small></li>
            <li>Phone Number: <code>22222222220</code></li>
            <li>Simulates a Konbini payment which succeeds immediately and the payment_intent.succeeded webhook arrives after that.</li>
        </ul>
      </div>

      <form id="payment-form" onSubmit={handleSubmit}>
        <label>
            <span>Name</span>
            <input value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
            <span>Email</span>
            <input value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
            <span>Phone Number</span>
            <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
        </label>

        
        <button type="submit">Pay</button>
      </form>
      <StatusMessages messages={messages} />
    </>
  );
};

export default KonbiniForm;