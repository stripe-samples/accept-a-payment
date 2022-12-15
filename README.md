# Accept a payment

_Learn how to securely accept payments online._

This repository includes examples of 3 types of integration.

|[Prebuilt Checkout page](./prebuilt-checkout-page) ([docs](https://stripe.com/docs/payments/accept-a-payment?ui=checkout))| [Payment Element](./payment-element) ([docs](https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements)) | [Custom payment flow](./custom-payment-flow) ([docs](https://stripe.com/docs/payments/accept-card-payments?platform=web&ui=elements)) |
|---|---|---|
| Lower complexity. | Moderate complexity. | Higher complexity. |
| Customize logo, images, and colors. | Customize components with [Appearance API](https://stripe.com/docs/stripe-js/appearance-api). | Customize all components with CSS. |
| Add payment method types with a single line change. | Add payment methods with a single line change. | Implement each payment method type as a custom integration. |
| Built-in support for Apple Pay, and Google Pay. | Built-in support for Apple Pay and Google Pay. | Integrate Apple Pay and Google Pay with extra code.|
| Redirect to Stripe hosted page. | Customers stay on your site, but payment completion triggers a redirect. |Customers stay on your site. |
| Small refactor to collect recurring payments. | Large refactor to collect recurring payments. | Large refactor to collect recurring payments. |
| Input validation and error handling built in. | Input validation built-in but you must implement error handling. | Implement your own input validation and error handling. |
| Localized in 25+ languages. | Localized in 25+ languages. |Implement your own localization. |
| Automate calculation and collection of sales tax, VAT and GST with one line of code. | Implement your own logic to automate taxes on your transactions. | Implement your own logic to automate taxes on your transactions. |


### Payment Method Type Support

|Payment Method Type | [Prebuilt Checkout page](./prebuilt-checkout-page) ([docs](https://stripe.com/docs/payments/accept-a-payment?ui=checkout))| [Payment Element](./payment-element) ([docs](https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements)) | [Custom payment flow](./custom-payment-flow) ([docs](https://stripe.com/docs/payments/accept-card-payments?platform=web&ui=elements)) |
|---|---|---|---|
|ACH Credit Transfer|  |  | |
|ACH Debit| ✅ | ✅ | ✅ |
|Afterpay/Clearpay| ✅ | ✅ | ✅ |
|Alipay| ✅ | ✅ | ✅ |
|Apple Pay| ✅ | ✅ | ✅ |
|Bacs Direct Debit| ✅ |  |  |
|Bancontact| ✅ | ✅ | ✅ |
|BECS Direct Debit| ✅ | ✅ | ✅ |
|Boleto| ✅ | ✅ | ✅ |
|Cards| ✅ | ✅ | ✅ |
|EPS| ✅ | ✅ | ✅ |
|FPX| ✅ | ✅ | ✅ |
|giropay| ✅ | ✅ | ✅ |
|Google Pay| ✅ | ✅ | ✅ |
|GrabPay| ✅ | ✅ | ✅ |
|iDEAL| ✅ | ✅ | ✅ |
|Klarna| ✅ | ✅ | ✅ |
|Multibanco| ✅ | ✅ |  |
|OXXO| ✅ | ✅ | ✅ |
|Przelewy24 (P24)| ✅ | ✅ | ✅ |
|SEPA Direct Debit| ✅ | ✅ | ✅ |
|Sofort| ✅ | ✅ | ✅ |
|WeChat Pay| ✅ | ✅ | ✅ |


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
- [Payment Element](./payment-element/README.md)
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

Sign up to [stay updated with developer news](https://go.stripe.global/dev-digest).


### Testing

See [TESTING.md](./TESTING.md).

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
