import React, {useState} from 'react';
import {useStripe, useElements} from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const Boleto = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [country, setCountry] = useState('BR');
  const [state, setState] = useState('SP');
  const [city, setCity] = useState('São Paulo');
  const [postalCode, setPostalCode] = useState('01227-200');
  const [line1, setLine1] = useState('Av Angelica 2491, Conjunto 91E');
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jr@example.com');
  const [taxId, setTaxId] = useState('000.000.000-00');
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
          paymentMethodType: 'boleto',
          currency: 'brl',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage('Client secret returned');

    const {error: stripeError, paymentIntent} = await stripe.confirmBoletoPayment(
      clientSecret,
      {
        payment_method: {
          billing_details: {
            address: {
              country,
              state,
              city,
              postal_code: postalCode,
              line1,
            },
            name,
            email,
          },
          boleto: {
            tax_id: taxId,
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
      <h1>Boleto</h1>

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

        <label htmlFor="tax_id">Tax id</label>
        <input
          id="tax_id"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          required
        />

        <label htmlFor="country">Country</label>
        <input
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />

        <label htmlFor="state">State</label>
        <input
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />

        <label htmlFor="city">City</label>
        <input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        <label htmlFor="postal_code">Postal Code</label>
        <input
          id="postal_code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
        />

        <label htmlFor="line1">Line 1</label>
        <input
          id="line1"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          required
        />

        <button type="submit">Pay</button>
      </form>

      <StatusMessages messages={messages} />
    </>
  );
};

export default Boleto;
