import React, {useState, useEffect} from 'react';
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

// Inner form component that uses PaymentElement
const SepaDebitForm = ({clientSecret}) => {
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
        return_url: `${window.location.origin}/sepa-debit`,
      },
      redirect: 'if_required',
    });

    if (error) {
      addMessage(error.message);
      return;
    }

    // SEPA payments may be in 'processing' state initially
    if (paymentIntent.status === 'processing') {
      addMessage(
        `Payment processing: ${paymentIntent.id} - check webhook events for fulfillment.`
      );
      addMessage('Refetching payment intent in 5s.');
      let retry = 5;
      const interval = setInterval(async () => {
        if (retry-- < 1) clearInterval(interval);
        const {paymentIntent: pi} = await stripe.retrievePaymentIntent(clientSecret);
        addMessage(`Payment (${pi.id}): ${pi.status}`);
      }, 5000);
    } else {
      addMessage(`Payment (${paymentIntent.id}): ${paymentIntent.status}`);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || !elements}>Pay</button>

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

      <StatusMessages messages={messages} />
    </form>
  );
};

// Wrapper component that fetches clientSecret and sets up Elements
const SepaDebit = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Stripe and fetch client secret
    const init = async () => {
      try {
        // Get publishable key
        const {publishableKey} = await fetch('/api/config').then((r) => r.json());
        setStripePromise(loadStripe(publishableKey));

        // Create PaymentIntent for SEPA
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            paymentMethodType: 'sepa_debit',
            currency: 'eur',
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

      {error && <div className="error">{error}</div>}

      {clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {theme: 'stripe'},
          }}
        >
          <SepaDebitForm clientSecret={clientSecret} />
        </Elements>
      )}

      {!clientSecret && !error && <div>Loading...</div>}
    </>
  );
};

export default SepaDebit;
