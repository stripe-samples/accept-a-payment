import React from 'react';
import { withRouter } from 'react-router-dom';

// Simple list of payment method types with links to each implementation.
const List = () => {
  return (
    <>
      <h1>Accept a payment</h1>

      <h3>Cards</h3>
      <ul>
        <li>
          <a href="/card">Card</a>
        </li>
      </ul>

      <h3>Bank debits</h3>
      <ul>
        <li><a href="/ach-debit">ACH Direct Debit (TODO: Sources)</a></li>
        <li><a href="/bacs-debit">Bacs Direct Debit (TODO: Requires Checkout)</a></li>
        <li>
          <a href="/becs-debit">BECS Direct Debit</a>
        </li>
        <li>
          <a href="/sepa-debit">SEPA Direct Debit</a>
        </li>
      </ul>

      <h3>Bank redirects</h3>
      <ul>
        <li><a href="/bancontact">Bancontact</a></li>
        <li><a href="/eps">EPS</a></li>
        <li><a href="/fpx">FPX</a></li>
        <li><a href="/giropay">giropay</a></li>
        <li><a href="/ideal">iDEAL</a></li>
        <li><a href="/p24">Przelewy24 (P24)</a></li>
        <li><a href="/sofort">Sofort</a></li>
      </ul>

      <h3>Bank transfers</h3>
      <ul>
        <li><a href="/ach-credit">ACH Credit</a></li>
        <li><a href="/multibanco">Multibanco</a></li>
      </ul>

      <h3>Buy now pay later</h3>
      <ul>
        <li><a href="/klarna">Klarna</a></li>
      </ul>

      <h3>Vouchers</h3>
      <ul>
        <li><a href="/oxxo">OXXO</a></li>
      </ul>

      <h3>Wallets</h3>
      <ul>
        <li><a href="/alipay">Alipay</a></li>
        <li><a href="/apple-pay">Apple Pay</a></li>
        <li><a href="/google-pay">Google Pay</a></li>
        <li><a href="/grabpay">GrabPay</a></li>
        <li><a href="/microsoft-pay">Microsoft Pay</a></li>
        <li><a href="/wechat-pay">WeChat Pay</a></li>
      </ul>
    </>
  )
};

export default withRouter(List);
