import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

const calculateTax = false;

async function calculate_tax(
  orderAmount: number,
  currency: string
): Promise<Stripe.Tax.Calculation> {
  const taxCalculation = await getStripe().tax.calculations.create({
    currency,
    customer_details: {
      address: {
        line1: "10709 Cleary Blvd",
        city: "Plantation",
        state: "FL",
        postal_code: "33322",
        country: "US",
      },
      address_source: "shipping",
    },
    line_items: [
      {
        amount: orderAmount,
        reference: "ProductRef",
        tax_behavior: "exclusive",
        tax_code: "txcd_30011000",
      },
    ],
  });

  return taxCalculation;
}

export async function POST(req: NextRequest) {
  try {
    const { paymentMethodType, currency, paymentMethodOptions, customerId } =
      await req.json();

    // Each payment method type has support for different currencies. In order to
    // support many payment method types and several currencies, this server
    // endpoint accepts both the payment method type and the currency as
    // parameters. To get compatible payment method types, pass
    // `automatic_payment_methods[enabled]=true` and enable types in your dashboard
    // at https://dashboard.stripe.com/settings/payment_methods.
    //
    // Some example payment method types include `card`, `ideal`, and `link`.
    const orderAmount = 5999;
    let params: Stripe.PaymentIntentCreateParams;

    if (calculateTax) {
      const taxCalculation = await calculate_tax(orderAmount, currency);
      params = {
        payment_method_types:
          paymentMethodType === "link" ? ["link", "card"] : [paymentMethodType],
        amount: taxCalculation.amount_total,
        currency: currency,
        metadata: { tax_calculation: taxCalculation.id },
      };
    } else {
      params = {
        payment_method_types:
          paymentMethodType === "link" ? ["link", "card"] : [paymentMethodType],
        amount: orderAmount,
        currency: currency,
      };
    }

    // If this is for an ACSS payment, we add payment_method_options to create
    // the Mandate.
    if (paymentMethodType === "acss_debit") {
      params.payment_method_options = {
        acss_debit: {
          mandate_options: {
            payment_schedule: "sporadic",
            transaction_type: "personal",
          },
        },
      };
    } else if (paymentMethodType === "konbini") {
      // Default value of the payment_method_options
      params.payment_method_options = {
        konbini: {
          product_description: "Tシャツ",
          expires_after_days: 3,
        },
      };
    } else if (paymentMethodType === "customer_balance") {
      params.payment_method_data = {
        type: "customer_balance",
      };
      params.confirm = true;
      params.customer =
        customerId ||
        (await getStripe()
          .customers.create()
          .then((data) => data.id));
    }

    // If API given this data, we can override it
    if (paymentMethodOptions) {
      params.payment_method_options = paymentMethodOptions;
    }

    // Create a PaymentIntent with the amount, currency, and a payment method type.
    //
    // See the documentation [0] for the full list of supported parameters.
    //
    // [0] https://stripe.com/docs/api/payment_intents/create
    const paymentIntent = await getStripe().paymentIntents.create(params);

    // Send publishable key and PaymentIntent details to client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      nextAction: paymentIntent.next_action,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        error: {
          message: err.message,
        },
      },
      { status: 400 }
    );
  }
}
