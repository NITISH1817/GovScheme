import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AdminApp } from './AdminApp';
import './index.css';
import './i18n';

const path = window.location.pathname;
const isAdminRoute = path.startsWith('/admin');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>
);
