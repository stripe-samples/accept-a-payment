import React, { useState } from "react";
import {
  PaymentElement,
  BillingAddressElement,
  CurrencySelectorElement,
  useCheckout
} from '@stripe/react-stripe-js/checkout';

const validateEmail = async (email, checkout) => {
  const updateResult = await checkout.updateEmail(email);
  const isValid = updateResult.type !== "error";

  return { isValid, message: !isValid ? updateResult.error.message : null };
}

const EmailInput = ({ checkout, email, setEmail, error, setError }) => {
  const handleBlur = async () => {
    if (!email) {
      return;
    }

    const { isValid, message } = await validateEmail(email, checkout);
    if (!isValid) {
      setError(message);
    }
  };

  const handleChange = (e) => {
    setError(null);
    setEmail(e.target.value);
  };

  return (
    <>
      <label>
        Email
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={error ? "error" : ""}
        />
      </label>
      {error && <div id="email-errors">{error}</div>}
    </>
  );
};

const CheckoutForm = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkoutState = useCheckout();

  if (checkoutState.type === 'loading') {
    return (
      <div>Loading...</div>
    );
  }

  if (checkoutState.type === 'error') {
    return (
      <div>Error: {checkoutState.error.message}</div>
    );
  }

  const emailAlreadySet = !!checkoutState.checkout.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {checkout} = checkoutState;
    setIsSubmitting(true);

    if (!emailAlreadySet) {
      const { isValid, message } = await validateEmail(email, checkout);
      if (!isValid) {
        setEmailError(message);
        setMessage(message);
        setIsSubmitting(false);
        return;
      }
    }

    const confirmResult = await checkout.confirm();

    if (confirmResult.type === 'error') {
      setMessage(confirmResult.error.message);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {emailAlreadySet ? (
        <>
          <label>Email</label>
          <div id="email-readonly">{checkoutState.checkout.email}</div>
        </>
      ) : (
        <EmailInput
          checkout={checkoutState.checkout}
          email={email}
          setEmail={setEmail}
          error={emailError}
          setError={setEmailError}
        />
      )}
      <h4>Billing address</h4>
      <BillingAddressElement id="address-element" />
      <h4>Payment</h4>
      <PaymentElement id="payment-element" />
      <CurrencySelectorElement id="currency-selector" />
      <button disabled={!checkoutState.checkout.canConfirm || isSubmitting} id="submit">
        {isSubmitting ? (
          <div className="spinner"></div>
        ) : (
          `Pay ${checkoutState.checkout.total.total.amount} now`
        )}
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

export default CheckoutForm;
