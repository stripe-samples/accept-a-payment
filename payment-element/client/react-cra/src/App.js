import logo from './logo.svg';
import './App.css';

import {useEffect, useState} from 'react';

import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'

let stripePromise;
(async () => {
  const {publishableKey} = await fetch("/config").then(r => r.json());
  stripePromise = loadStripe(publishableKey)
})()

function App() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/create-payment-intent")
      .then((res) => res.json())
      .then(({clientSecret}) => setClientSecret(clientSecret));
  }, [])

  const options = {
    clientSecret,
  }

  return (
    <>
      <h1>Payment</h1>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}

export default App;
