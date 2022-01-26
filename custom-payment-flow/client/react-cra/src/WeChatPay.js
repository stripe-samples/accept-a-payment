import React from 'react';
import StatusMessages, {useMessages} from './StatusMessages';
import {useStripe} from '@stripe/react-stripe-js';

const WeChatPay = () => {
  const [messages, addMessage] = useMessages();
  const stripe = useStripe();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!stripe) {
      return;
    }

    // Create the payment intent on the server
    const {
      error: backendError,
      clientSecret
    } = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodType: "wechat_pay",
        currency: "cny"
      }),
    }).then(r => r.json());

    if(backendError) {
      addMessage(backendError.message);
      return;
    }

    // Confirm the payment on the client
    const {
      error,
      paymentIntent
    } = await stripe.confirmWechatPayPayment(
      clientSecret, {
        payment_method_options: {
          wechat_pay: {
            client: 'web'
          },
        },
      }
    )

    if(error) {
      addMessage(error.message);
      return;
    }
    addMessage(`Payment: ${paymentIntent.id} ${paymentIntent.status}`);
  }

  return (
    <>
      <h1>WeChat Pay</h1>

      <form id="payment-form" onSubmit={handleSubmit}>
        <button>Pay</button>
      </form>

      <StatusMessages messages={messages} />
    </>
  )
}

export default WeChatPay;
