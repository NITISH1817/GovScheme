import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AdminApp } from './AdminApp';
import './index.css';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '825595292671-xxxxxx.apps.googleusercontent.com';

const path = window.location.pathname;
const isAdminRoute = path.startsWith('/admin');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<div>Loading...</div>}>
      <GoogleOAuthProvider clientId={clientId}>
        {isAdminRoute ? <AdminApp /> : <App />}
      </GoogleOAuthProvider>
    </React.Suspense>
  </React.StrictMode>
);
