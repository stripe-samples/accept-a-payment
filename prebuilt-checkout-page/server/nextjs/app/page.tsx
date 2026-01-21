import { getStripe } from "@/lib/stripe";
import { CheckoutButton } from "./CheckoutButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const price = await getStripe().prices.retrieve(process.env.PRICE!);

  const formatPrice = (amount: number | null, currency: string) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">
          Accept a Payment
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <p className="text-lg font-medium">Product</p>
            <p className="text-3xl font-bold text-stripe-purple mt-2">
              {formatPrice(price.unit_amount, price.currency)}
            </p>
            <p className="text-gray-500 text-sm mt-1 uppercase">
              {price.currency}
            </p>
          </div>
          <CheckoutButton />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Test card: 4242 4242 4242 4242
        </p>
      </div>
    </main>
  );
}
