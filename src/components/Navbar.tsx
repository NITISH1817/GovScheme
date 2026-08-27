import React, { useState } from 'react';
import {
  Building2,
  Languages,
  Sun,
  Moon,
  Eye,
  Bell,
  User as UserIcon,
  Mic,
  LayoutDashboard,
  Monitor,
  Sparkles,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageCode, UserProfile } from '../types';
import { languages } from '../data/translations';

interface NavbarProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  textSize: 'normal' | 'large' | 'xlarge';
  setTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onStartVoiceCommand: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  textSize,
  setTextSize,
  user,
  onOpenAuth,
  onLogout,
  unreadCount,
  onOpenNotifications,
  onStartVoiceCommand
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const nextTextSize = textSize === 'normal' ? 'large' : textSize === 'large' ? 'xlarge' : 'normal';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 shadow-sm transition-colors border-b border-uswds-border">
      {/* Top Govt Bar (USAJOBS Style) */}
      <div className="bg-uswds-secondary text-white text-xs py-1.5 px-4 sm:px-8 flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center font-bold tracking-wide whitespace-nowrap">
            🇺🇸 {t('govtVerifiedTitle', 'An official website of the United States Government')}
          </span>
          <span className="hidden md:inline opacity-50">|</span>
          <span className="opacity-80 truncate max-w-[200px] sm:max-w-none">{t('tagline', 'National Scheme Eligibility Platform')}</span>
        </div>

        {/* Accessibility & Language Bar */}
        <div className="flex items-center space-x-3">
          {/* Text Size Control */}
          <button
            onClick={() => setTextSize(nextTextSize)}
            title={t('adjustFontSize', 'Adjust Font Size')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[10px] sm:text-xs transition whitespace-nowrap"
          >
            {t('font', 'Font')}: {textSize.toUpperCase()}
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setTheme(theme === 'high-contrast' ? 'light' : 'high-contrast')}
            title={t('toggleContrast', 'Toggle Contrast')}
            className={`px-2 py-0.5 rounded text-[10px] sm:text-xs transition flex items-center gap-1 whitespace-nowrap ${theme === 'high-contrast' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
          >
            <Eye className="w-3 h-3 hidden sm:block" /> {t('contrast', 'Contrast')}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Light/Dark Theme"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/20 hover:bg-black/30 text-white text-xs font-medium transition"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{languages.find(l => l.code === currentLang)?.nativeName || 'English'}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex justify-between items-center hover:bg-blue-50 dark:hover:bg-slate-700 ${currentLang === lang.code ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50' : 'text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">({lang.name})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8 py-3 flex flex-wrap xl:flex-nowrap items-center justify-between gap-4">
        {/* Brand Header */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-uswds-primary text-white flex items-center justify-center shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-uswds-primary dark:text-white font-sans">
                {t('appName', 'GovScheme AI')}
              </h1>
            </div>
            <p className="text-xs text-uswds-textMuted dark:text-slate-400 font-medium">
              {t('tagline', 'National Scheme Eligibility Platform')}
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center gap-2 flex-wrap justify-center">
          {[
            { id: 'home', label: t('navHome', 'Home') },
            { id: 'schemes', label: t('navSchemes', 'Schemes') },
            { id: 'assistant', label: t('navAssistant', 'AI Assistant'), isAI: true },
            { id: 'vault', label: t('navVault', 'Vault') },
            { id: 'tracker', label: t('navTracker', 'Tracker') },
            { id: 'profile', label: t('navProfile', 'Profile') },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                const protectedTabs = ['schemes', 'assistant', 'vault', 'profile', 'tracker'];
                if (protectedTabs.includes(item.id) && !user) {
                  onOpenAuth();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === item.id
                  ? 'bg-uswds-primary text-white shadow-sm'
                  : 'text-uswds-text hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
            >
              {item.isAI && <Sparkles className="w-4 h-4 text-uswds-saffron animate-pulse" />}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls & Hamburger */}
        <div className="flex items-center gap-2">
          {/* Voice Search Button */}
          <button
            onClick={onStartVoiceCommand}
            className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap"
            title={t('voiceSearchTitle', 'Voice Search Schemes (Speak to AI)')}
          >
            <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce hidden sm:block" />
            <span>{t('voice', 'Voice')}</span>
          </button>

          {/* Kiosk Mode Toggle */}
          <button
            onClick={() => setActiveTab('kiosk')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${activeTab === 'kiosk'
                ? 'bg-purple-700 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700'
              }`}
            title={t('kioskModeTitle', 'Switch to CSC Kiosk Mode')}
          >
            <Monitor className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 hidden sm:block" />
            <span>{t('navKiosk', 'Kiosk')}</span>
          </button>

          {/* Admin Mode Toggle */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${activeTab === 'admin'
                ? 'bg-indigo-700 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            title={t('adminPortalTitle', 'Open Government Admin Portal')}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 hidden sm:block" />
            <span>{t('navAdmin', 'Admin')}</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Auth Profile Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 transition"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=0369a1`}
                  alt="Profile Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-blue-400"
                />
                <span className="hidden md:inline text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user.fullName.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50">
                  <button
                    onClick={() => { setActiveTab('profile'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5" /> {t('navProfile', 'Profile')}
                  </button>
                  <button
                    onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> {t('logout', 'Logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[10px] sm:text-xs font-bold shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <UserIcon className="w-3.5 h-3.5 hidden sm:block" />
              <span>{t('loginOrGuest', 'Sign In / Register')}</span>
            </button>
          )}

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 absolute left-0 w-full shadow-lg px-4 py-3 flex flex-col gap-2">
          {[
            { id: 'home', label: t('navHome', 'Home') },
            { id: 'schemes', label: t('navSchemes', 'Schemes') },
            { id: 'assistant', label: t('navAssistant', 'AI Assistant') },
            { id: 'vault', label: t('navVault', 'Vault') },
            { id: 'tracker', label: t('navTracker', 'Tracker') },
            { id: 'profile', label: t('navProfile', 'Profile') },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                const protectedTabs = ['schemes', 'assistant', 'vault', 'profile', 'tracker'];
                if (protectedTabs.includes(item.id) && !user) {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                } else {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition text-left ${activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
