#! /usr/bin/env python3.8
import stripe
import json
import os

from flask import Flask, render_template, jsonify, request, send_from_directory
from dotenv import load_dotenv, find_dotenv

from stripe import PaymentIntent

load_dotenv(find_dotenv())
calcuateTax = False

# For sample support and debugging, not required for production:
stripe.set_app_info(
    'stripe-samples/accept-a-payment/payment-element',
    version='0.0.2',
    url='https://github.com/stripe-samples')

stripe.api_version = '2023-10-16'
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

static_dir = str(os.path.abspath(os.path.join(__file__ , "..", os.getenv("STATIC_DIR"))))
app = Flask(__name__, static_folder=static_dir, static_url_path="", template_folder=static_dir)

@app.route('/', methods=['GET'])
def get_root():
    return render_template('index.html')


@app.route('/config', methods=['GET'])
def get_config():
    return jsonify({'publishableKey': os.getenv('STRIPE_PUBLISHABLE_KEY')})

def calculate_tax(orderAmount: int, currency: str):
    tax_calculation = stripe.tax.Calculation.create(
        currency= currency,
        customer_details={
            "address": {
                "line1": "10709 Cleary Blvd",
                "city": "Plantation",
                "state": "FL",
                "postal_code": "33324",
                "country": "US",
            },
            "address_source": "shipping",
        },
        line_items=[
            {
                "amount": orderAmount,  # Amount in cents
                "reference": "ProductRef",
                "tax_behavior": "exclusive",
                "tax_code": "txcd_30011000"
            }
        ],
        shipping_cost={"amount": 300}
    )

    return tax_calculation

@app.route('/create-payment-intent', methods=['GET'])
def create_payment():
    # Create a PaymentIntent with the amount, currency, and a payment method type.
    #
    # See the documentation [0] for the full list of supported parameters.
    #
    # [0] https://stripe.com/docs/api/payment_intents/create
    try:
        orderAmount = 1400
        intent: PaymentIntent

        if calcuateTax:
            taxCalculation = calculate_tax(orderAmount, "usd")
            intent: PaymentIntent = stripe.PaymentIntent.create(
                amount=taxCalculation['amount_total'],
                currency='usd',
                automatic_payment_methods={
                    'enabled': True,
                },
                metadata={
                  'tax_calculation': taxCalculation['id']
                }
            )
        else:
            intent: PaymentIntent = stripe.PaymentIntent.create(
                amount=orderAmount,
                currency='usd',
                automatic_payment_methods={
                    'enabled': True,
                }
            )

        # Send PaymentIntent details to the front end.
        return jsonify({'clientSecret': intent.client_secret})
    except stripe.error.StripeError as e:
        return jsonify({'error': {'message': str(e)}}), 400
    except Exception as e:
        return jsonify({'error': {'message': str(e)}}), 400


@app.route('/webhook', methods=['POST'])
def webhook_received():
    # You can use webhooks to receive information about asynchronous payment events.
    # For more about our webhook events check out https://stripe.com/docs/webhooks.
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    request_data = json.loads(request.data)

    if webhook_secret:
        # Retrieve the event by verifying the signature using the raw body and secret if webhook signing is configured.
        signature = request.headers.get('stripe-signature')
        try:
            event = stripe.Webhook.construct_event(
                payload=request.data, sig_header=signature, secret=webhook_secret)
            data = event['data']
        except Exception as e:
            return e
        # Get the type of webhook event sent - used to check the status of PaymentIntents.
        event_type = event['type']
    else:
        data = request_data['data']
        event_type = request_data['type']
    data_object = data['object']

    if event_type == 'payment_intent.succeeded':
        print('💰 Payment received!')
        # Fulfill any orders, e-mail receipts, etc
        # To cancel the payment you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    elif event_type == 'payment_intent.payment_failed':
        print('❌ Payment failed.')
    return jsonify({'status': 'success'})


if __name__ == '__main__':
    app.run(port=4242, debug=True)
