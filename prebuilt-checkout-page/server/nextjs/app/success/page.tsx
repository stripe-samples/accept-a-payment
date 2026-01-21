import { getStripe } from "@/lib/stripe";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <Link href="/" className="text-stripe-purple hover:underline">
            Return to checkout
          </Link>
        </div>
      </main>
    );
  }

  const session = await getStripe().checkout.sessions.retrieve(session_id);

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
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Thank you for your purchase.</p>

          <div className="bg-gray-50 rounded-md p-4 text-left text-sm">
            <h2 className="font-semibold mb-2">Order Details</h2>
            <div className="space-y-1">
              <p>
                <span className="text-gray-500">Status:</span>{" "}
                <span className="text-green-600 font-medium">
                  {session.payment_status}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Amount:</span>{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: session.currency || "usd",
                }).format((session.amount_total || 0) / 100)}
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                {session.customer_details?.email || "N/A"}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block mt-6 text-stripe-purple hover:underline"
          >
            Make another purchase
          </Link>
        </div>
      </div>
    </main>
  );
}
