import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

// Index page with list of payment methods.
import List from './List';

// Payment method components.
import AcssDebit from './AcssDebit';
import AfterpayClearpay from './AfterpayClearpay';
import Alipay from './Alipay';
import ApplePay from './ApplePay';
import Bancontact from './Bancontact';
import BecsDebit from './BecsDebit';
import Boleto from './Boleto';
import Card from './Card';
import Eps from './Eps';
import Fpx from './Fpx';
import Giropay from './Giropay';
import GooglePay from './GooglePay';
import GrabPay from './GrabPay';
import Ideal from './Ideal';
import Klarna from './Klarna';
import Oxxo from './Oxxo';
import P24 from './P24';
import SepaDebit from './SepaDebit';
import Sofort from './Sofort';
import UsBankAccountDebit from './UsBankAccountDebit';
import WeChatPay from './WeChatPay';

import './App.css';
import Konbini from './Konbini';

function App(props) {
  return (
    <>
      <a href="/">home</a>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/alipay" element={<Alipay />} />
          <Route path="/acss-debit" element={<AcssDebit />} />
          <Route path="/us-bank-account-debit" element={<UsBankAccountDebit />} />
          <Route path="/apple-pay" element={<ApplePay />} />
          <Route path="/afterpay-clearpay" element={<AfterpayClearpay />} />
          <Route path="/bancontact" element={<Bancontact />} />
          <Route path="/becs-debit" element={<BecsDebit />} />
          <Route path="/boleto" element={<Boleto />} />
          <Route path="/card" element={<Card />} />
          <Route path="/eps" element={<Eps />} />
          <Route path="/fpx" element={<Fpx />} />
          <Route path="/giropay" element={<Giropay />} />
          <Route path="/grabpay" element={<GrabPay />} />
          <Route path="/google-pay" element={<GooglePay />} />
          <Route path="/ideal" element={<Ideal />} />
          <Route path="/klarna" element={<Klarna />} />
          <Route path="/oxxo" element={<Oxxo />} />
          <Route path="/p24" element={<P24 />} />
          <Route path="/sepa-debit" element={<SepaDebit />} />
          <Route path="/sofort" element={<Sofort />} />
          <Route path="/wechat-pay" element={<WeChatPay />} />
          <Route path="/konbini" element={<Konbini />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
