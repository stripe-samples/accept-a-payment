import React from 'react';
// List of payment method types with links to each implementation.
const List = () => {
  const CARDS = 'Cards';
  const BANK_DEBITS = 'Bank debits';
  const BANK_REDIRECTS = 'Bank redirects';
  const BANK_TRANSFERS = 'Bank transfers';
  const BUY_NOW_PAY_LATER = 'Buy now pay later';
  const VOUCHERS = 'Vouchers';
  const WALLETS = 'Wallets';
  const categories = [
    CARDS,
    BANK_DEBITS,
    BANK_REDIRECTS,
    BANK_TRANSFERS,
    BUY_NOW_PAY_LATER,
    VOUCHERS,
    WALLETS,
  ];

  const paymentMethods = [
    {
      path: 'card',
      name: 'Card',
      docs: 'https://stripe.com/docs/payments/payment-intents',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#cards',
      category: CARDS,
    },
    {
      path: 'us-bank-account-debit',
      name: 'US bank account - ACH debits',
      docs: 'https://stripe.com/docs/ach',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#ach-debits',
      category: BANK_DEBITS,
    },
    {
      path: 'acss-debit',
      name: 'Pre-authorized debit in Canada (ACSS)',
      docs: 'https://stripe.com/docs/payments/acss-debit/accept-a-payment',
      fact_sheet: '',
      category: BANK_DEBITS,
    },
    {
      path: 'bacs-debit',
      name: 'Bacs Direct Debit',
      docs: 'https://stripe.com/docs/payments/payment-methods/bacs-debit',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#bacs-direct-debit',
      category: BANK_DEBITS,
    },
    {
      path: 'becs-debit',
      name: 'BECS Direct Debit',
      docs: 'https://stripe.com/docs/payments/au-becs-debit',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#becs-direct-debit',
      category: BANK_DEBITS,
    },
    {
      path: 'sepa-debit',
      name: 'SEPA Direct Debit',
      docs: 'https://stripe.com/docs/payments/sepa-debit',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#sepa-direct-debit',
      category: BANK_DEBITS,
    },
    {
      path: 'bancontact',
      name: 'Bancontact',
      docs: 'https://stripe.com/docs/payments/bancontact',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#bancontact',
      category: BANK_REDIRECTS,
    },
    {
      path: 'eps',
      name: 'EPS',
      docs: 'https://stripe.com/docs/payments/eps',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#eps',
      category: BANK_REDIRECTS,
    },
    {
      path: 'fpx',
      name: 'FPX',
      docs: 'https://stripe.com/docs/payments/fpx',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#FPX',
      category: BANK_REDIRECTS,
    },
    {
      path: 'giropay',
      name: 'giropay',
      docs: 'https://stripe.com/docs/payments/giropay',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#giropay',
      category: BANK_REDIRECTS,
    },
    {
      path: 'ideal',
      name: 'iDEAL',
      docs: 'https://stripe.com/docs/payments/ideal',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#ideal',
      category: BANK_REDIRECTS,
    },
    {
      path: 'p24',
      name: 'Przelewy24 (P24)',
      docs: 'https://stripe.com/docs/payments/p24',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#p24',
      category: BANK_REDIRECTS,
    },
    {
      path: 'sofort',
      name: 'Sofort',
      docs: 'https://stripe.com/docs/sources/sofort',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#sofort',
      category: BANK_REDIRECTS,
    },
    {
      path: 'ach-credit',
      name: 'ACH credit transfers',
      docs: 'https://stripe.com/docs/sources/ach-credit-transfer',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#ach-credit-transfers',
      category: BANK_TRANSFERS,
    },
    {
      path: 'multibanco',
      name: 'Multibanco',
      docs: 'https://stripe.com/docs/sources/multibanco',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#multibanco',
      category: BANK_TRANSFERS,
    },
    {
      path: 'afterpay-clearpay',
      name: 'Afterpay / Clearpay',
      docs: 'https://stripe.com/docs/payments/afterpay-clearpay',
      fact_sheet: '',
      category: BUY_NOW_PAY_LATER,
    },
    {
      path: 'klarna',
      name: 'Klarna',
      docs: 'https://stripe.com/docs/sources/klarna',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#klarna',
      category: BUY_NOW_PAY_LATER,
    },
    {
      path: 'boleto',
      name: 'Boleto',
      docs: 'https://stripe.com/docs/payments/boleto',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#boleto',
      category: VOUCHERS,
    },
    {
      path: 'oxxo',
      name: 'OXXO',
      docs: 'https://stripe.com/docs/payments/oxxo',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#oxxo',
      category: VOUCHERS,
    },
    {
      path: 'konbini',
      name: 'Konbini',
      docs: 'https://stripe.com/docs/payments/konbini',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide',
      category: VOUCHERS,
    },
    {
      path: 'alipay',
      name: 'Alipay',
      docs: 'https://stripe.com/docs/payments/alipay',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#alipay',
      category: WALLETS,
    },
    {
      path: 'apple-pay',
      name: 'Apple Pay',
      docs: 'https://stripe.com/docs/apple-pay',
      fact_sheet: 'https://stripe.com/payments/payment-methods-guide#apple-pay',
      category: WALLETS,
    },
    {
      path: 'google-pay',
      name: 'Google Pay',
      docs: 'https://stripe.com/docs/google-pay',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#google-pay',
      category: WALLETS,
    },
    {
      path: 'grabpay',
      name: 'GrabPay',
      docs: 'https://stripe.com/docs/payments/grabpay',
      fact_sheet: '',
      category: WALLETS,
    },
    {
      path: 'microsoft-pay',
      name: 'Microsoft Pay',
      docs: 'https://stripe.com/docs/microsoft-pay',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#secure-microsoft-pay',
      category: WALLETS,
    },
    {
      path: 'wechat-pay',
      name: 'WeChat Pay',
      docs: 'https://stripe.com/docs/sources/wechat-pay',
      fact_sheet:
        'https://stripe.com/payments/payment-methods-guide#wechat-pay',
      category: WALLETS,
    },
  ];

  return (
    <>
      <h1>Accept a payment</h1>

      {categories.map((category) => {
        return (
          <div key={category}>
            <h3>{category}</h3>
            <ul>
              {paymentMethods
                .filter(({category: c}) => c === category)
                .map(({name, path}) => {
                  return (
                    <li key={path}>
                      <a href={path}>{name}</a>
                    </li>
                  );
                })}
            </ul>
          </div>
        );
      })}
    </>
  );
};

export default List;
