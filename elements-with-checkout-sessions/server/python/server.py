#! /usr/bin/env python3.6

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

client = stripe.StripeClient(
    os.environ.get('STRIPE_SECRET_KEY'),
)

static_dir = os.environ.get('STATIC_DIR', '../../client/html/public')
# Resolve relative paths based on this file's directory
if not os.path.isabs(static_dir):
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), static_dir)

app = Flask(__name__,
            static_url_path='',
            static_folder=static_dir)

YOUR_DOMAIN = os.environ.get('DOMAIN', 'http://localhost:4242')

@app.route('/config', methods=['GET'])
def get_config():
    return jsonify(publishableKey=os.environ.get('STRIPE_PUBLISHABLE_KEY'))

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        session = client.v1.checkout.sessions.create(params={
            'ui_mode': 'elements',
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
        })
    except Exception as e:
        return str(e)

    return jsonify(clientSecret=session.client_secret)

@app.route('/complete')
def complete():
    return send_from_directory(app.static_folder, 'complete.html')

@app.route('/session-status', methods=['GET'])
def session_status():
  session = client.v1.checkout.sessions.retrieve(request.args.get('session_id'), params={'expand': ["payment_intent"]})

  return jsonify(status=session.status, payment_status=session.payment_status, payment_intent_id=session.payment_intent.id, payment_intent_status=session.payment_intent.status)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 4242))
    app.run(port=port)
