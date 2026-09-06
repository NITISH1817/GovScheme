import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronRight, LogOut, Search, Activity } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { GlobalSearch } from './components/GlobalSearch';
import { ToastProvider } from './components/Toast';
import { DashboardView } from './views/DashboardView';
import { SchemeManagementView } from './views/SchemeManagementView';
import { CitizenManagementView } from './views/CitizenManagementView';
import { ApplicationsView } from './views/ApplicationsView';
import { AnalyticsView } from './views/AnalyticsView';
import { OCRVerificationView } from './views/OCRVerificationView';
import { AILogsView } from './views/AILogsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { AuditLogsView } from './views/AuditLogsView';

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  schemes: 'Scheme Management',
  citizens: 'Citizen Management',
  applications: 'Applications',
  analytics: 'Analytics',
  ocr: 'OCR Verification',
  ai: 'AI Logs',
  notifications: 'Notifications',
  settings: 'Settings',
  audit: 'Audit Logs',
  reports: 'Reports',
};

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

// Lazily import the reports view to avoid TS errors if it doesn't exist yet
const ReportsView = React.lazy(() =>
  import('./views/ReportsView').catch(() => ({
    default: () => (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Reports module loading...
      </div>
    ),
  }))
);

export const AdminLayout: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [adminName, setAdminName] = useState('Super Admin');
  const [adminRole, setAdminRole] = useState('Administrator');
  const [searchOpen, setSearchOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'checking'>('checking');

  // Decode JWT
  useEffect(() => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.name) setAdminName(payload.name);
        if (payload.role) setAdminRole(payload.role);
      }
    } catch { /* ignore */ }
  }, []);

  // Ctrl+K global search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Ping server
  useEffect(() => {
    const check = async () => {
      try {
        await fetch('http://localhost:5000/api/auth/login', { method: 'OPTIONS' });
        setServerStatus('online');
      } catch {
        setServerStatus('checking');
      }
    };
    check();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':     return <DashboardView />;
      case 'schemes':       return <SchemeManagementView />;
      case 'citizens':      return <CitizenManagementView />;
      case 'applications':  return <ApplicationsView />;
      case 'analytics':     return <AnalyticsView />;
      case 'ocr':           return <OCRVerificationView />;
      case 'ai':            return <AILogsView />;
      case 'notifications': return <NotificationsView />;
      case 'settings':      return <SettingsView />;
      case 'audit':         return <AuditLogsView />;
      case 'reports':       return (
        <React.Suspense fallback={<div className="p-8 text-slate-400 text-sm">Loading reports...</div>}>
          <ReportsView />
        </React.Suspense>
      );
      default: return (
        <div className="flex items-center justify-center h-full text-slate-400">
          Module "{activeView}" is under construction.
        </div>
      );
    }
  };

  return (
    <ToastProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={onLogout}
          adminName={adminName}
          adminRole={adminRole}
        />

        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          {/* Top Header */}
          <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 shadow-sm z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-slate-500 min-w-0">
              <span className="text-sm text-slate-400 hidden sm:block">GovScheme</span>
              <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
              <span className="text-sm font-semibold text-slate-800 truncate">
                {VIEW_LABELS[activeView] || activeView}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Server status pill */}
              <div className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                serverStatus === 'online'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {serverStatus === 'online' ? 'API Online' : 'Connecting...'}
              </div>

              {/* Ctrl+K Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm rounded-lg transition-colors border border-slate-200"
              >
                <Search size={15} />
                <span>Search</span>
                <kbd className="text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 leading-none">⌘K</kbd>
              </button>

              {/* Mobile search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                <Search size={18} />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setActiveView('notifications')}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* Admin avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                  {adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{adminName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{adminRole}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* Main Content with page transitions */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-5 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <GlobalSearch
            onClose={() => setSearchOpen(false)}
            onNavigate={(view) => { setActiveView(view); setSearchOpen(false); }}
          />
        )}
      </AnimatePresence>
    </ToastProvider>
  );
};
