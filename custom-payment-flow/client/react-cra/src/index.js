import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

document.addEventListener('DOMContentLoaded', async () => {
  const {publishableKey} = await fetch('/config').then((r) => r.json());
  const stripePromise = loadStripe(publishableKey, {
    betas: ['us_bank_account_beta_2']
  });

  ReactDOM.render(
    <React.StrictMode>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </React.StrictMode>,
    document.getElementById('root')
  );
});
