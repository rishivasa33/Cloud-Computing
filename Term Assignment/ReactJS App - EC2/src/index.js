import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Encrypt from './components/Encrypt';
import Decrypt from './components/Decrypt';
import Logs from './components/Logs';
import LandingPage from './components/LandingPage';
import reportWebVitals from './reportWebVitals';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/encrypt",
    element: <Encrypt />,
  },
  {
    path: "/decrypt",
    element: <Decrypt />,
  },
  {
    path: "/logs",
    element: <Logs />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
