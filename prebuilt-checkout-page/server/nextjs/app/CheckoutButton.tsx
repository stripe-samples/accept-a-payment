"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/create-checkout-session";

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-stripe-purple text-white py-3 px-4 rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isLoading ? "Redirecting..." : "Checkout"}
      </button>
    </div>
  );
}
