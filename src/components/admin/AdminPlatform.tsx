import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, CheckSquare, BarChart3, Database, ShieldAlert,
  Users, Settings, Search, Bell, Sun, Moon, LogOut, Menu, X, Command,
  FileCheck2, HelpCircle, Layers, CheckCircle2, ChevronRight, Globe, Home, ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, Scheme } from '../../types';
import { GovSchemeLogo } from '../brand';

// Sub-views
import { CommandCenterOverview } from './CommandCenterOverview';
import { CommandPalette } from './CommandPalette';
import { SchemeOperationsView } from './SchemeOperationsView';
import { DataHealthCenter } from './DataHealthCenter';
import { EligibilityBuilder } from './EligibilityBuilder';
import { AdminAnalytics } from './AdminAnalytics';
import { CitizenManagementView } from './CitizenManagementView';
import { ApplicationManagementView } from './ApplicationManagementView';
import { DocumentVerificationView } from './DocumentVerificationView';
import { NotificationCenterView } from './NotificationCenterView';
import { ContentManagementView } from './ContentManagementView';
import { AuditLogsView } from './AuditLogsView';
import { SettingsView } from './SettingsView';
import { apiClient } from '../../api/apiClient';

interface AdminPlatformProps {
  user: UserProfile;
  schemes: Scheme[];
  onExit: () => void;
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
}

export type AdminView = 
  | 'overview' 
  | 'schemes' 
  | 'rule-builder' 
  | 'applications' 
  | 'users' 
  | 'document-verification' 
  | 'analytics' 
  | 'notifications' 
  | 'content' 
  | 'audit' 
  | 'settings';

export const AdminPlatform: React.FC<AdminPlatformProps> = ({ user, schemes, onExit, theme, setTheme }) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Top bar dropdowns
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await apiClient.get('/notifications');
        if (res && res.notifications) {
          setRecentNotifs(res.notifications.slice(0, 4));
          setUnreadCount(res.notifications.filter((n: any) => !n.read).length);
        }
      } catch (e) {
        // fallback
      }
    };
    fetchUnread();
  }, [activeView]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateDataQuality = () => {
    if (schemes.length === 0) return 100;
    const completenessScores = schemes.map(s => {
      let score = 100;
      if (!s.officialApplyUrl) score -= 10;
      if (!s.financialBenefitAmount) score -= 5;
      if (!s.category) score -= 15;
      if (!s.state) score -= 10;
      return score;
    });
    const avgScore = completenessScores.reduce((a, b) => a + b, 0) / schemes.length;
    return Number(avgScore.toFixed(1));
  };

  const pendingCount = schemes.filter(s => s.popularityScore === 0).length;

  const stats = {
    total: schemes.length,
    published: schemes.filter(s => s.popularityScore > 0).length,
    pending: pendingCount,
    dataQuality: calculateDataQuality(),
  };

  const navItems: { id: AdminView; icon: any; label: string; section: string; badge?: number }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard', section: 'COMMAND CENTER' },
    
    { id: 'schemes', icon: FileText, label: 'Scheme Management', section: 'SCHEME OPERATIONS' },
    { id: 'rule-builder', icon: CheckSquare, label: 'Eligibility Rules', section: 'SCHEME OPERATIONS' },
    
    { id: 'applications', icon: Layers, label: 'Applications', section: 'BENEFICIARY SERVICES' },
    { id: 'users', icon: Users, label: 'Citizens / Users', section: 'BENEFICIARY SERVICES' },
    { id: 'document-verification', icon: FileCheck2, label: 'Document Verification', section: 'BENEFICIARY SERVICES', badge: 3 },
    
    { id: 'analytics', icon: BarChart3, label: 'Analytics & Reports', section: 'DATA INTELLIGENCE' },
    { id: 'notifications', icon: Bell, label: 'Notifications', section: 'COMMUNICATIONS', badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'content', icon: Globe, label: 'Content Management', section: 'COMMUNICATIONS' },
    
    { id: 'audit', icon: ShieldAlert, label: 'Audit Logs', section: 'SYSTEM GOVERNANCE' },
    { id: 'settings', icon: Settings, label: 'Settings', section: 'SYSTEM GOVERNANCE' },
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

  const getBreadcrumbTitle = (view: AdminView) => {
    const item = navItems.find(n => n.id === view);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] dark:bg-[#060D18] text-[#07111F] dark:text-[#F8FAFC] font-sans overflow-hidden">
      
      {/* Professional Dark Navy Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 270 : 76 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="bg-[#0B1424] text-white border-r border-[#1B2A41] flex flex-col z-30 shrink-0 shadow-2xl relative select-none"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1B2A41] shrink-0">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
              >
                <GovSchemeLogo markSize={26} hideWordmarkOnMobile={false} />
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1.5 rounded-lg hover:bg-[#152338] text-[#94A3B8] hover:text-white transition-colors"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <Menu className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Item Tree */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar px-3 space-y-1">
          {navItems.map((item, idx) => {
            const isNewSection = idx === 0 || navItems[idx - 1].section !== item.section;
            const isActive = activeView === item.id;
            
            return (
              <React.Fragment key={item.id}>
                {isNewSection && sidebarOpen && (
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5 mt-5 px-3">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center'} py-2.5 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive 
                      ? 'bg-[#1769FF] text-white shadow-md shadow-blue-500/25 font-bold' 
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#152338]'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {item.badge !== undefined && sidebarOpen && (
                    <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-[#1769FF]' : 'bg-[#1769FF] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-[#1B2A41] shrink-0">
          <button 
            onClick={onExit} 
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center'} py-2.5 text-xs font-bold text-[#F87171] hover:bg-[#F87171]/10 rounded-lg transition-colors`}
            title="Secure Logout"
          >
            <LogOut className={`w-4 h-4 shrink-0 ${sidebarOpen ? 'mr-3' : ''}`} /> 
            {sidebarOpen && "Logout Session"}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[#FFFFFF] dark:bg-[#0B1424] border-b border-[#E2E8F0] dark:border-[#243449] flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
          
          {/* Breadcrumbs and Search */}
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
              <span>Portal</span>
              <span>/</span>
              <span className="text-[#07111F] dark:text-[#F8FAFC] font-bold">{getBreadcrumbTitle(activeView)}</span>
            </div>

            {/* Quick Command Trigger */}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-[#F5F7FA] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:border-[#1769FF] dark:hover:border-[#60A5FA] transition-colors w-full max-w-sm group"
            >
              <Search className="w-3.5 h-3.5 group-hover:text-[#1769FF] dark:group-hover:text-[#60A5FA]" />
              <span className="text-xs font-medium flex-1 text-left">Quick Search (Schemes, Users, Logs)...</span>
              <kbd className="text-[10px] font-bold bg-[#FFFFFF] dark:bg-[#0B1424] px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#243449]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Action Icons & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Return to Citizen Portal */}
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#243449] bg-white dark:bg-[#101D31] hover:bg-gray-100 dark:hover:bg-[#16253B] text-xs font-bold text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
              title="Return to Citizen Portal"
            >
              <Home className="w-3.5 h-3.5 text-[#1769FF]" />
              <span className="hidden md:inline">Citizen Portal</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] text-[#64748B] dark:text-[#94A3B8] transition-colors"
              title="Toggle Day/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] text-[#64748B] dark:text-[#94A3B8] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1769FF] rounded-full ring-2 ring-white dark:ring-[#0B1424]" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-2xl p-4 z-50 space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0] dark:border-[#243449]">
                      <span className="font-bold text-xs text-[#07111F] dark:text-[#F8FAFC]">Notifications</span>
                      <button 
                        onClick={() => { setActiveView('notifications'); setNotificationsOpen(false); }}
                        className="text-[11px] font-bold text-[#1769FF] dark:text-[#60A5FA] hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-2">
                      {recentNotifs.length === 0 ? (
                        <div className="text-center py-4 text-xs text-[#64748B]">No recent notifications.</div>
                      ) : (
                        recentNotifs.map((n: any) => (
                          <div 
                            key={n._id}
                            onClick={() => { setActiveView('notifications'); setNotificationsOpen(false); }}
                            className="p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#101D31] cursor-pointer text-left transition-colors"
                          >
                            <div className="text-xs font-bold text-[#07111F] dark:text-[#F8FAFC] truncate">{n.title}</div>
                            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-1">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-[#E2E8F0] dark:bg-[#243449] mx-1" />

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] transition-colors text-left"
              >
                <img 
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=1769FF`} 
                  alt="Admin Avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] dark:border-[#243449]" 
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-[#07111F] dark:text-[#F8FAFC] leading-none mb-0.5">{user.fullName}</div>
                  <div className="text-[9px] font-bold text-[#1769FF] dark:text-[#60A5FA] uppercase tracking-wider">{user.role || 'Admin'}</div>
                </div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-2xl p-2 z-50 text-xs font-semibold space-y-1"
                  >
                    <div className="p-2 border-b border-[#E2E8F0] dark:border-[#243449]">
                      <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">{user.fullName}</div>
                      <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">{user.email}</div>
                    </div>
                    <button 
                      onClick={() => { setActiveView('settings'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#101D31] text-[#07111F] dark:text-[#F8FAFC] transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" /> Portal Settings
                    </button>
                    <button 
                      onClick={() => { setActiveView('audit'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#101D31] text-[#07111F] dark:text-[#F8FAFC] transition-colors flex items-center gap-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Security Logs
                    </button>
                    <div className="border-t border-[#E2E8F0] dark:border-[#243449] pt-1" />
                    <button 
                      onClick={onExit}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#101D31] text-[#07111F] dark:text-[#F8FAFC] transition-colors flex items-center gap-2"
                    >
                      <Home className="w-3.5 h-3.5 text-[#1769FF]" /> Back to Citizen Website
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        localStorage.removeItem('govscheme_token');
                        localStorage.removeItem('govscheme_user');
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-[#B91C1C] hover:bg-[#B91C1C]/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Dynamic Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-[1600px] mx-auto h-full"
            >
              {activeView === 'overview' && (
                <CommandCenterOverview stats={stats} onNavigate={(view) => setActiveView(view as AdminView)} />
              )}
              {activeView === 'schemes' && (
                <SchemeOperationsView schemes={schemes} />
              )}
              {activeView === 'rule-builder' && (
                <EligibilityBuilder />
              )}
              {activeView === 'applications' && (
                <ApplicationManagementView />
              )}
              {activeView === 'users' && (
                <CitizenManagementView />
              )}
              {activeView === 'document-verification' && (
                <DocumentVerificationView />
              )}
              {activeView === 'analytics' && (
                <AdminAnalytics />
              )}
              {activeView === 'notifications' && (
                <NotificationCenterView />
              )}
              {activeView === 'content' && (
                <ContentManagementView />
              )}
              {activeView === 'audit' && (
                <AuditLogsView />
              )}
              {activeView === 'settings' && (
                <SettingsView user={user} theme={theme} setTheme={setTheme} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Command Palette Overlay (Ctrl/Cmd+K) */}
        <CommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={() => setIsCommandPaletteOpen(false)} 
          onNavigate={(view) => setActiveView(view as AdminView)}
        />
      </main>
    </div>
  );
};
