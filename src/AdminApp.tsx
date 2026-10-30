import React, { useState, useEffect } from 'react';
import { AdminPlatform } from './components/admin/AdminPlatform';
import { AdminLogin } from './components/admin/AdminLogin';
import { UserProfile, Scheme } from './types';
import { schemesData } from './data/schemes';
import { isAuthorizedAdminUser, verifyAdminSessionWithBackend } from './utils/adminAuth';

export const AdminApp: React.FC = () => {
  const [adminUser, setAdminUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('adminUser') || localStorage.getItem('govscheme_user');
      const token = localStorage.getItem('adminToken') || localStorage.getItem('govscheme_token');
      if (stored && token && !token.startsWith('mock-')) {
        const u = JSON.parse(stored);
        if (isAuthorizedAdminUser(u)) {
          return u;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  // Authoritative session verification against backend
  useEffect(() => {
    const token = localStorage.getItem('adminToken') || adminUser?.token;
    if (!token || token.startsWith('mock-')) {
      setAdminUser(null);
      setIsVerifying(false);
      return;
    }

    let isMounted = true;
    verifyAdminSessionWithBackend(token).then((res) => {
      if (!isMounted) return;
      setIsVerifying(false);
      if (res.valid && res.user) {
        setAdminUser(res.user);
        localStorage.setItem('adminUser', JSON.stringify(res.user));
      } else {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        setAdminUser(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);
  
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
      {isVerifying ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Verifying administrator session with backend...</p>
        </div>
      ) : adminUser ? (
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
