import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import Checkout from './components/Checkout';
import Success from './components/Success';
import Canceled from './components/Canceled';

import './css/normalize.css';
import './css/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/success.html" element={<Success />} />
        <Route path="/canceled.html" element={<Canceled />} />
        <Route path="/" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
