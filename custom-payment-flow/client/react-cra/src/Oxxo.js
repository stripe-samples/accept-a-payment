import React, {useState} from 'react';
import {useStripe, useElements} from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const OxxoForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jr.succeed_immediately@example.com');
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
          paymentMethodType: 'oxxo',
          currency: 'mxn',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage('Client secret returned');

    const {error: stripeError, paymentIntent} = await stripe.confirmOxxoPayment(
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

    // When passing {any_prefix}succeed_immediately@{any_suffix}
    // as the email address in the billing details, the payment
    // intent will succeed after 3 seconds. We set this timeout
    // to refetch the payment intent.
    const i = setInterval(async () => {
      const {error: e, paymentIntent} = await stripe.retrievePaymentIntent(
        clientSecret
      );
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
      if (paymentIntent.status === 'succeeded') {
        clearInterval(i);
      }
      if (e) {
        addMessage(e.message);
      }
    }, 500);
  };

  return (
    <>
      <h1>OXXO</h1>

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

      <p> <a href="https://youtu.be/zmNMMBbYFf0" target="_blank">Watch a demo walkthrough</a> </p>
    </>
  );
};

export default OxxoForm;
