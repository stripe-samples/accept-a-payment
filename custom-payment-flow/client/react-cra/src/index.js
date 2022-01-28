import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

document.addEventListener('DOMContentLoaded', async () => {
  const {publishableKey} = await fetch('/config').then((r) => r.json());
  const stripePromise = loadStripe(publishableKey, {
    betas: ['konbini_pm_beta_1'],
    apiVersion: '2020-08-27; konbini_beta=v1',
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
