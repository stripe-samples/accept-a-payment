import React, {useState, useEffect} from 'react'
import {useLocation} from 'react-router-dom';
import {useStripe} from '@stripe/react-stripe-js';
import StatusMessages, {useMessages} from './StatusMessages';

const AfterpayClearpayForm = () => {
  const [messages, addMessage] = useMessages();
  const stripe = useStripe();

  // billing
  const [email, setEmail] = useState('jenny.rosen@example.com');
  const [name, setName] = useState('Jenny Rosen');
  const [line1, setLine1] = useState('123 Main St');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [postalCode, setPostalCode] = useState('94111');
  const [country, setCountry] = useState('AU');

  // shipping
  const [shippingName, setShippingName] = useState('Billy Rosen');
  const [shippingLine1, setShippingLine1] = useState('123 Main St');
  const [shippingLine2, setShippingLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('Reno');
  const [shippingState, setShippingState] = useState('NV');
  const [shippingPostalCode, setShippingPostalCode] = useState('89501');
  const [shippingCountry, setShippingCountry] = useState('US');


  const handleSubmit = async (e) => {
    e.preventDefault();

    // create payment intent on the server
    const {error: backendError, clientSecret} = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodType: 'afterpay_clearpay',
        currency: 'usd',
      }),
    })
      .then((r) => r.json())

    if(backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage('PaymentIntent created!')

    // confirm payment on the client
    const {error: stripeError} = await stripe.confirmAfterpayClearpayPayment(clientSecret, {
      payment_method: {
        billing_details: {
          name,
          email,
          address: {
            line1,
            line2,
            city,
            state,
            country,
            postal_code: postalCode,
          },
        },
      },
      shipping: {
        name: shippingName,
        address: {
          line1: shippingLine1,
          line2: shippingLine2,
          city: shippingCity,
          state: shippingState,
          country: shippingCountry,
          postal_code: shippingPostalCode,
        }
      },
      return_url: `${window.location.origin}/afterpay-clearpay?return=true`
    })

    if(stripeError) {
      addMessage(stripeError.message);
      return;
    }
  }

  return (
    <>
      <h1>Afterpay / Clearpay</h1>
      <form id="payment-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Billing</legend>

          <label htmlFor="name">
            Name
          </label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />

          <label htmlFor="email">
            Email
          </label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="line1">
            Line 1
          </label>
          <input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} required />

          <label htmlFor="line2">
            Line 2
          </label>
          <input id="line2" value={line2} onChange={(e) => setLine2(e.target.value)} />

          <label htmlFor="city">
            City
          </label>
          <input id="city" value={city} onChange={(e) => setCity(e.target.value)} />

          <label htmlFor="state">
            State
          </label>
          <input id="state" value={state} onChange={(e) => setState(e.target.value)} />

          <label htmlFor="postal_code">
            Postal code
          </label>
          <input id="postal_code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />

          <label htmlFor="country">
            Country
          </label>
          <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="AU">Australia</option>
            <option value="NZ">New Zealand</option>
            <option value="UK">United Kingdom</option>
            <option value="US">United States</option>
          </select>
        </fieldset>

        <fieldset>
          <legend>Shipping</legend>

          <label htmlFor="shipping_name">
            Name
          </label>
          <input id="shipping_name" value={shippingName} onChange={(e) => setShippingName(e.target.value)} required />

          <label htmlFor="shipping_line1">
            Line 1
          </label>
          <input id="shipping_line1" value={shippingLine1} onChange={(e) => setShippingLine1(e.target.value)} required />

          <label htmlFor="shipping_line2">
            Line 2
          </label>
          <input id="shipping_line2" value={shippingLine2} onChange={(e) => setShippingLine2(e.target.value)} />

          <label htmlFor="shipping_city">
            City
          </label>
          <input id="shipping_city" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} />

          <label htmlFor="shipping_state">
            State
          </label>
          <input id="shipping_state" value={shippingState} onChange={(e) => setShippingState(e.target.value)} />

          <label htmlFor="shipping_postal_code">
            Postal code
          </label>
          <input id="shipping_postal_code" value={shippingPostalCode} onChange={(e) => setShippingPostalCode(e.target.value)} />

          <label htmlFor="shipping_country">
            Country
          </label>
          <select id="shipping_country" value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value) }>
            <option value="AU">Australia</option>
            <option value="NZ">New Zealand</option>
            <option value="UK">United Kingdom</option>
            <option value="US">United States</option>
          </select>
        </fieldset>

        <button id="submit">Pay</button>
      </form>

      <StatusMessages messages={messages} />
    </>
  )
}

const AfterpayClearpayReturn = () => {
  const stripe = useStripe();
  const [messages, addMessage] = useMessages();

  const params = new URLSearchParams(useLocation().search);
  const clientSecret = params.get('payment_intent_client_secret');

  useEffect(() => {
    if(!stripe) {
      return;
    }
    const fetchPaymentIntent = async () => {
      const {error, paymentIntent} = await stripe.retrievePaymentIntent(clientSecret);
      if(error) {
        addMessage(error.message);
      }
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    }
    fetchPaymentIntent();
  }, [stripe, addMessage, clientSecret])

  return (
    <>
      <h1>Afterpay / Clearpay Return</h1>
      <StatusMessages messages={messages} />
    </>
  )

}

const AfterpayClearpay = () => {
  const query = new URLSearchParams(useLocation().search);
  if(query.get('return')) {
    return <AfterpayClearpayReturn />
  } else {
    return <AfterpayClearpayForm />;
  }
}

export default AfterpayClearpay
