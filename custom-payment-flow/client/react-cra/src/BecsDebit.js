import React, {useState} from 'react';
import {
  AuBankAccountElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import StatusMessages from './StatusMessages';

const BecsDebitForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jenny.rosen@example.com');
  // helper for displaying status messages.
  const [messages, setMessages] = useState([]);
  const addMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  };

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
          paymentMethodType: 'au_becs_debit',
          currency: 'aud',
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
    } = await stripe.confirmAuBecsDebitPayment(clientSecret, {
      payment_method: {
        au_becs_debit: elements.getElement(AuBankAccountElement),
        billing_details: {
          name,
          email,
        },
      },
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
      <h1>BECS Direct Debit</h1>

      <p>
        <h4>Try a <a href="https://stripe.com/docs/testing#becs-direct-debit-in-australia">test number</a>:</h4>
        <div>
          <code>000-000</code> (Test BSB)
        </div>
        <div>
          <code>000123456</code>
        </div>
        <div>
          <code>900123456</code>
        </div>
      </p>

      <form id="payment-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="au-bank-account-element">Bank Account</label>
        <AuBankAccountElement id="au-bank-account-element" />

        <button type="submit">Pay</button>

        <div id="error-message" role="alert"></div>

        <div id="mandate-acceptance">
          By providing your bank account details and confirming this payment,
          you agree to this Direct Debit Request and the
          <a href="https://stripe.com/au-becs-dd-service-agreement/legal">
            Direct Debit Request service agreement
          </a>
          , and authorise Stripe Payments Australia Pty Ltd ACN 160 180 343
          Direct Debit User ID number 507156 (“Stripe”) to debit your account
          through the Bulk Electronic Clearing System (BECS) on behalf of
          <strong>INSERT YOUR BUSINESS NAME HERE</strong> (the "Merchant") for
          any amounts separately communicated to you by the Merchant. You
          certify that you are either an account holder or an authorised
          signatory on the account listed above.
        </div>
      </form>
      <StatusMessages messages={messages} />
    </>
  );
};

export default BecsDebitForm;
