import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App'
import { MoralisProvider } from "react-moralis";

const APP_ID = process.env.REACT_APP_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

ReactDOM.render(
  <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
  < App isServerInfo />
  </MoralisProvider>,
  document.getElementById('root')
);