import React, { useState } from 'react';
import { AdminPlatform } from './components/admin/AdminPlatform';
import { AdminLogin } from './components/admin/AdminLogin';
import { UserProfile, Scheme } from './types';
import { schemesData } from './data/schemes';

export const AdminApp: React.FC = () => {
  const [adminUser, setAdminUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('adminUser');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');

  const handleLogin = (user: UserProfile) => {
    setAdminUser(user);
    localStorage.setItem('adminUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    setAdminUser(null);
  };

  return (
    <div className="w-full h-screen bg-[#F5F7FA] dark:bg-[#060D18] text-[#07111F] dark:text-[#F8FAFC] font-sans">
      {adminUser ? (
        <AdminPlatform 
          user={adminUser} 
          schemes={schemesData} 
          onExit={handleLogout} 
          theme={theme}
          setTheme={setTheme}
        />
      ) : (
        <AdminLogin 
          onLoginSuccess={handleLogin} 
          onExit={() => window.location.href = '/'}
        />
      )}
    </div>
  );
};
