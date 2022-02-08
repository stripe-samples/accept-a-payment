require 'stripe'
require 'sinatra'
require 'dotenv'
require './config_helper.rb'

# Copy the .env.example in the root into a .env file in this folder
Dotenv.load
ConfigHelper.check_env!

# For sample support and debugging, not required for production:
Stripe.set_app_info(
  'stripe-samples/accept-a-payment/custom-payment-flow',
  version: '0.0.2',
  url: 'https://github.com/stripe-samples'
)
Stripe.api_version = '2020-08-27;us_bank_account_beta=v2'
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

set :static, true
set :public_folder, File.join(File.dirname(__FILE__), ENV['STATIC_DIR'])
set :port, 4242
set :bind, '0.0.0.0'

get '/' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'index.html')
end

get '/config' do
  content_type 'application/json'

  { publishableKey: ENV['STRIPE_PUBLISHABLE_KEY'] }.to_json
end

post '/create-payment-intent' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  # Each payment method type has support for different currencies. In order to
  # support many payment method types and several currencies, this server
  # endpoint accepts both the payment method type and the currency as
  # parameters.
  #
  # Some example payment method types include `card`, `ideal`, and `alipay`.
  payment_method_type = data['paymentMethodType']
  currency = data['currency']
  params = {
    payment_method_types: [payment_method_type],
    amount: 1999, # Charge the customer 19.99 in the given currency.
    currency: currency
  }

  ## If this is for an ACSS payment, we add payment_method_options to create
  ## the Mandate.
  if payment_method_type == 'acss_debit'
    params[:payment_method_options] = {
      acss_debit: {
        mandate_options: {
          payment_schedule: 'sporadic',
          transaction_type: 'personal',
        },
      },
    }
  end

  # Create a PaymentIntent with the amount, currency, and a payment method type.
  #
  # See the documentation [0] for the full list of supported parameters.
  #
  # [0] https://stripe.com/docs/api/payment_intents/create
  begin
    payment_intent = Stripe::PaymentIntent.create(params)
  rescue Stripe::StripeError => e
    halt 400,
      { 'Content-Type' => 'application/json' },
      { error: { message: e.error.message }}.to_json
  rescue => e
    halt 500,
      { 'Content-Type' => 'application/json' },
      { error: { message: e.error.message }}.to_json
  end

  # This API endpoint renders back JSON with the client_secret for the payment
  # intent so that the payment can be confirmed on the front end. Once payment
  # is successful, fulfillment is done in the /webhook handler below.
  {
    clientSecret: payment_intent.client_secret,
  }.to_json
end

post '/webhook' do
  # Use webhooks to receive information about asynchronous payment events.
  # For more about our webhook events check out https://stripe.com/docs/webhooks.
  webhook_secret = ENV['STRIPE_WEBHOOK_SECRET']
  payload = request.body.read
  if !webhook_secret.empty?
    # Retrieve the event by verifying the signature using the raw body and secret if webhook signing is configured.
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    event = nil

    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, webhook_secret
      )
    rescue JSON::ParserError => e
      # Invalid payload
      status 400
      return
    rescue Stripe::SignatureVerificationError => e
      # Invalid signature
      puts '⚠️  Webhook signature verification failed.'
      status 400
      return
    end
  else
    data = JSON.parse(payload, symbolize_names: true)
    event = Stripe::Event.construct_from(data)
  end

  if event.type == 'payment_intent.succeeded'
    payment_intent = event.data.object
    puts '💰 Payment received!'
    # Fulfill any orders, e-mail receipts, etc
    # To cancel the payment you will need to issue a Refund (https://stripe.com/docs/api/refunds)
  end
  if event.type == 'payment_intent.payment_failed'
    payment_intent = event.data.object
    puts '❌ Payment failed.'
  end

  content_type 'application/json'
  { status: 'success' }.to_json
end
