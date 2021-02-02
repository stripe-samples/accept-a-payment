import React from 'react';
import './App.css';
import { BrowserRouter as Switch, Route } from 'react-router-dom';

import List from './List';
import Bancontact from './BancontactForm';
import BecsDebit from './BecsDebitForm';
import Card from './CardForm';
import Ideal from './IdealForm';
import SepaDebit from './SepaDebitForm';
import Eps from './EpsForm';
import Fpx from './FpxForm';

function App(props) {
  return (
    <>
      <a href="/">home</a>
      <Switch>
        <Route exact path="/">
          <List />
        </Route>
        <Route path="/bancontact"><Bancontact /></Route>
        <Route path="/eps"><Eps /></Route>
        <Route path="/fpx"><Fpx /></Route>
        <Route path="/becs-debit"><BecsDebit /></Route>
        <Route path="/card"><Card /></Route>
        <Route path="/ideal"><Ideal /></Route>
        <Route path="/sepa-debit"><SepaDebit /></Route>
      </Switch>
    </>
  );
}

export default App;
