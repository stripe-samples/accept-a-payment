import React from 'react';
import './App.css';
import { BrowserRouter as Switch, Route } from 'react-router-dom';

import List from './List';
import CardForm from './CardForm';
import IdealForm from './IdealForm';
import BecsDebitForm from './BecsDebitForm';
import SEPADebitForm from './SEPADebitForm';

function App(props) {
  return (
    <Switch>
      <Route exact path="/">
        <List />
      </Route>
      <Route path="/card"><CardForm /></Route>
      <Route path="/ideal"><IdealForm /></Route>
      <Route path="/becs-debit"><BecsDebitForm /></Route>
      <Route path="/sepa-debit"><SEPADebitForm /></Route>
    </Switch>
  );
}

export default App;
