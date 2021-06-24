import React from 'react';
import {BrowserRouter as Switch, Route} from 'react-router-dom';

// Index page with list of payment methods.
import List from './List';

// Payment method components.
import AfterpayClearpay from './AfterpayClearpay';
import Alipay from './Alipay';
import AcssDebit from './AcssDebit';
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
import Oxxo from './Oxxo';
import P24 from './P24';
import SepaDebit from './SepaDebit';
import Sofort from './Sofort';

import './App.css';

function App(props) {
  return (
    <>
      <a href="/">home</a>
      <Switch>
        <Route exact path="/">
          <List />
        </Route>
        <Route path="/alipay">
          <Alipay />
        </Route>
        <Route path="/acss-debit">
          <AcssDebit />
        </Route>
        <Route path="/apple-pay">
          <ApplePay />
        </Route>
        <Route path="/afterpay-clearpay">
          <AfterpayClearpay />
        </Route>
        <Route path="/bancontact">
          <Bancontact />
        </Route>
        <Route path="/becs-debit">
          <BecsDebit />
        </Route>
        <Route path="/boleto">
          <Boleto />
        </Route>
        <Route path="/card">
          <Card />
        </Route>
        <Route path="/eps">
          <Eps />
        </Route>
        <Route path="/fpx">
          <Fpx />
        </Route>
        <Route path="/giropay">
          <Giropay />
        </Route>
        <Route path="/grabpay">
          <GrabPay />
        </Route>
        <Route path="/google-pay">
          <GooglePay />
        </Route>
        <Route path="/ideal">
          <Ideal />
        </Route>
        <Route path="/oxxo">
          <Oxxo />
        </Route>
        <Route path="/p24">
          <P24 />
        </Route>
        <Route path="/sepa-debit">
          <SepaDebit />
        </Route>
        <Route path="/sofort">
          <Sofort />
        </Route>
      </Switch>
    </>
  );
}

export default App;
