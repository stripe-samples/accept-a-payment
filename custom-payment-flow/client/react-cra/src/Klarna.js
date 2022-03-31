import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {useStripe} from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const COUNTRY_CURRENCY = {
  AT: 'EUR',
  BE: 'EUR',
  DK: 'DKK',
  FI: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  NO: 'NOK',
  ES: 'EUR',
  SE: 'SEK',
  UK: 'GBP',
  US: 'USD',
}

const KlarnaForm = () => {
  const stripe = useStripe();
  const [email, setEmail] = useState('user-us@example.com');
  const [country, setCountry] = useState('US');
  const [messages, addMessage] = useMessages();

  const handleSubmit = async (e) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    e.preventDefault();

    if (!stripe) {
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
          paymentMethodType: 'klarna',
          currency: COUNTRY_CURRENCY[country],
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage('Client secret returned');

    const {error: stripeError, paymentIntent} = await stripe.confirmKlarnaPayment(
      clientSecret,
      {
        payment_method: {
          billing_details: {
            email,
            address: {
              country
            }
          },
        },
        return_url: `${window.location.origin}/klarna?return=true`,
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
      <h1>Klarna</h1>

      <table>
        <thead><tr><th><div ><div></div></div></th><th><div><div><div>Approved</div></div></div></th><th><div><div><div>Denied</div></div></div></th></tr></thead>
        <tbody>
          <tr><td>Email</td><td>user-us@example.com</td><td>user-us+denied@example.com</td></tr>
          <tr><td>Street</td><td>Lombard St 10</td><td>Lombard St 10</td></tr>
          <tr><td>Apartment</td><td>Apt 214</td><td>Apt 214</td></tr>
          <tr><td>City</td><td>Beverly Hills</td><td>Beverly Hills</td></tr>
          <tr><td>State</td><td>CA</td><td>CA</td></tr>
          <tr><td>Postal code</td><td>90210</td><td>90210</td></tr>
          <tr><td>Phone</td><td>3106143666</td><td>3106143888</td></tr>
        </tbody>
      </table>

      <form id="payment-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder="jenny.rosen@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="country">
          Country
        </label>
        <select id="country" value={country}>
          {Object.keys(COUNTRY_CURRENCY).map(country => <option key={country}>{country}</option>)}
        </select>

        <button type="submit">Pay</button>
      </form>
      <StatusMessages messages={messages} />
    </>
  );
};

// Component for displaying results after returning from the redirect flow.
const KlarnaReturn = () => {
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
      <h1>Klarna Return</h1>
      <StatusMessages messages={messages} />
    </>
  );
};

const Klarna = () => {
  const query = new URLSearchParams(useLocation().search);
  if (query.get('return')) {
    return <KlarnaReturn />;
  } else {
    return <KlarnaForm />;
  }
}

export default Klarna;
