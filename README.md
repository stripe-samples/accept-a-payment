# Accept a payment

_Explore different ways to accept payments on the web with Stripe._

> [!TIP]
> **Starting a new integration?** Stripe recommends building on the [Checkout Sessions API](https://docs.stripe.com/payments/checkout) — choose a [Stripe-hosted page](./prebuilt-checkout-page) for simplicity or [Elements with Checkout Sessions](./elements-with-checkout-sessions) for full design control.

## Choose your integration

This repository includes four sample integrations built on two different APIs.

### Checkout Sessions API — Recommended

Stripe recommends the Checkout Sessions API for most integrations. It requires less code than the Payment Intents API and includes built-in support for tax, discounts, shipping, adaptive pricing, recurring payments, localization, and automatic payment methods.

#### [Prebuilt Checkout page](./prebuilt-checkout-page) — Stripe-hosted

Redirect customers to a Stripe-hosted payment page. The simplest integration with the least code.

- **Low complexity.** Create a Checkout Session and redirect — that's it.
- **Customize** logo, images, and colors.
- **Payment methods added automatically** with a single line change.
- **Built-in** Apple Pay and Google Pay support.
- **Customers redirect** to a Stripe-hosted page, then return to your site.
- **Small refactor** to collect recurring payments.
- **Built-in** input validation and error handling.
- **Localized** in 50+ languages.
- **Automate** sales tax, VAT, and GST calculation with one line of code.

Servers: Node, Python, Ruby, PHP, Java, Go, .NET, Next.js · Clients: HTML, React, Vue

[Sample code](./prebuilt-checkout-page) | [Docs](https://stripe.com/docs/payments/accept-a-payment?ui=checkout)

#### [Elements with Checkout Sessions](./elements-with-checkout-sessions) — Custom form

Create a Checkout Session on your server, then render the Payment Element on your site using `ui_mode: 'elements'`. Full design control while Stripe handles the payment logic.

- **Moderate complexity.** A few API calls on your server, a few lines of Stripe.js on your client.
- **Customize** components with the [Appearance API](https://stripe.com/docs/stripe-js/appearance-api).
- **Payment methods added automatically** — no code changes needed for new methods.
- **Built-in** Apple Pay and Google Pay support.
- **Customers stay on your site**, with a redirect after payment completion.
- **Small refactor** to collect recurring payments.
- **Built-in** input validation and error handling.
- **Localized** in 50+ languages.
- **Automate** sales tax, VAT, and GST calculation with one line of code.

Servers: Node, Python, Ruby, PHP, Java, Go, .NET · Clients: HTML, React

[Sample code](./elements-with-checkout-sessions) | [Docs](https://docs.stripe.com/payments/quickstart-checkout-sessions)

---

### Payment Intents API — Direct API

The Payment Intents API gives you direct control over the payment lifecycle. It requires more server-side code and doesn't include built-in tax or easy recurring payment support. Use this when you need capabilities beyond what Checkout Sessions provides.

#### [Payment Element](./payment-element) — Prebuilt UI

Render the Payment Element on your site using the Payment Intents API directly. Similar UI to Elements with Checkout Sessions but you manage the payment lifecycle yourself.

- **Moderate complexity.** More server-side payment lifecycle management.
- **Customize** components with the [Appearance API](https://stripe.com/docs/stripe-js/appearance-api).
- **Payment methods added automatically** with a single line change.
- **Built-in** Apple Pay and Google Pay support.
- **Customers stay on your site**, but payment completion may trigger a redirect.
- **Large refactor** to collect recurring payments.
- **Built-in** input validation; you must implement error handling.
- **Localized** in 50+ languages.
- Calculate tax using the [Tax API](https://stripe.com/docs/tax/custom).

Servers: Node, Node (TypeScript), Python, Ruby, PHP, Java, Go, .NET, Next.js · Clients: HTML, React, Vue

[Sample code](./payment-element) | [Docs](https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements)

#### [Custom payment flow](./custom-payment-flow) — Advanced

Build a fully custom checkout using individual Stripe Elements and the Payment Intents API. Maximum control over every detail.

- **High complexity.** You manage the full payment lifecycle and UI.
- **Customize** all components with CSS.
- **Implement each payment method** as a separate integration.
- **Integrate** Apple Pay and Google Pay with extra code.
- **Customers stay on your site** throughout the entire flow.
- **Large refactor** to collect recurring payments.
- **Implement your own** input validation and error handling.
- **Implement your own** localization.
- Calculate tax using the [Tax API](https://stripe.com/docs/tax/custom).

Servers: Node, Node (TypeScript), Python, Ruby, PHP, Java, Go, .NET, Next.js · Clients: HTML, React, Android (Kotlin), iOS (SwiftUI), React Native (Expo)

[Sample code](./custom-payment-flow) | [Docs](https://stripe.com/docs/payments/accept-card-payments?platform=web&ui=elements)

---

## At a glance

| | Checkout Sessions API | | Payment Intents API | |
|---|---|---|---|---|
| | Prebuilt Checkout page | Elements with Checkout Sessions | Payment Element | Custom payment flow |
| Complexity | Low | Moderate | Moderate | High |
| Customization | Logo, images, colors | Appearance API | Appearance API | Full CSS |
| Customer experience | Redirects to Stripe | Stays on your site | Stays on your site | Stays on your site |
| Recurring payments | Small refactor | Small refactor | Large refactor | Large refactor |
| Tax calculation | Built-in | Built-in | Tax API | Tax API |
| Adaptive pricing | Built-in | Built-in | Not available | Not available |
| Payment methods | Automatic | Automatic | Automatic | Manual per method |

### Payment method support

| Payment method | Prebuilt Checkout page | Elements with Checkout Sessions | Payment Element | Custom payment flow |
|---|---|---|---|---|
| ACH Debit | ✅ | ✅ | ✅ | ✅ |
| Affirm | ✅ | ✅ | ✅ | |
| Afterpay / Clearpay | ✅ | ✅ | ✅ | ✅ |
| Alipay | ✅ | ✅ | ✅ | ✅ |
| Amazon Pay | ✅ | ✅ | ✅ | |
| Apple Pay | ✅ | ✅ | ✅ | ✅ |
| Bacs Direct Debit | ✅ | ✅ | | |
| Bancontact | ✅ | ✅ | ✅ | ✅ |
| BECS Direct Debit | ✅ | ✅ | ✅ | ✅ |
| Boleto | ✅ | ✅ | ✅ | ✅ |
| Cards | ✅ | ✅ | ✅ | ✅ |
| Cash App Pay | ✅ | ✅ | ✅ | |
| EPS | ✅ | ✅ | ✅ | ✅ |
| FPX | ✅ | ✅ | ✅ | ✅ |
| Google Pay | ✅ | ✅ | ✅ | ✅ |
| GrabPay | ✅ | ✅ | ✅ | ✅ |
| iDEAL | ✅ | ✅ | ✅ | ✅ |
| Klarna | ✅ | ✅ | ✅ | ✅ |
| Link | ✅ | ✅ | ✅ | |
| Multibanco | ✅ | ✅ | ✅ | |
| OXXO | ✅ | ✅ | ✅ | ✅ |
| PayPal | ✅ | ✅ | ✅ | ✅ |
| Przelewy24 (P24) | ✅ | ✅ | ✅ | ✅ |
| Revolut Pay | ✅ | ✅ | ✅ | |
| SEPA Direct Debit | ✅ | ✅ | ✅ | ✅ |
| WeChat Pay | ✅ | ✅ | ✅ | ✅ |
| Zip | ✅ | ✅ | ✅ | |

## Quick start

The recommended way to use this Stripe Sample is with the [Stripe CLI](https://stripe.com/docs/stripe-cli#install):

```sh
stripe samples create accept-a-payment
```

You can also clone the repository directly. See the individual READMEs for setup instructions:

**Checkout Sessions API** (recommended):
- [Prebuilt Checkout page](./prebuilt-checkout-page/README.md) — Stripe-hosted page
- [Elements with Checkout Sessions](./elements-with-checkout-sessions/README.md) — custom form on your site

**Payment Intents API:**
- [Payment Element](./payment-element/README.md) — prebuilt UI, direct API
- [Custom payment flow](./custom-payment-flow/README.md) — fully custom UI

## Testing

See [TESTING.md](./TESTING.md).

<details>
<summary><strong>Dev Containers and Codespaces</strong></summary>

We provide [Dev Container](https://containers.dev/) configurations for most of the sample apps for web. In Visual Studio Code, use `Reopen in Containers` from the Command Palette and choose a sample from the options.

You can also try these samples without installing Docker by using [GitHub Codespaces](https://github.com/features/codespaces). Click "New with options..." and choose a sample from the Dev container configuration select box. **Note: you will be charged for GitHub Codespaces usage.**

![](https://github.com/stripe-samples/accept-a-payment/assets/43346/9db4688c-a71d-4624-80f1-4b79c5cae44d)

After launching, export the required environment variables and start the server:

```sh
export STRIPE_PUBLISHABLE_KEY=pk_test_...
export STRIPE_SECRET_KEY=sk_test_...
```

See [TESTING.md](./TESTING.md) for running tests inside Dev Containers.

</details>

## FAQ

Q: **Which integration should I choose?**

A: Start with the Checkout Sessions API — it handles tax, recurring payments, and localization with less code. Choose [Prebuilt Checkout page](./prebuilt-checkout-page) for a Stripe-hosted page with zero front-end work, or [Elements with Checkout Sessions](./elements-with-checkout-sessions) if you want a custom payment form on your site. The [Payment Element](./payment-element) and [Custom payment flow](./custom-payment-flow) use the Payment Intents API directly, which gives you more control but requires significantly more code.

Q: **Why did you pick these frameworks?**

A: We chose the most minimal framework to convey the key Stripe calls and concepts you need to understand. These demos are meant as an educational tool that helps you roadmap how to integrate Stripe within your own system independent of the framework.

## Get support

If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://stripe.com/go/developer-chat)
- on X at [@StripeDev](https://x.com/StripeDev)
- on Stack Overflow at the [stripe-payments](https://stackoverflow.com/tags/stripe-payments/info) tag

Sign up to [stay updated with developer news](https://go.stripe.global/dev-digest).

## Authors

- [@cjav_dev](https://twitter.com/cjav_dev)
- [@thorwebdev](https://twitter.com/thorwebdev)
- [@aliriaz](https://github.com/aliriaz-stripe)
- [@charlesw](https://twitter.com/charlesw_dev)

## Contributors

<a href="https://github.com/stripe-samples/accept-a-payment/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=stripe-samples/accept-a-payment" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
