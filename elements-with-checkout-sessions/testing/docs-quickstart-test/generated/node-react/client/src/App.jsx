import React, { useMemo } from "react";
import {loadStripe} from '@stripe/stripe-js';

import {
  CheckoutElementsProvider
} from '@stripe/react-stripe-js/checkout';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import CheckoutForm from './CheckoutForm';
import Complete from './Complete';

import "./App.css";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test publishable API key embedded in code samples.
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

const App = () => {
  const clientSecret = useMemo(() => {
    return fetch('/create-checkout-session', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const appearance = {
    {{APPEARANCE}}
  };

  return (
    <div className="App">
      <Router>

        <CheckoutElementsProvider
          stripe={stripePromise}
          options={{
            clientSecret,
            elementsOptions: {appearance},
          }}
        >
          <Routes>
            <Route path="/checkout" element={<CheckoutForm />} />
            <Route path="/complete" element={<Complete />} />
          </Routes>
        </CheckoutElementsProvider>
      </Router>
    </div>
  )
}

export default App;
