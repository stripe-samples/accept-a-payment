import React, {useState} from 'react';
import { withRouter} from 'react-router-dom';
import {
  IbanElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const SepaDebitForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jenny.rosen@example.com');
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

    const {error: err, clientSecret} = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodType: 'sepa_debit',
        currency: 'eur',
      }),
    }).then(r => r.json());

    if(err) {
      addMessage(err.message);
      return;
    }

    addMessage('Client secret returned');

    const {error, paymentIntent} = await stripe.confirmSepaDebitPayment(clientSecret, {
      payment_method: {
        sepa_debit: elements.getElement(IbanElement),
        billing_details: {
          name,
          email,
        },
      },
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
      <h1>SEPA Direct Debit</h1>
      <form id="payment-form" onSubmit={handleSubmit}>
        <label htmlFor="name">
          Name
        </label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />

        <label htmlFor="email">
          Email Address
        </label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="iban-element">
          Bank Account
        </label>
        <IbanElement id="iban-element" options={{supportedCountries: ['SEPA']}} />

        <button type="submit">Pay</button>

        <div id="error-message" role="alert"></div>

        <div id="mandate-acceptance">
          By providing your bank account details and confirming this payment,
          you agree to this Direct Debit Request and the
          <a href="https://stripe.com/au-becs-dd-service-agreement/legal">Direct Debit Request service agreement</a>,
          and authorise Stripe Payments Australia Pty Ltd ACN 160 180 343
          Direct Debit User ID number 507156 (“Stripe”) to debit your account
          through the Bulk Electronic Clearing System (BECS) on behalf of
          <strong>INSERT YOUR BUSINESS NAME HERE</strong> (the "Merchant")
          for any amounts separately communicated to you by the Merchant. You
          certify that you are either an account holder or an authorised
          signatory on the account listed above.
        </div>
      </form>

      <StatusMessages messages={messages} />
    </>
  )
};

export default withRouter(SepaDebitForm);
