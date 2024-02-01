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
| Automate calculation and collection of sales tax, VAT and GST with one line of code. | Calculate tax using the [Tax API](https://stripe.com/docs/tax/custom) | Calculate tax using the [Tax API](https://stripe.com/docs/tax/custom) |


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
|Link| ✅ | ✅ |  |
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


## Testing

See [TESTING.md](./TESTING.md).

## Running samples with Dev Containers or Codespaces

We provide [Dev Container](https://containers.dev/) configurations for most of the sample apps for web. For the Visual Studio Code example, by hitting `Reopen in Containers` in the Command Pallete and choosing a sample from the options prompted, dedicated Docker containers for the sample will be automatically created.

You can also try these samples even without installing Docker on your machine by using [GitHub Codespaces](https://github.com/features/codespaces). A sample app codespace can be created by clicking "New with options..." below and choosing a sample app from the Dev container configuration select box. **Note that in this case, you would be charged for usage of GitHub Codespaces.**

![](https://github.com/stripe-samples/accept-a-payment/assets/43346/9db4688c-a71d-4624-80f1-4b79c5cae44d)

### Running server app samples

After launching the environment, a couple of setup steps would be needed to launch the web app. For the NodeJS (`custom-payment-flow-server-node`) example:

1. Export the required environment variables
    1. `export STRIPE_PUBLISHABLE_KEY=XXXX`
    2. `export STRIPE_SECRET_KEY=XXXX`
    3. `export PRICE=XXXX`
2. Install the dependencies and run the web server. For NodeJS example, `npm install && npm run start`

You can also run some tests for the server app by the following steps. This example is a little hacky as we need to use SSH to run a test command in another container (`runner`).

1. Run `ssh-keygen` and `chmod 600 ~/.ssh/*`
2. Login to the test runner service with `ssh runner`
3. Move to the working dir with `cd /work`
4. Export the required environment variables
    1. `export $(cat .devcontainer/.env | xargs)`
    2. `export STRIPE_PUBLISHABLE_KEY=XXXX`
    3. `export STRIPE_SECRET_KEY=XXXX`
    4. `export PRICE=XXXX`
5. Run tests like `bundle exec rspec spec/custom_payment_flow_server_spec.rb `

### Running client app samples

After launching the environment, a couple of setup steps would be needed to launch the app. For the Create React App (`custom-payment-flow-client-react-cra`) example:

1. Export the required environment variables
    1. `export STRIPE_PUBLISHABLE_KEY=XXXX`
    2. `export STRIPE_SECRET_KEY=XXXX`
    3. `export PRICE=XXXX`
2. Install the dependencies and run the node web server by running `cd ../../server/node && npm install && npm run start`
3. In another terminal, install the dependencies and run the client app by running `npm install && npm start`
  * :memo: You might want to set `server.hmr.port` to `443` in `vite.config.js` ([related issue](https://github.com/vitejs/vite/issues/4259))

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
