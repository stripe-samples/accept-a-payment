import React from 'react';
import './App.css';
import { BrowserRouter as Switch, Route } from 'react-router-dom';

// Index page with list of payment methods.
import List from './List';

// Payment method components.
import Bancontact from './Bancontact';
import BecsDebit from './BecsDebit';
import Card from './Card';
import Eps from './Eps';
import Fpx from './Fpx';
import Ideal from './Ideal';
import SepaDebit from './SepaDebit';
import Giropay from './Giropay';
import Sofort from './Sofort';
import Oxxo from './Oxxo';

function App(props) {
  return (
    <>
      <a href="/">home</a>
      <Switch>
        <Route exact path="/">
          <List />
        </Route>
        <Route path="/bancontact"><Bancontact /></Route>
        <Route path="/becs-debit"><BecsDebit /></Route>
        <Route path="/card"><Card /></Route>
        <Route path="/eps"><Eps /></Route>
        <Route path="/fpx"><Fpx /></Route>
        <Route path="/ideal"><Ideal /></Route>
        <Route path="/sepa-debit"><SepaDebit /></Route>
        <Route path="/giropay"><Giropay /></Route>
        <Route path="/sofort"><Sofort /></Route>
        <Route path="/oxxo"><Oxxo /></Route>
      </Switch>
    </>
  );
}

export default App;
