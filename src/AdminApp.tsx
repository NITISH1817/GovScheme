import React, { useState, useEffect } from 'react';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';

export const AdminApp: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));

  useEffect(() => {
    // Check if token exists in local storage on mount
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
  };

  return (
    <div className="w-full h-screen bg-slate-50 text-slate-900 font-sans">
      {token ? (
        <AdminLayout onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
};
