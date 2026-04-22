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

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  const clientSecret = useMemo(() => {
    return fetch('/create-checkout-session', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const appearance = {
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
