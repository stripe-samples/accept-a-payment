# Accept a payment

_Learn how to securely accept payments online._

This repository includes examples of 2 types of integration types.

|[Prebuilt Checkout page](./prebuilt-checkout-page) ([docs](https://stripe.com/docs/payments/accept-a-payment?ui=checkout))| [Custom payment flow](./custom-payment-flow) ([docs](https://stripe.com/docs/payments/accept-a-payment?ui=elements)) |
|---|---|
| Lower complexity. | Higher complexity. |
| Customize logo, images, and colors. | Customize all components with CSS. |
| Add payment method types with a single line change. | Implement each payment method type as a custom integration. |
| Built-in support for Apple Pay, and Google Pay. | Integrate Apple Pay and Google Pay with extra code.|
| Redirect to Stripe hosted page. | Customers stay on your site. |
| Small refactor to collect recurring payments. | Large refactor to collect recurring payments. |
| Input validation and error handling built in. | Implement your own input validation and error handling. |
| Localized in 25+ languages. | Implement your own localization. |


### Payment Method Type Support

|Payment Method Type | [Prebuilt Checkout page](./prebuilt-checkout-page) ([docs](https://stripe.com/docs/payments/accept-a-payment?ui=checkout))| [Custom payment flow](./custom-payment-flow) ([docs](https://stripe.com/docs/payments/accept-a-payment?ui=elements)) |
|---|---|---|
|ACH Credit Transfer|  |  |
|ACH Debit|  |  |
|Afterpay/Clearpay| ✅ | ✅ |
|Alipay| ✅ | ✅ |
|Apple Pay| ✅ | ✅ |
|Bacs Direct Debit| ✅ |  |
|Bancontact| ✅ | ✅ |
|BECS Direct Debit| | ✅ |
|Boleto| ✅ | ✅ |
|Cards| ✅ | ✅ |
|EPS| ✅ | ✅ |
|FPX| ✅ | ✅ |
|giropay| ✅ | ✅ |
|Google Pay| ✅ | ✅ |
|GrabPay| ✅ | ✅ |
|iDEAL| ✅ | ✅ |
|Klarna|  |  |
|Multibanco| | ✅ |
|OXXO| | ✅ |
|Przelewy24 (P24)| ✅ | ✅ |
|SEPA Direct Debit| ✅ | ✅ |
|Sofort| ✅ | ✅ |
|WeChat Pay|  |  |


## Installation

The recommended way to use this Stripe Sample is with the [Stripe CLI](https://stripe.com/docs/stripe-cli#install):

```sh
stripe samples create accept-a-payment
```

You can also clone the repository, but there is a bit more manual setup work to
configure the `.env` environment variable file in the server directory.

You'll find more detailed instructions for each integration type in the
relevant READMEs:

- [Prebuilt Checkout page](./prebuilt-checkout-page/README.md)
- [Custom payment flow](./custom-payment-flow/README.md)

---
## FAQ

Q: Why did you pick these frameworks?

A: We chose the most minimal framework to convey the key Stripe calls and
concepts you need to understand. These demos are meant as an educational tool
that helps you roadmap how to integrate Stripe within your own system
independent of the framework.

## Get support

If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://stripe.com/go/developer-chat)
- on Twitter at [@StripeDev](https://twitter.com/StripeDev)
- on Stack Overflow at the [stripe-payments](https://stackoverflow.com/tags/stripe-payments/info) tag
- by [email](mailto:support+github@stripe.com)

Sign up to [stay updated with developer news](https://go.stripe.global/dev-digest).

## Authors

- [@cjav_dev](https://twitter.com/cjav_dev)
- [@thorwebdev](https://twitter.com/thorwebdev)
- [@aliriaz](https://github.com/aliriaz-stripe)
