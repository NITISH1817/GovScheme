import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AdminApp } from './AdminApp';
import './index.css';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ErrorBoundary } from './components/ErrorBoundary';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '825595292671-xxxxxx.apps.googleusercontent.com';

const path = window.location.pathname;
const isAdminRoute = path.startsWith('/admin');

const FullScreenLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', color: '#123C69' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #123C69', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Loading GovScheme...</h2>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={<FullScreenLoader />}>
        <GoogleOAuthProvider clientId={clientId}>
          {isAdminRoute ? <AdminApp /> : <App />}
        </GoogleOAuthProvider>
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
