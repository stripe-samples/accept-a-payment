import React, {useState} from 'react';
import {
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import StatusMessages from './StatusMessages';

const UsBankAccountDebitForm = () => {
  const stripe = useStripe();
  const [name, setName] = useState('Jenny Rosen');
  const [email, setEmail] = useState('jenny+skip_waiting@example.com');
  const [confirming, setConfirming] = useState(false);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState()

  // helper for displaying status messages.
  const [messages, setMessages] = useState([]);
  const addMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  };

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
          paymentMethodType: 'us_bank_account',
          currency: 'usd',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    setPaymentIntentClientSecret(clientSecret);
    addMessage('Client secret returned');

    const {
      error: stripeError,
      paymentIntent,
    } = await stripe.collectUsBankAccountForPayment(clientSecret, {
      billing_details: {
        name,
        email,
      },
    });

    if (stripeError) {
      // Show error to your customer (e.g., insufficient funds)
      addMessage(stripeError.message);
      return;
    }

    if (paymentIntent.status === 'requires_payment_method') {
      // Customer canceled the Connections modal. Present them with other
      // payment method type options.
    } else if (paymentIntent.status === 'requires_confirmation') {
      // We collected an account - possibly instantly verified, but possibly
      // manually-entered. Display payment method details and mandate text
      // to the customer and confirm the intent once they accept
      // the mandate.
      setConfirming(true);
    }

    // Show a success message to your customer
    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  };

  return (
    <>
      <h1>US bank account debit (ACH)</h1>

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

        <button type="submit">Pay</button>

        <div id="error-message" role="alert"></div>
      </form>

      {confirming && <UsBankAccountDebitConfirmationForm clientSecret={paymentIntentClientSecret} addMessage={addMessage}/>}

      <StatusMessages messages={messages} />
    </>
  );
};

const UsBankAccountDebitConfirmationForm = ({ clientSecret, addMessage }) => {
  const stripe = useStripe();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {paymentIntent, error} = await stripe.confirmUsBankAccountPayment(clientSecret)
    if (error) {
      // The payment failed for some reason.
      addMessage(`Payment failed for some reason`);
      addMessage(error.message);
    } else if (paymentIntent.status === "requires_payment_method") {
      // Confirmation failed. Attempt again with a different payment method.
      addMessage(`Confirmation failed. Attempt again with a different payment method.`);
    } else if (paymentIntent.status === "processing") {
      // Confirmation succeeded! The account will be debited.
      addMessage(`Confirmation succeeded! The account will be debited.`)
    } else if (paymentIntent.next_action?.type === "verify_with_microdeposits") {
      // The account needs to be verified via microdeposits.
      // Display a message to consumer with next steps (consumer waits for
      // microdeposits, then enters an amount on a page sent to them via email).
      addMessage(`The account needs to be verified via microdeposits.`);
      addMessage(`<a href="${paymentIntent.next_action?.verify_with_microdeposits?.hosted_verification_url}">verify microdeposits</a>.`);
    }
    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>
        By clicking Accept, you authorize <em>YOUR BUSINESS NAME</em> to debit the bank
        account specified above for any amount owed for charges arising from
        your use of <em>YOUR BUSINESS NAME</em>’ services and/or purchase of products from
        <em>YOUR BUSINESS NAME</em>, pursuant to <em>YOUR BUSINESS NAME</em>’ website and terms, until this
        authorization is revoked. You may amend or cancel this authorization at
        any time by providing notice to <em>YOUR BUSINESS NAME</em> with 30 (thirty) days
        notice.
      </p>

      <p>
        If you use <em>YOUR BUSINESS NAME</em>’ services or purchase additional
        products periodically pursuant to <em>YOUR BUSINESS NAME</em>’ terms, you
        authorize <em>YOUR BUSINESS NAME</em> to debit your bank account
        periodically. Payments that fall outside of the regular debits
        authorized above will only be debited after your authorization is
        obtained.
      </p>

      <button>Accept</button>
    </form>
  )
};

export default UsBankAccountDebitForm;
