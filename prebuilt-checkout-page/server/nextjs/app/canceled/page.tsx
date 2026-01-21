import Link from "next/link";

export default function CanceledPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Canceled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was canceled. No charges were made.
          </p>
          <Link
            href="/"
            className="inline-block bg-stripe-purple text-white py-3 px-6 rounded-md font-medium hover:bg-opacity-90 transition-opacity"
          >
            Try again
          </Link>
        </div>
      </div>
    </main>
  );
}
