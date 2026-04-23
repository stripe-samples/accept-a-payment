import React, { useEffect, useState, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";

import {
  CheckoutElementsProvider,
} from "@stripe/react-stripe-js/checkout";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import Complete from "./Complete";

import "./App.css";

const App = () => {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    fetch("/api/config").then(async (r) => {
      const { publishableKey } = await r.json();
      setStripePromise(loadStripe(publishableKey));
    });
  }, []);

  const clientSecret = useMemo(() => {
    return fetch("/api/create-checkout-session", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const appearance = {};

  return (
    <main className="App">
      <BrowserRouter>
        <CheckoutElementsProvider
          stripe={stripePromise}
          options={{
            clientSecret,
            elementsOptions: { appearance },
          }}
        >
          <Routes>
            <Route path="/" element={<CheckoutForm />} />
            <Route path="/complete" element={<Complete />} />
          </Routes>
        </CheckoutElementsProvider>
      </BrowserRouter>
    </main>
  );
};

export default App;
