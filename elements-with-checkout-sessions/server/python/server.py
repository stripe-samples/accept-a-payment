#! /usr/bin/env python3

"""
server.py
Stripe Sample.
Python 3.6 or newer required.
"""
import os
from flask import Flask, jsonify, request, send_from_directory
from dotenv import load_dotenv

load_dotenv()

import stripe

# For sample support and debugging, not required for production:
stripe.set_app_info(
    'stripe-samples/accept-a-payment/elements-with-checkout-sessions',
    version='0.0.2',
    url='https://github.com/stripe-samples')

client = stripe.StripeClient(
    os.environ.get('STRIPE_SECRET_KEY'),
)

static_dir = os.environ.get('STATIC_DIR', '../../client/html')
# Resolve relative paths based on this file's directory
if not os.path.isabs(static_dir):
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), static_dir)

app = Flask(__name__,
            static_url_path='',
            static_folder=static_dir)

server_port = int(os.environ.get('PORT', 4242))
YOUR_DOMAIN = os.environ.get('DOMAIN', f'http://localhost:{server_port}')

@app.route('/', methods=['GET'])
def get_root():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/config', methods=['GET'])
def get_config():
    return jsonify(publishableKey=os.environ.get('STRIPE_PUBLISHABLE_KEY'))

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        session = client.v1.checkout.sessions.create(params={
            'ui_mode': 'elements',
            # You can also use an existing Price: {'price': 'price_xxx', 'quantity': 1}
            'line_items': [
                {
                    'price_data': {
                        'product_data': {
                            'name': 'T-shirt',
                        },
                        'currency': 'usd',
                        'unit_amount': 2000,
                    },
                    'quantity': 1,
                },
            ],
            'mode': 'payment',
            'return_url': YOUR_DOMAIN + '/complete?session_id={CHECKOUT_SESSION_ID}',
            'adaptive_pricing': {'enabled': True},
            **(({'customer_email': os.environ['CUSTOMER_EMAIL']} if os.environ.get('CUSTOMER_EMAIL') else {})),
        })

        return jsonify(clientSecret=session.client_secret)
    except Exception as e:
        return jsonify(error={'message': str(e)}), 400

@app.route('/complete')
def complete():
    return send_from_directory(app.static_folder, 'complete.html')

@app.route('/session-status', methods=['GET'])
def session_status():
    try:
        session = client.v1.checkout.sessions.retrieve(request.args.get('session_id'), params={'expand': ["payment_intent"]})

        pi = session.payment_intent
        return jsonify(
            status=session.status,
            payment_status=session.payment_status,
            payment_intent_id=pi.id if pi else None,
            payment_intent_status=pi.status if pi else None
        )
    except Exception as e:
        return jsonify(error={'message': str(e)}), 400

@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.get_data()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')

    if webhook_secret:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception as e:
            print('Webhook signature verification failed.')
            return '', 400
    else:
        event = request.get_json()

    if event['type'] == 'checkout.session.completed':
        print('Payment received!')

    return '', 200

if __name__ == '__main__':
    app.run(port=server_port)
