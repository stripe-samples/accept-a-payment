require 'stripe'
require 'sinatra'
require 'dotenv/load'

# For sample support and debugging, not required for production:
Stripe.set_app_info(
  'stripe-samples/accept-a-payment/elements-with-checkout-sessions',
  version: '0.0.2',
  url: 'https://github.com/stripe-samples'
)

client = Stripe::StripeClient.new(ENV['STRIPE_SECRET_KEY'])

set :static, true
set :public_folder, File.join(File.dirname(__FILE__), ENV.fetch('STATIC_DIR', '../../client/html/public'))
set :port, (ENV['PORT'] || 4242).to_i

YOUR_DOMAIN = ENV.fetch('DOMAIN', 'http://localhost:4242')

get '/complete' do
  send_file File.join(settings.public_folder, 'complete.html')
end

get '/config' do
  content_type 'application/json'
  { publishableKey: ENV['STRIPE_PUBLISHABLE_KEY'] }.to_json
end

post '/create-checkout-session' do
  content_type 'application/json'

  begin
    session = client.v1.checkout.sessions.create({

      ui_mode: 'elements',
      line_items: [{
        price_data: {
          product_data: {
            name: 'T-shirt',
          },
          currency: 'usd',
          unit_amount: 2000,
        },
        quantity: 1,
      }],
      mode: 'payment',
      return_url: YOUR_DOMAIN + '/complete?session_id={CHECKOUT_SESSION_ID}',
    })

    { clientSecret: session.client_secret }.to_json
  rescue => e
    status 400
    { error: { message: e.message } }.to_json
  end
end

get '/session-status' do
  content_type 'application/json'

  begin
    session = client.v1.checkout.sessions.retrieve(params[:session_id], {expand: ["payment_intent"]})

    { status: session.status, payment_status: session.payment_status, payment_intent_id: session.payment_intent.id, payment_intent_status: session.payment_intent.status }.to_json
  rescue => e
    status 400
    { error: { message: e.message } }.to_json
  end
end
