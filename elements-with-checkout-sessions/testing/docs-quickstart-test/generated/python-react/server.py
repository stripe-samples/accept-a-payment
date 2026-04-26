#! /usr/bin/env python3.6

"""
server.py
Stripe Sample.
Python 3.6 or newer required.
"""
import os
from dotenv import load_dotenv
load_dotenv()
from flask import Flask, jsonify, request

import stripe
# This test secret API key is a placeholder. Don't include personal details in requests with this key.
# To see your test secret API key embedded in code samples, sign in to your Stripe account.
# You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
client = stripe.StripeClient(
    # Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
    os.environ.get('STRIPE_SECRET_KEY'),
    stripe_version='2025-08-04',
)

app = Flask(__name__,
            static_url_path='',
            static_folder='public')

YOUR_DOMAIN = 'http://localhost:3001'

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        session = client.v1.checkout.sessions.create(params={
            'ui_mode': 'elements',
            'line_items': [
                {
                    # Provide the exact Price ID (for example, price_1234) of the product you want to sell
                    'price': os.environ.get('STRIPE_PRICE_ID'),
                    'quantity': 1,
                },
            ],
            'mode': 'payment',
            'return_url': YOUR_DOMAIN + '/complete?session_id={CHECKOUT_SESSION_ID}',
        })
    except Exception as e:
        return str(e)

    return jsonify(clientSecret=session.client_secret)

@app.route('/session-status', methods=['GET'])
def session_status():
  session = client.v1.checkout.sessions.retrieve(request.args.get('session_id'), params={'expand': ["payment_intent"]})

  return jsonify(status=session.status, payment_status=session.payment_status, payment_intent_id=session.payment_intent.id, payment_intent_status=session.payment_intent.status)

if __name__ == '__main__':
    app.run(port=4250)
