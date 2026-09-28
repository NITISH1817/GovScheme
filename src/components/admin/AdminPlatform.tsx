import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, CheckSquare, BarChart3, Database, ShieldAlert,
  Users, Settings, Search, Bell, Sun, Moon, LogOut, Menu, X, Command
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, Scheme } from '../../types';
import { CommandCenterOverview } from './CommandCenterOverview';
import { CommandPalette } from './CommandPalette';
import { SchemeOperationsView } from './SchemeOperationsView';
import { DataHealthCenter } from './DataHealthCenter';
import { EligibilityBuilder } from './EligibilityBuilder';
import { AdminAnalytics } from './AdminAnalytics';

interface AdminPlatformProps {
  user: UserProfile;
  schemes: Scheme[];
  onExit: () => void;
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
}

type AdminView = 'overview' | 'schemes' | 'rule-builder' | 'data-quality' | 'analytics' | 'users' | 'audit' | 'settings';

export const AdminPlatform: React.FC<AdminPlatformProps> = ({ user, schemes, onExit, theme, setTheme }) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const stats = {
    total: schemes.length,
    published: schemes.filter(s => s.popularityScore > 0).length,
    pending: 12,
    dataQuality: 98.4,
  };

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', section: 'COMMAND CENTER' },
    
    { id: 'schemes', icon: FileText, label: 'All Schemes', section: 'SCHEME OPERATIONS' },
    { id: 'rule-builder', icon: CheckSquare, label: 'Eligibility Rules', section: 'SCHEME OPERATIONS' },
    
    { id: 'data-quality', icon: Database, label: 'Data Health', section: 'DATA INTELLIGENCE' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', section: 'DATA INTELLIGENCE' },
    
    { id: 'users', icon: Users, label: 'Users', section: 'USER OPERATIONS' },
    
    { id: 'audit', icon: ShieldAlert, label: 'Audit Logs', section: 'SYSTEM' },
    { id: 'settings', icon: Settings, label: 'Settings', section: 'SYSTEM' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-[#F5F7FA] dark:bg-[#060D18] text-[#07111F] dark:text-[#F8FAFC] font-sans overflow-hidden">
      
      {/* Animated Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-[#FFFFFF] dark:bg-[#0B1424] border-r border-[#E2E8F0] dark:border-[#243449] flex flex-col z-20 shrink-0 shadow-lg relative"
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#E2E8F0] dark:border-[#243449] shrink-0">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
              >
                <div className="w-8 h-8 bg-[#1769FF] rounded flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">GOV<span className="text-[#1769FF]">SCHEME</span></span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] text-[#64748B] dark:text-[#94A3B8] transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar px-3 space-y-1">
          {navItems.map((item, idx) => {
            const isNewSection = idx === 0 || navItems[idx - 1].section !== item.section;
            const isActive = activeView === item.id;
            
            return (
              <React.Fragment key={item.id}>
                {isNewSection && sidebarOpen && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-2 mt-6 px-4"
                  >
                    {item.section}
                  </motion.div>
                )}
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute inset-0 bg-[#1769FF]/10 dark:bg-[#60A5FA]/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <button
                    onClick={() => setActiveView(item.id as AdminView)}
                    className={`relative z-10 w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center'} py-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive 
                        ? 'text-[#1769FF] dark:text-[#60A5FA]' 
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC]'
                    }`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <item.icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
                    {sidebarOpen && <span>{item.label}</span>}
                    {isActive && sidebarOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1769FF] dark:bg-[#60A5FA]" 
                      />
                    )}
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#243449] shrink-0">
          <button 
            onClick={onExit} 
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center'} py-3 text-sm font-bold text-[#B91C1C] dark:text-[#F87171] hover:bg-[#B91C1C]/10 dark:hover:bg-[#F87171]/10 rounded-lg transition-colors`}
          >
            <LogOut className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} /> 
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 bg-[#FFFFFF] dark:bg-[#0B1424] border-b border-[#E2E8F0] dark:border-[#243449] flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          <div className="flex-1 flex items-center">
            {/* Command Palette Trigger */}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-3 px-4 py-2.5 bg-[#F5F7FA] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:border-[#1769FF] dark:hover:border-[#60A5FA] transition-colors w-full max-w-md group"
            >
              <Search className="w-4 h-4 group-hover:text-[#1769FF] dark:group-hover:text-[#60A5FA] transition-colors" />
              <span className="text-sm font-medium flex-1 text-left">Search commands, schemes, records...</span>
              <div className="flex items-center gap-1 text-[10px] font-bold bg-[#FFFFFF] dark:bg-[#0B1424] px-2 py-1 rounded border border-[#E2E8F0] dark:border-[#243449]">
                <Command className="w-3 h-3" /> K
              </div>
            </button>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] text-[#64748B] dark:text-[#94A3B8] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className="relative p-2.5 rounded-full hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] text-[#64748B] dark:text-[#94A3B8] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#1769FF] dark:bg-[#60A5FA] rounded-full border-2 border-[#FFFFFF] dark:border-[#0B1424]" />
            </button>

            <div className="h-8 w-px bg-[#E2E8F0] dark:bg-[#243449] mx-1" />

            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-[#07111F] dark:text-[#F8FAFC] leading-none mb-1">{user.fullName}</div>
                <div className="text-[10px] font-bold text-[#1769FF] dark:text-[#60A5FA] uppercase tracking-wider">{user.role || 'Admin'}</div>
              </div>
              <img src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=1769FF`} alt="Admin" className="w-10 h-10 rounded-full object-cover border-2 border-[#E2E8F0] dark:border-[#243449]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-[1600px] mx-auto h-full"
            >
              {activeView === 'overview' && <CommandCenterOverview stats={stats} />}
              {activeView === 'schemes' && <SchemeOperationsView schemes={schemes} />}
              {activeView === 'data-quality' && <DataHealthCenter />}
              {activeView === 'rule-builder' && <EligibilityBuilder />}
              {activeView === 'analytics' && <AdminAnalytics />}
              
              {/* Placeholders for other views for now */}
              {['users', 'audit', 'settings'].includes(activeView) && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-[#F5F7FA] dark:bg-[#101D31] rounded-2xl flex items-center justify-center mb-6">
                    <Settings className="w-10 h-10 text-[#64748B] dark:text-[#94A3B8]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-2">{activeView.replace('-', ' ').toUpperCase()}</h2>
                  <p className="text-[#64748B] dark:text-[#94A3B8] max-w-md">
                    This module is currently being upgraded as part of the Phase {activeView === 'users' ? 'H' : activeView === 'audit' ? 'I' : 'J'} rollout.
                  </p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Command Palette Overlay */}
        <CommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={() => setIsCommandPaletteOpen(false)} 
          onNavigate={(view) => setActiveView(view as AdminView)}
        />
        
      </main>
    </div>
  );
};
