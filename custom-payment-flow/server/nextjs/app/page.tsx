import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Accept a payment</h1>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Cards</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              <Link href="/card" className="text-stripe-purple hover:underline">
                Card
              </Link>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Link</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              <Link href="/link" className="text-stripe-purple hover:underline">
                Link
              </Link>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Bank debits</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              <Link href="/ach" className="text-stripe-purple hover:underline">
                ACH Direct Debit
              </Link>
            </li>
            <li>
              <Link
                href="/becs-debit"
                className="text-stripe-purple hover:underline"
              >
                BECS Direct Debit
              </Link>
            </li>
            <li>
              <Link
                href="/sepa-debit"
                className="text-stripe-purple hover:underline"
              >
                SEPA Direct Debit
              </Link>
            </li>
            <li>
              <Link href="/acss" className="text-stripe-purple hover:underline">
                Pre-authorized debit in Canada (ACSS)
              </Link>
            </li>
            <li>
              Bacs Direct Debit{" "}
              <small>
                (Available with{" "}
                <a
                  href="https://stripe.com/docs/payments/payment-methods/bacs-debit"
                  target="_blank"
                  className="text-stripe-purple hover:underline"
                >
                  Stripe Checkout
                </a>
                )
              </small>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Bank redirects</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              <Link
                href="/bancontact"
                className="text-stripe-purple hover:underline"
              >
                Bancontact
              </Link>
            </li>
            <li>
              <Link href="/eps" className="text-stripe-purple hover:underline">
                EPS
              </Link>
            </li>
            <li>
              <Link href="/fpx" className="text-stripe-purple hover:underline">
                FPX
              </Link>
            </li>
            <li>
              <Link
                href="/giropay"
                className="text-stripe-purple hover:underline"
              >
                giropay
              </Link>
            </li>
            <li>
              <Link
                href="/ideal"
                className="text-stripe-purple hover:underline"
              >
                iDEAL
              </Link>
            </li>
            <li>
              <Link href="/p24" className="text-stripe-purple hover:underline">
                Przelewy24 (P24)
              </Link>
            </li>
            <li>
              <Link
                href="/sofort"
                className="text-stripe-purple hover:underline"
              >
                Sofort
              </Link>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Bank transfers</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              ACH Credit{" "}
              <small>
                (Available on{" "}
                <a
                  href="https://stripe.com/docs/sources/ach-credit-transfer"
                  target="_blank"
                  className="text-stripe-purple hover:underline"
                >
                  legacy Sources API
                </a>
                )
              </small>
            </li>
            <li>
              Multibanco{" "}
              <small>
                (Available on{" "}
                <a
                  href="https://stripe.com/docs/sources/multibanco"
                  target="_blank"
                  className="text-stripe-purple hover:underline"
                >
                  legacy Sources API
                </a>
                )
              </small>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Buy now pay later</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              <Link
                href="/affirm"
                className="text-stripe-purple hover:underline"
              >
                Affirm
              </Link>
            </li>
            <li>
              <Link
                href="/afterpay-clearpay"
                className="text-stripe-purple hover:underline"
              >
                Afterpay / Clearpay
              </Link>
            </li>
            <li>
              <Link
                href="/klarna"
                className="text-stripe-purple hover:underline"
              >
                Klarna
              </Link>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Vouchers</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              <Link
                href="/boleto"
                className="text-stripe-purple hover:underline"
              >
                Boleto
              </Link>
            </li>
            <li>
              <Link href="/oxxo" className="text-stripe-purple hover:underline">
                OXXO
              </Link>
            </li>
            <li>
              <Link
                href="/konbini"
                className="text-stripe-purple hover:underline"
              >
                Konbini
              </Link>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Wallets</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              <Link
                href="/alipay"
                className="text-stripe-purple hover:underline"
              >
                Alipay
              </Link>
            </li>
            <li>
              <Link
                href="/apple-pay"
                className="text-stripe-purple hover:underline"
              >
                Apple Pay
              </Link>
            </li>
            <li>
              <Link
                href="/google-pay"
                className="text-stripe-purple hover:underline"
              >
                Google Pay
              </Link>
            </li>
            <li>
              <Link
                href="/grabpay"
                className="text-stripe-purple hover:underline"
              >
                GrabPay
              </Link>
            </li>
          </ul>
          <h4 className="text-lg font-medium mt-4 mb-2">
            Express Checkout Element
          </h4>
          <ul className="list-disc list-inside ml-4">
            <li>
              <Link
                href="/paypal"
                className="text-stripe-purple hover:underline"
              >
                PayPal
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
