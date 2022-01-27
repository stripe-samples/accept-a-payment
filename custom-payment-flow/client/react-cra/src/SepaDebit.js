import React, {useState} from 'react';
import {IbanElement, useStripe, useElements} from '@stripe/react-stripe-js';
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

    const {error: backendError, clientSecret} = await fetch(
      '/create-payment-intent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodType: 'sepa_debit',
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
    } = await stripe.confirmSepaDebitPayment(clientSecret, {
      payment_method: {
        sepa_debit: elements.getElement(IbanElement),
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

    // Initially the test PaymentIntent will be in the `processing` state.
    // We'll refetch the payment intent client-side after 5 seconds to show
    // that it successfully transitions to the `succeeded` state.
    //
    // In practice, you should use webhook notifications for fulfillment.
    if(paymentIntent.status === 'processing') {
      addMessage(
        `Payment processing: ${paymentIntent.id} check webhook events for fulfillment.`
      );
      addMessage('Refetching payment intent in 5s.');
      setTimeout(async () => {
        const {paymentIntent: pi} = await stripe.retrievePaymentIntent(clientSecret);
        addMessage(`Payment (${pi.id}): ${pi.status}`);
      }, 5000)
    } else {
      addMessage(`Payment (${paymentIntent.id}): ${paymentIntent.status}`);
    }

  };

  return (
    <>
      <h1>SEPA Direct Debit</h1>

      <p>
        <h4>Try a <a href="https://stripe.com/docs/testing#sepa-direct-debit">test IBAN account number</a>:</h4>
        <div>
          <code>DE89370400440532013000</code>
        </div>
        <div>
          <code>IE29AIBK93115212345678</code>
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

        <label htmlFor="iban-element">Bank Account</label>
        <IbanElement
          id="iban-element"
          options={{supportedCountries: ['SEPA']}}
        />

        <button type="submit">Pay</button>

        <div id="error-message" role="alert"></div>

        <div id="mandate-acceptance">
          By providing your payment information and confirming this payment, you authorise
          (A) <strong>INSERT YOUR BUSINESS NAME HERE</strong> and Stripe,
          our payment service provider and/or PPRO, its local service provider, to send
          instructions to your bank to debit your account and (B) your bank to debit your
          account in accordance with those instructions. As part of your rights, you are
          entitled to a refund from your bank under the terms and conditions of your agreement
          with your bank. A refund must be claimed within 8 weeks starting from the date on
          which your account was debited. Your rights are explained in a statement that you
          can obtain from your bank. You agree to receive notifications for future debits up
          to 2 days before they occur.
        </div>
      </form>

      <StatusMessages messages={messages} />
    </>
  );
};

export default SepaDebitForm;
