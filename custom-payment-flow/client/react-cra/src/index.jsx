import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

document.addEventListener('DOMContentLoaded', async () => {
  const {publishableKey} = await fetch('/api/config').then((r) => r.json());
  const stripePromise = loadStripe(publishableKey);

  const container = document.getElementById('root');
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </React.StrictMode>,
  );
});
