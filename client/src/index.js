import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
const root = ReactDOM.createRoot(document.getElementById('root'));

require('react-dom');
window.React2 = require('react');
console.log(window.React1 === window.React2);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);