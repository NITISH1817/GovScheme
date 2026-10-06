import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User as UserIcon, Palette, Accessibility, Bell, 
  Shield, Lock, Database, Monitor, Globe, Moon, Sun, 
  CheckCircle2, Download, Trash2, Smartphone, X, Settings2
} from 'lucide-react';
import { UserProfile, LanguageCode } from '../types';
import { languages } from '../data/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationModal } from './GlobalUI';

interface SettingsViewProps {
  user: UserProfile;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  textSize: 'small' | 'normal' | 'large' | 'xlarge';
  setTextSize: (size: 'small' | 'normal' | 'large' | 'xlarge') => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'account' | 'appearance' | 'accessibility' | 'notifications' | 'privacy' | 'security' | 'data';

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  currentLang,
  onLanguageChange,
  theme,
  setTheme,
  textSize,
  setTextSize,
  reducedMotion,
  setReducedMotion,
  onUpdateProfile,
  onLogout,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: t('account', 'Account'), icon: UserIcon },
    { id: 'appearance', label: t('appearance', 'Appearance'), icon: Palette },
    { id: 'accessibility', label: t('accessibility', 'Accessibility'), icon: Accessibility },
    { id: 'notifications', label: t('notifications', 'Notifications'), icon: Bell },
    { id: 'privacy', label: t('privacy', 'Privacy'), icon: Shield },
    { id: 'security', label: t('security', 'Security'), icon: Lock },
    { id: 'data', label: t('data', 'Data'), icon: Database },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-4xl h-full bg-[#F8FAFC] dark:bg-[#07111F] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1B2D]">
          <h1 className="text-2xl font-bold text-[#123C69] dark:text-white flex items-center gap-2">
            <Settings2 className="w-6 h-6" /> {t('settings', 'Settings')}
          </h1>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto relative p-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3 font-semibold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold whitespace-nowrap transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#1769FF]' : ''}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded shadow-sm p-6 sm:p-8">
              
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                      {t('appearance', 'Appearance')}
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Language */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">{t('language', 'Language')}</label>
                        <div className="relative max-w-sm">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select 
                            value={currentLang}
                            onChange={(e) => {
                              onLanguageChange(e.target.value as LanguageCode);
                              showToast(t('preferenceSaved', 'Preference saved'));
                            }}
                            className="w-full pl-12 pr-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#1769FF] outline-none appearance-none"
                          >
                            {languages.map(lang => (
                              <option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Theme */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">{t('theme', 'Theme')}</label>
                        <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={() => { setTheme('light'); showToast(t('preferenceSaved', 'Preference saved')); }}
                            className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all w-32 ${theme === 'light' ? 'border-[#1769FF] bg-[#1769FF]/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          >
                            <Sun className={`w-8 h-8 mb-2 ${theme === 'light' ? 'text-[#1769FF]' : 'text-gray-500'}`} />
                            <span className="text-sm font-semibold">{t('light', 'Light')}</span>
                          </button>
                          
                          <button 
                            onClick={() => { setTheme('dark'); showToast(t('preferenceSaved', 'Preference saved')); }}
                            className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all w-32 ${theme === 'dark' ? 'border-[#1769FF] bg-[#1769FF]/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          >
                            <Moon className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-[#1769FF]' : 'text-gray-500'}`} />
                            <span className="text-sm font-semibold">{t('dark', 'Dark')}</span>
                          </button>

                          <button 
                            onClick={() => { setTheme('high-contrast'); showToast(t('preferenceSaved', 'Preference saved')); }}
                            className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all w-32 ${theme === 'high-contrast' ? 'border-[#1769FF] bg-[#1769FF]/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          >
                            <Monitor className={`w-8 h-8 mb-2 ${theme === 'high-contrast' ? 'text-[#1769FF]' : 'text-gray-500'}`} />
                            <span className="text-sm font-semibold text-center leading-tight">{t('highContrast', 'High Contrast')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Accessibility Settings */}
              {activeTab === 'accessibility' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                      {t('accessibility', 'Accessibility')}
                    </h2>
                    
                    <div className="space-y-8">
                      {/* Text Size */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">{t('textSize', 'Text Size')}</label>
                        <div className="flex bg-gray-100 dark:bg-[#16243A] rounded p-1 max-w-md">
                          {[
                            { id: 'small', label: 'A-', size: 'text-sm' },
                            { id: 'normal', label: 'A', size: 'text-base' },
                            { id: 'large', label: 'A+', size: 'text-lg' },
                            { id: 'xlarge', label: 'A++', size: 'text-xl' },
                          ].map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => { setTextSize(opt.id as any); showToast(t('preferenceSaved', 'Preference saved')); }}
                              className={`flex-1 py-2 font-bold rounded transition-all ${textSize === opt.id ? 'bg-white dark:bg-gray-700 shadow text-[#1769FF] dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'} ${opt.size}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{t('reducedMotion', 'Reduced Motion')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Minimize animations and transitions across the application.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" className="sr-only peer" checked={reducedMotion} onChange={(e) => { setReducedMotion(e.target.checked); showToast(t('preferenceSaved', 'Preference saved')); }} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#1769FF]"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                      {t('account', 'Account Preferences')}
                    </h2>
                    
                    <div className="space-y-6 max-w-lg">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Full Name</label>
                        <input type="text" readOnly value={user.fullName} className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white opacity-70 cursor-not-allowed" />
                        <p className="text-xs text-gray-500 mt-1">To change your name, please update your profile via Aadhaar KYC.</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Email Address</label>
                        <input type="email" readOnly value={user.email || ''} placeholder="Not provided" className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white opacity-70 cursor-not-allowed" />
                      </div>

                      <div className="pt-4">
                        <button onClick={() => showToast('Password reset link sent to your phone/email.')} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                      {t('security', 'Security')}
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Smartphone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">Active Session (This Device)</p>
                              <p className="text-sm text-gray-500">Windows • Chrome • Erode, India</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">Current</span>
                        </div>
                        
                        <button onClick={() => showToast('All other sessions terminated.')} className="text-sm font-bold text-red-500 hover:underline w-fit">
                          Sign out of all other sessions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Settings */}
              {activeTab === 'data' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                      {t('data', 'Data & Privacy')}
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download Personal Data
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get a copy of your profile, saved schemes, and applications.</p>
                        </div>
                        <button onClick={() => showToast('Data export started. You will receive an email shortly.')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-bold hover:bg-white dark:hover:bg-gray-800 transition-colors shrink-0">
                          Request Archive
                        </button>
                      </div>

                      <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
                        <div>
                          <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete Account
                          </h3>
                          <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">Permanently remove your GovScheme account and data.</p>
                        </div>
                        <button onClick={() => {
                          if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            onLogout();
                          }
                        }} className="px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition-colors shrink-0">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Setting placeholder */}
              {activeTab === 'notifications' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                      {t('notifications', 'Notifications')}
                    </h2>
                    <div className="space-y-6">
                      {['Recommendations', 'Scheme updates', 'Application updates', 'Document reminders', 'Deadline notifications', 'System notifications'].map(notif => (
                        <div key={notif} className="flex items-center justify-between">
                          <p className="font-bold text-gray-900 dark:text-white">{notif}</p>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" className="sr-only peer" defaultChecked onChange={() => showToast(t('preferenceSaved', 'Preference saved'))} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#1769FF]"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Privacy Setting placeholder */}
              {activeTab === 'privacy' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
                      {t('privacy', 'Privacy')}
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">Data usage information</p>
                          <p className="text-sm text-gray-500">Allow GovScheme to use your profile data to improve recommendations.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input type="checkbox" className="sr-only peer" defaultChecked onChange={() => showToast(t('preferenceSaved', 'Preference saved'))} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#1769FF]"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">Personalization controls</p>
                          <p className="text-sm text-gray-500">Receive personalized scheme alerts based on life events.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input type="checkbox" className="sr-only peer" defaultChecked onChange={() => showToast(t('preferenceSaved', 'Preference saved'))} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#1769FF]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
              )}

              {/* Data Setting */}
              {activeTab === 'data' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                      <Database className="w-5 h-5 text-[#1769FF]" /> {t('dataManagement', 'Data Management')}
                    </h2>
                    
                    <div className="bg-white dark:bg-[#16243A] border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{t('downloadData', 'Download My Data')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get a copy of all your saved profile information and bookmarks in JSON format.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
                          const dlAnchorElem = document.createElement('a');
                          dlAnchorElem.setAttribute("href", dataStr);
                          dlAnchorElem.setAttribute("download", "govscheme_profile.json");
                          dlAnchorElem.click();
                          showToast("Data downloaded successfully");
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold flex items-center gap-2 transition"
                      >
                        <Download className="w-4 h-4" /> {t('download', 'Download')}
                      </button>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-orange-800 dark:text-orange-400">{t('clearInformation', 'Clear Form Information')}</h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300/70 mt-1">Reset your profile data (age, income, location) without deleting your account.</p>
                      </div>
                      <button 
                        onClick={() => setShowResetModal(true)}
                        className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-lg font-semibold flex items-center gap-2 transition"
                      >
                        {t('reset', 'Reset')}
                      </button>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-red-700 dark:text-red-400">{t('deleteAccount', 'Delete Account')}</h3>
                        <p className="text-sm text-red-600 dark:text-red-300/70 mt-1">Permanently remove your account and all associated data from GovScheme.</p>
                      </div>
                      <button 
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg font-semibold flex items-center gap-2 transition"
                      >
                        <Trash2 className="w-4 h-4" /> {t('delete', 'Delete')}
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        </div>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={showResetModal}
        title={t('clearInformation', 'Clear Profile Information')}
        message="Are you sure you want to clear your profile details? Your account and saved schemes will remain, but you will need to re-enter your eligibility information."
        onConfirm={() => {
          onUpdateProfile({ ...user, age: 0, annualIncome: 0, state: '', district: '', interests: [], profileCompletionScore: 10 });
          setShowResetModal(false);
          showToast("Profile information cleared");
        }}
        onCancel={() => setShowResetModal(false)}
        confirmText="Clear Profile"
        destructive={true}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        title={t('deleteAccount', 'Delete Account')}
        message="This action cannot be undone. This will permanently delete your GovScheme account, settings, and all saved schemes."
        onConfirm={() => {
          setShowDeleteModal(false);
          onLogout();
        }}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Delete Permanently"
        destructive={true}
      />

    </div>
  );
};
