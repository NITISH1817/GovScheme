import React, { useState } from 'react';
import {
  Languages, Sun, Moon, Eye, Bell, User as UserIcon, Mic, Monitor, Sparkles, LogOut, ChevronDown, Menu, X, Settings2, Printer, Shield
} from 'lucide-react';
import { GovSchemeLogo } from './brand';
import { useTranslation } from 'react-i18next';
import { LanguageCode, UserProfile } from '../types';
import { languages } from '../data/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { isAuthorizedAdminUser, isAuthorizedAdminEmail } from '../utils/adminAuth';

interface NavbarProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  textSize: 'small' | 'normal' | 'large' | 'xlarge';
  setTextSize: (size: 'small' | 'normal' | 'large' | 'xlarge') => void;
  user: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register', reason?: string) => void;
  onLogout: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onStartVoiceCommand: () => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  onOpenSettings: () => void;
  onLiveDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang, onLanguageChange, activeTab, setActiveTab, theme, setTheme,
  textSize, setTextSize, reducedMotion, setReducedMotion,
  user, onOpenAuth, onLogout, unreadCount, onOpenNotifications, onStartVoiceCommand, onOpenSettings, onLiveDemo
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const customBezier = [0.32, 0.72, 0, 1];

  const isCurrentAdmin = isAuthorizedAdminUser(user) || isAuthorizedAdminEmail(user?.email);

  interface NavItem {
    id: string;
    label: string;
    isAI?: boolean;
    isKiosk?: boolean;
    isAdmin?: boolean;
  }

  const baseNavItems: NavItem[] = [
    { id: 'home', label: t('navHome', 'Home') },
    { id: 'schemes', label: t('navSchemes', 'Schemes') },
    { id: 'assistant', label: t('navAssistant', 'AI Assistant'), isAI: true },
    { id: 'vault', label: t('navVault', 'Vault') },
    { id: 'tracker', label: t('navTracker', 'Tracker') },
    { id: 'kiosk', label: t('navKiosk', 'CSC Kiosk'), isKiosk: true },
  ];

  // Admin Portal tab is strictly reserved for verified authorized administrator accounts
  const navItems: NavItem[] = isCurrentAdmin
    ? [...baseNavItems, { id: 'admin', label: t('navAdmin', 'Admin Portal'), isAdmin: true }]
    : baseNavItems;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full">
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 dark:bg-[#07111F]/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between w-full"
        >
          {/* Brand */}
          <div onClick={() => setActiveTab('home')} className="flex items-center cursor-pointer shrink-0 ml-2">
            <GovSchemeLogo markSize={32} hideWordmarkOnMobile={true} />
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  const protectedTabs = ['assistant', 'vault', 'tracker', 'kiosk'];
                  if (protectedTabs.includes(item.id) && !user) {
                    onOpenAuth('login', item.id === 'kiosk' ? 'kiosk' : undefined);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === item.id 
                    ? 'bg-[#1769FF]/10 text-[#1769FF] dark:text-[#60A5FA]' 
                    : (item as any).isKiosk
                    ? 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
                    : (item as any).isAdmin
                    ? 'text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.isAI && <Sparkles className="w-4 h-4 text-[#F59E0B]" />}
                {(item as any).isKiosk && <Monitor className="w-4 h-4 text-[#F59E0B]" />}
                {(item as any).isAdmin && <Shield className="w-4 h-4 text-amber-500" />}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Items */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                aria-label="Select Language"
              >
                <Languages className="w-3.5 h-3.5 text-gov-navy dark:text-white" />
              </button>
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-40 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-gov-border dark:border-white/10 rounded-[1.5rem] p-2 shadow-2xl"
                  >
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { onLanguageChange(lang.code); setLangDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl transition-colors ${currentLang === lang.code ? 'bg-[#1769FF] text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-white'}`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Display Settings / Accessibility */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                title={t('displaySettings', 'Display Settings')}
                aria-label={t('displaySettings', 'Display Settings')}
              >
                <Settings2 className="w-3.5 h-3.5 text-gov-navy dark:text-white" />
              </button>
              <AnimatePresence>
                {settingsDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border border-border rounded-[1.5rem] p-4 shadow-2xl z-50"
                  >
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('displaySettings', 'Display Settings')}</h3>
                    
                    {/* Theme */}
                    <div className="mb-4">
                      <span className="block text-xs font-semibold text-text-primary mb-2">{t('theme', 'Theme')}</span>
                      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button onClick={() => setTheme('light')} className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${theme === 'light' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-text-secondary hover:text-text-primary'}`}>{t('light', 'Light')}</button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-text-secondary hover:text-text-primary'}`}>{t('dark', 'Dark')}</button>
                      </div>
                    </div>

                    {/* Text Size */}
                    <div className="mb-4">
                      <span className="block text-xs font-semibold text-text-primary mb-2">{t('textSize', 'Text Size')}</span>
                      <div className="flex gap-1">
                        {['small', 'normal', 'large', 'xlarge'].map((size) => (
                          <button 
                            key={size}
                            onClick={() => setTextSize(size as 'small' | 'normal' | 'large' | 'xlarge')} 
                            className={`flex-1 py-1 text-xs font-bold rounded-md border transition-colors ${textSize === size ? 'bg-primary text-white border-primary' : 'bg-transparent text-text-secondary border-border hover:border-gray-400'}`}
                            title={size}
                          >
                            A
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accessibility Toggles */}
                    <div className="space-y-2 mb-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-semibold text-text-primary">{t('highContrast', 'High Contrast')}</span>
                        <input type="checkbox" className="sr-only peer" checked={theme === 'high-contrast'} onChange={(e) => setTheme(e.target.checked ? 'high-contrast' : 'light')} />
                        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-semibold text-text-primary">{t('reducedMotion', 'Reduced Motion')}</span>
                        <input type="checkbox" className="sr-only peer" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
                        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <button 
                      onClick={() => {
                        setTheme('light');
                        setTextSize('normal');
                        setReducedMotion(false);
                      }}
                      className="w-full py-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors border-t border-border mt-2 pt-3"
                    >
                      {t('resetSettings', 'Reset to Default')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Portal Quick Launch Button - ONLY displayed for verified authorized admin accounts */}
            {isCurrentAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-white shadow-amber-500/25 ring-2 ring-amber-400'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
                title={`Admin Command Center (Authorized: ${user?.email || 'admin@govscheme.in'})`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
                <span className="hidden sm:inline">Admin Portal</span>
                <span className="text-[10px] font-mono opacity-80 hidden lg:inline">({user?.email})</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>
            )}

            {/* Notifications */}
            <button
              onClick={() => { if (!user) onOpenAuth(); else onOpenNotifications(); }}
              className="relative w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              aria-label={t('notifications', 'Notifications')}
            >
              <Bell className="w-3.5 h-3.5 text-gov-navy dark:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border border-white dark:border-[#111827]" />
              )}
            </button>

            {/* User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 p-0.5 transition-transform">
                    <img src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=0369a1`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 hidden sm:block">{user.fullName.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                </button>
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-gov-border dark:border-white/10 rounded-2xl p-2 shadow-2xl"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 mb-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email || 'user@email.com'}</p>
                      </div>
                      
                      <button onClick={() => { setActiveTab('profile'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-text-primary">
                        <UserIcon className="w-4 h-4" /> {t('profile', 'Profile')}
                      </button>
                      <button onClick={() => { onOpenSettings(); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-text-primary">
                        <Settings2 className="w-4 h-4" /> {t('settings', 'Settings')}
                      </button>
                      <button onClick={() => { onOpenNotifications(); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-text-primary">
                        <Bell className="w-4 h-4" /> {t('notifications', 'Notifications')}
                      </button>
                      <button onClick={() => { setActiveTab('schemes'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-text-primary">
                        <Sparkles className="w-4 h-4" /> {t('savedSchemes', 'Saved Schemes')}
                      </button>
                      <button onClick={() => { setActiveTab('tracker'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-text-primary">
                        <Monitor className="w-4 h-4" /> {t('myApplications', 'My Applications')}
                      </button>
                      <button onClick={() => { setActiveTab('report'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 text-text-primary">
                        <Printer className="w-4 h-4 text-primary" /> {t('reports', 'Reports (AI Printer)')}
                      </button>
                      
                      {isCurrentAdmin && (
                        <button
                          onClick={() => { setActiveTab('admin'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold rounded-xl hover:bg-amber-500/10 flex items-center justify-between text-amber-600 dark:text-amber-400"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Admin Command Center</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            {user?.email}
                          </span>
                        </button>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <button onClick={() => { onLogout(); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold rounded-xl text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                          <LogOut className="w-4 h-4" /> {t('logout', 'Logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-gov-navy dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  {t('signIn', 'Sign In')}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 rounded-full bg-gov-navy dark:bg-white text-white dark:text-black text-xs font-bold hover:scale-105 transition-transform shadow-sm"
                >
                  {t('signUp', 'Sign Up')}
                </button>
              </div>
            )}

            {/* Mobile Header Sign In */}
            {!user && (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="md:hidden flex items-center gap-1 px-3 py-1 rounded-full bg-gov-navy dark:bg-white text-white dark:text-black text-xs font-bold hover:scale-105 transition-transform shadow-sm"
              >
                {t('signIn', 'Sign In')}
              </button>
            )}

            {/* Hamburger (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 relative flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              <div className="w-4 h-3 flex flex-col justify-between items-center relative">
                <motion.span animate={mobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} className="w-full h-[1.5px] bg-gov-navy dark:bg-white absolute top-0" />
                <motion.span animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-full h-[1.5px] bg-gov-navy dark:bg-white absolute top-1/2 -translate-y-1/2" />
                <motion.span animate={mobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} className="w-full h-[1.5px] bg-gov-navy dark:bg-white absolute bottom-0" />
              </div>
            </button>
          </div>
        </motion.div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            id="mobile-nav-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: customBezier }}
            className="fixed inset-0 z-40 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-start overflow-y-auto px-4 py-24"
          >
            <div className="flex flex-col gap-8 text-center">
              {navItems.map((item, idx) => (
                <div key={item.id} className="overflow-hidden">
                  <motion.button
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.6, ease: customBezier }}
                    onClick={() => {
                      const protectedTabs = ['assistant', 'vault', 'tracker', 'kiosk'];
                      if (protectedTabs.includes(item.id) && !user) {
                        onOpenAuth('login', item.id === 'kiosk' ? 'kiosk' : undefined);
                      } else {
                        setActiveTab(item.id);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="text-4xl font-extrabold text-gov-navy dark:text-white"
                  >
                    {item.label}
                  </motion.button>
                </div>
              ))}
              
              {/* Admin Portal in Mobile Menu - ONLY for verified authorized administrator accounts */}
              {isCurrentAdmin && (
                <div className="overflow-hidden">
                  <motion.button
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    onClick={() => {
                      setActiveTab('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="text-2xl font-extrabold flex flex-col items-center gap-1 justify-center text-amber-600 dark:text-amber-400"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-6 h-6" /> Admin Command Center
                    </div>
                    <span className="text-xs font-mono font-normal opacity-80">
                      Authorized: {user?.email}
                    </span>
                  </motion.button>
                </div>
              )}
              
              {/* Mobile Menu Auth Buttons */}
              {!user && (
                <div className="flex flex-col gap-3 w-full max-w-xs mx-auto px-2 mt-2">
                  <motion.button
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-3 rounded-full bg-gov-navy dark:bg-white text-white dark:text-black font-bold text-base shadow-lg"
                  >
                    {t('signIn', 'Sign In')}
                  </motion.button>
                  <motion.button
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="w-full py-3 rounded-full bg-transparent border-2 border-gov-navy dark:border-white text-gov-navy dark:text-white font-bold text-base"
                  >
                    {t('signUp', 'Sign Up')}
                  </motion.button>
                </div>
              )}

              <div className="overflow-hidden mt-2">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ delay: navItems.length * 0.1, duration: 0.6, ease: customBezier }}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { onLanguageChange(lang.code); setMobileMenuOpen(false); }}
                      className={`px-4 py-2 text-sm font-bold rounded-full ${currentLang === lang.code ? 'bg-[#1769FF] text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'}`}
                    >
                      {lang.nativeName}
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
