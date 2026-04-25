require 'dotenv'
Dotenv.load
require 'stripe'
require 'sinatra'

# This test secret API key is a placeholder. Don't include personal details in requests with this key.
# To see your test secret API key embedded in code samples, sign in to your Stripe account.
# You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
# Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
client = Stripe::StripeClient.new(ENV['STRIPE_SECRET_KEY'], stripe_version: '2025-08-04')

set :static, true
set :port, 4251

YOUR_DOMAIN = 'http://localhost:3002'

post '/create-checkout-session' do
  content_type 'application/json'

  session = client.v1.checkout.sessions.create({

    ui_mode: 'elements',
    line_items: [{
      # Provide the exact Price ID (for example, price_1234) of the product you want to sell
      price: ENV['STRIPE_PRICE_ID'],
      quantity: 1,
    }],
    mode: 'payment',
    return_url: YOUR_DOMAIN + '/complete?session_id={CHECKOUT_SESSION_ID}',
  })

  { clientSecret: session.client_secret }.to_json
end

get '/session-status' do
  session = client.v1.checkout.sessions.retrieve(params[:session_id], {expand: ["payment_intent"]})

  { status: session.status, payment_status: session.payment_status, payment_intent_id: session.payment_intent.id, payment_intent_status: session.payment_intent.status }.to_json
end
