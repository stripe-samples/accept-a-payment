require 'stripe'
require 'sinatra'
require 'dotenv'
require './config_helper.rb'

# Copy the .env.example in the root into a .env file in this folder.
Dotenv.load
# Ensure environment variables were configured properly.
ConfigHelper.check_env!
# For sample support and debugging, not required for production:
Stripe.set_app_info(
  'stripe-samples/accept-a-payment/prebuilt-checkout-page',
  version: '0.0.1',
  url: 'https://github.com/stripe-samples'
)
Stripe.api_version = '2020-08-27'

Stripe.api_key = ENV['STRIPE_SECRET_KEY']

set :static, true
set :public_folder, File.join(File.dirname(__FILE__), ENV['STATIC_DIR'])
set :port, 4242
set :bind, '0.0.0.0'

# Serve the static assets and a basic index.html page.
get '/' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'index.html')
end

# Fetch the Checkout Session to display the JSON result on the success page
get '/checkout-session' do
  content_type 'application/json'
  session_id = params[:sessionId]

  session = Stripe::Checkout::Session.retrieve(session_id)
  session.to_json
end

# Creates a Checkout Session then redirects to its `url`.
post '/create-checkout-session' do
  # The list of payment method types to allow your customers to pay.  This is
  # an array of strings. For this sample, the list of supported payment method
  # types are fetched from the environment variables `.env` file by default.
  # In practice, users often hard code a list of strings.
  pm_types = ENV.fetch('PAYMENT_METHOD_TYPES', 'card').split(',').map(&:strip)

  # Create new Checkout Session
  #
  # Other optional params include:
  # For full details see https:#stripe.com/docs/api/checkout/sessions/create
  session = Stripe::Checkout::Session.create(
    # ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the
    # session ID set as a query param when redirecting back to the success page.
    success_url: ENV['DOMAIN'] + '/success.html?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: ENV['DOMAIN'] + '/canceled.html',
    mode: 'payment',
    # automatic_tax: { enabled: true },
    line_items: [{
      quantity: 1,
      price: ENV['PRICE'],
    }]
  )

  redirect session.url, 303
end

post '/webhook' do
  # You can use webhooks to receive information about asynchronous payment events.
  # For more about our webhook events check out https://stripe.com/docs/webhooks.
  webhook_secret = ENV['STRIPE_WEBHOOK_SECRET']
  payload = request.body.read
  if !webhook_secret.empty?
    # Retrieve the event by verifying the signature using the raw body and
    # secret if webhook signing is configured.
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

  if event.type == 'checkout.session.completed'
    checkout_session = event.data.object
    # Note: If you need access to the line items, for instance to
    # automate fullfillment based on the the ID of the Price, you'll
    # need to refetch the Checkout Session here, and expand the line items:
    #
    # session_with_lines = Stripe::Checkout::Session.retrieve(
    #   checkout_session.id,
    #   expand: ['line_items']
    # )
    #
    # Read more about expand here: https://stripe.com/docs/expand
    puts '🔔  Payment succeeded!'
  end

  content_type 'application/json'
  { status: 'success' }.to_json
end
