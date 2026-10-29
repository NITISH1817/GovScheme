import React, { useState } from 'react';
import { AdminPlatform } from './components/admin/AdminPlatform';
import { AdminLogin } from './components/admin/AdminLogin';
import { UserProfile, Scheme } from './types';
import { schemesData } from './data/schemes';

export const AdminApp: React.FC = () => {
  const [adminUser, setAdminUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('adminUser') || localStorage.getItem('govscheme_user');
      if (stored) {
        const u = JSON.parse(stored);
        const role = (u.role || '').toLowerCase();
        if (
          role.includes('admin') ||
          role === 'superadmin' ||
          role === 'super admin' ||
          role === 'state admin' ||
          role === 'ministry admin' ||
          role === 'district officer' ||
          role === 'nodal officer' ||
          u.email === 'admin@govscheme.in'
        ) {
          return u;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'high-contrast') || 'light';
  });

  const handleLogin = (user: UserProfile) => {
    setAdminUser(user);
    localStorage.setItem('adminUser', JSON.stringify(user));
    localStorage.setItem('govscheme_user', JSON.stringify(user));
    if (user.token) {
      localStorage.setItem('adminToken', user.token);
      localStorage.setItem('govscheme_token', user.token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    setAdminUser(null);
  };

  const handleReturnToCitizenPortal = () => {
    window.location.href = '/';
  };

  return (
    <div className="w-full h-screen bg-[#F5F7FA] dark:bg-[#060D18] text-[#07111F] dark:text-[#F8FAFC] font-sans">
      {adminUser ? (
        <AdminPlatform 
          user={adminUser} 
          schemes={schemesData} 
          onExit={handleReturnToCitizenPortal} 
          theme={theme}
          setTheme={setTheme}
        />
      ) : (
        <AdminLogin 
          onLoginSuccess={handleLogin} 
          onExit={handleReturnToCitizenPortal}
        />
      )}
    </div>
  );
};
