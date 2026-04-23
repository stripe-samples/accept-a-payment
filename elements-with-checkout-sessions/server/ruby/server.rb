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
set :public_folder, File.join(File.dirname(__FILE__), ENV.fetch('STATIC_DIR', '../../client/html'))
set :port, ENV.fetch('PORT', 4242).to_i
set :bind, '0.0.0.0'
set :host_authorization, permitted_hosts: []

YOUR_DOMAIN = ENV.fetch('DOMAIN', "http://localhost:#{ENV.fetch('PORT', 4242)}")

get '/' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'index.html')
end

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
      # You can also use an existing Price: { price: 'price_xxx', quantity: 1 }
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

    pi = session.payment_intent
    { status: session.status, payment_status: session.payment_status, payment_intent_id: pi&.id, payment_intent_status: pi&.status }.to_json
  rescue => e
    status 400
    { error: { message: e.message } }.to_json
  end
end

post '/webhook' do
  payload = request.body.read
  sig_header = request.env['HTTP_STRIPE_SIGNATURE']
  webhook_secret = ENV['STRIPE_WEBHOOK_SECRET']

  if webhook_secret
    begin
      event = Stripe::Webhook.construct_event(payload, sig_header, webhook_secret)
    rescue => e
      puts 'Webhook signature verification failed.'
      status 400
      return
    end
  else
    event = JSON.parse(payload)
  end

  if event['type'] == 'checkout.session.completed'
    puts 'Payment received!'
  end

  status 200
end
