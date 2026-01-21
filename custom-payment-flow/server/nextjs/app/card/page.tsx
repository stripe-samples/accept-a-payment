"use client";

import { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Link from "next/link";
import { CardForm } from "./CardForm";

export default function CardPage() {
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(({ publishableKey }) => {
        if (publishableKey) {
          setStripePromise(loadStripe(publishableKey));
        }
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-md">
        <Link href="/" className="text-stripe-purple hover:underline">
          home
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Card</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h4 className="font-semibold mb-2">
            Try a{" "}
            <a
              href="https://stripe.com/docs/testing#cards"
              target="_blank"
              className="text-stripe-purple hover:underline"
            >
              test card
            </a>
            :
          </h4>
          <div className="space-y-1 text-sm mb-4">
            <div>
              <code className="bg-gray-100 px-1 rounded">4242424242424242</code>{" "}
              (Visa)
            </div>
            <div>
              <code className="bg-gray-100 px-1 rounded">5555555555554444</code>{" "}
              (Mastercard)
            </div>
            <div>
              <code className="bg-gray-100 px-1 rounded">4000002500003155</code>{" "}
              (Requires{" "}
              <a
                href="https://www.youtube.com/watch?v=2kc-FjU2-mY"
                target="_blank"
                className="text-stripe-purple hover:underline"
              >
                3DSecure
              </a>
              )
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Use any future expiration, any 3 digit CVC, and any postal code.
          </p>
        </div>

        {stripePromise && (
          <Elements stripe={stripePromise}>
            <CardForm />
          </Elements>
        )}

        <p className="mt-6 text-sm text-center">
          <a
            href="https://youtu.be/0oHjwz-WHcc"
            target="_blank"
            className="text-stripe-purple hover:underline"
          >
            Watch a demo walkthrough
          </a>
        </p>
      </div>
    </main>
  );
}
