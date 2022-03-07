# E2E testing

## Executing the E2E test in our local environment
### 1: Configure the env information
Update/create the `.env` file in the project root and set these variables:

```
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_SECRET_KEY
DOMAIN=http://web:4242
SERVER_URL=http://web:4242
PRICE=price_xxxx # the price ID you have
```

### 2: Clone the CI project in the repo

Clone the CI project in the project root.

```
% git clone ssh://git@github.com/stripe-samples/sample-ci
```

### 3: Build the image that you want to test

```
# custom-payment-flow/server/node & custom-payment-flow/client/html
% ./sample-ci/setup_development_environment custom-payment-flow node ../../client/html

# custom-payment-flow/server/php & custom-payment-flow/client/react
% ./sample-ci/setup_development_environment custom-payment-flow node ../../client/react-cra 
```

### 4: start the testing target application

```
% docker-compose up
```

### 5: Execute the test

```
% docker-compose exec runner bundle exec rspec spec/custom_payment_flow_server_spec.rb
```

## How to change the testing target project

### 1: Stop the running process

```
% docker-compose down
```

### 2: Change the project

```
# Choose the different project dir
% ./sample-ci/setup_development_environment custom-payment-flow node ../../client/react-cra 
```

#### Command

```bash
./sample-ci/setup_development_environment <project-name> <server-side-language> <client-side-framework>

# Example
## Elements / Ruby / HTML
./sample-ci/setup_development_environment custom-payment-flow ruby ../../client/html

## Current dir / Ruby / React app
./sample-ci/setup_development_environment . php ../../client/react-cra 
```

### 3: Starting new process

```
% docker-compose up
```

### 4: Execute the new test

```
% docker-compose exec runner bundle exec rspec spec/custom_payment_flow_server_spec.rb
```


