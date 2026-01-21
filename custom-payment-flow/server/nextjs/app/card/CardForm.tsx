"use client";

import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";

export function CardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("Jenny Rosen");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Create PaymentIntent on the server
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency: "usd",
        paymentMethodType: "card",
      }),
    });

    const { clientSecret, error: backendError } = await response.json();

    if (backendError) {
      setMessage(backendError.message);
      setIsLoading(false);
      return;
    }

    setMessage("Client secret returned.");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsLoading(false);
      return;
    }

    // Confirm the card payment
    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: name,
          },
        },
      });

    if (stripeError) {
      setMessage(stripeError.message || "An error occurred");
      setIsLoading(false);
      return;
    }

    setMessage(`Payment ${paymentIntent?.status}: ${paymentIntent?.id}`);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jenny Rosen"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="card-element" className="block text-sm font-medium mb-1">
          Card
        </label>
        <div className="p-3 border border-gray-300 rounded-md bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#0a2540",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-stripe-purple text-white py-3 px-4 rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isLoading ? "Processing..." : "Pay"}
      </button>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
          {message}
        </div>
      )}
    </form>
  );
}
