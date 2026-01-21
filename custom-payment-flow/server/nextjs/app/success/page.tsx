"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";

export default function SuccessPage() {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientSecret = params.get("payment_intent_client_secret");

    if (!clientSecret) {
      setPaymentStatus("No payment intent found");
      return;
    }

    // Initialize Stripe and retrieve payment intent
    fetch("/api/config")
      .then((r) => r.json())
      .then(async ({ publishableKey }) => {
        if (!publishableKey) {
          setPaymentStatus("Configuration error");
          return;
        }

        const stripe = await loadStripe(publishableKey);
        if (!stripe) {
          setPaymentStatus("Failed to load Stripe");
          return;
        }

        const { paymentIntent } = await stripe.retrievePaymentIntent(
          clientSecret
        );
        if (paymentIntent) {
          setPaymentStatus(paymentIntent.status);
          setPaymentId(paymentIntent.id);
        }
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Success</h1>

          {paymentStatus && (
            <div className="bg-gray-50 rounded-md p-4 text-left text-sm mb-4">
              <p>
                <span className="text-gray-500">Payment Intent Status:</span>{" "}
                <span className="font-medium">{paymentStatus}</span>
              </p>
              {paymentId && (
                <p className="mt-2">
                  <span className="text-gray-500">Payment ID:</span>{" "}
                  <a
                    href={`https://dashboard.stripe.com/test/payments/${paymentId}`}
                    target="_blank"
                    className="text-stripe-purple hover:underline break-all"
                  >
                    {paymentId}
                  </a>
                </p>
              )}
            </div>
          )}

          <Link
            href="/"
            className="inline-block text-stripe-purple hover:underline"
          >
            Restart
          </Link>
        </div>
      </div>
    </main>
  );
}
