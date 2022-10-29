# Inspecting CI failures

## Playwright snapshot testing

The tests run in the job `snapshot_test` in the `ci.yml`. Each test just takes a screenshot of each payment page and compares it with the one taken in advance (saved under `*-snapshots/` dir). If there are differences between the two images, the test fails.

When some of the tests fail, we can inspect the following images as the artifact of the CI run page (like [this](https://github.com/hibariya/accept-a-payment/actions/runs/3327875035#artifacts)).

* The expected screenshot
* The actual screenshot
* The visual diff

The expected screenshots are stored under the `playwright/*.spec.ts-snapshots/` directory. They can be updated by passing the `--update-snapshots` option to Playwright. To run Playwright locally, see the following `Running tests on local environments` section.

# Running tests on local environments

## Initial setup

1. Export the `COMPOSE_FILE` environment variable:
    ```bash
    export COMPOSE_FILE=docker-compose.yml:docker-compose.override.yml:docker-compose.playwright.yml
    ```
2. Clone the sample-ci repo switching to `playwright` branch
    ```bash
    git clone --branch playwright ssh://git@github.com/stripe-samples/sample-ci
    ```

## Starting a sample app

The following steps set up and start a particular sample app with particular implementations.

1. Generate Docker Compose settings for a particular combination of server and client apps.
    1. Syntax: `./sample-ci/setup_development_environment <sample-name> <server-app> <client-app> [<server-image>]`
        1. `<sample-name>`: the sample app directory name (e.g., `custom-payment-flow`)
        2. `<server-app>`: the server directory name (e.g., `node` for `custom-payment-flow/server/node`)
        3. `<client-app>`: the relative path of the client app directory path from the server app (e.g., `../../client/react-cra`)
        4. `<server-image>`: the server app’s Docker image (optional)
    2. Example 1: sample-name: `custom-payment-flow` / server-app: `node` / client-app: `react-cra`
        ```bash
        ./sample-ci/setup_development_environment custom-payment-flow node ../../client/react-cra node:lts
        ```
    3. Example 2: sample-name: `custom-payment-flow` / server-app: `ruby` / client-app: `html`
        ```bash
        ./sample-ci/setup_development_environment custom-payment-flow ruby ../../client/html ruby:3.1
        ```
2. Create the `.env` file on the root directory of the sample repository. The `DOMAIN` should be `http://web:4242` for HTML apps and `http://frontend:3000` for React/Vue apps. The `STRIPE_WEBHOOK_SECRET` can be obtained with the command `docker compose run --rm stripe`.
    ```bash
    // .env
    STRIPE_PUBLISHABLE_KEY
    STRIPE_SECRET_KEY
    STRIPE_WEBHOOK_SECRET # docker compose run --rm stripe will display an available webhook secret
    DOMAIN=http://frontend:3000 # or http://web:4242 for clients/html
    PRICE=price_xxxx # the price ID you have
    ```
3. (For only React/Vue apps) replace the proxy destination with `http://web:4242` in the `package.json` of the client app like below.
    ```bash
    sed -i -E 's/("proxy":\s*)"http:\/\/localhost:4242"/\1"http:\/\/web:4242"/' custom-payment-flow/client/react-cra/package.json
    ```
4. Start the sample app
    ```bash
    docker compose --profile=frontend up
    ```
5. Then open `http://localhost:3000`.

## Running Playwright tests

After starting a sample app, run `npm run test` on the `playwright` service like below:

```bash
docker compose exec playwright npm install # needed for the first time only
docker compose exec playwright npm run test -- playwright/custom-payment-flow-e2e-react-cra.spec.ts
```

To update existing snapshots which are used as expected images, pass the `--update-snapshots` option. A particular test can be specified by passing a part of the test title as the `-g` option like below.

```bash
docker compose exec playwright npm run test -- playwright/custom-payment-flow-e2e-react-cra.spec.ts --update-snapshots -g giropay
```

## Running Capybara E2E tests

Use the `runner` service to run RSpec tests.

```bash
docker compose exec runner bundle exec rspec spec/custom_payment_flow_e2e_spec.rb
```

## Running server (API) tests

```bash
docker compose exec runner bundle exec rspec spec/custom_payment_flow_server_spec.rb
```

## Shutting down the app

```shell
docker compose stop
```
