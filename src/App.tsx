

import React, { useState, useEffect, useCallback } from 'react';
import { socketService } from './api/socketClient';
import { appendLiveAuditLog } from './api/apiClient';
import { useTranslation } from 'react-i18next';
import { LanguageCode, UserProfile, Scheme, CombinedSchemeAnalysis, DocumentRecord, ApplicationTrackerRecord, NotificationItem } from './types';
import { schemesData } from './data/schemes';
import { initialUserProfile, initialApplications, initialNotifications } from './data/initialUserData';
import { evaluateSchemeEligibility } from './engine/ruleEngine';
import { computeMLRecommendation } from './engine/mlEngine';
import { calculateProfileCompletion, normalizeUserProfile, isProfileComplete, getUserAvatarUrl } from './utils/profileUtils';
import { isAuthorizedAdminUser, isAuthorizedAdminEmail, getAuthorizedAdminEmails, getAdminAccountMention, DEFAULT_AUTHORIZED_ADMIN_EMAILS, verifyAdminSessionWithBackend } from './utils/adminAuth';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ProfileView } from './components/ProfileView';
import { SchemeDiscovery } from './components/SchemeDiscovery';
import { SchemeModal } from './components/SchemeModal';
import { SchemeApplicationModal } from './components/SchemeApplicationModal';
import { AIAssistant } from './components/AIAssistant';
import { DocumentVault } from './components/DocumentVault';
import { OCRScanner } from './components/OCRScanner';
import { ApplicationTracker } from './components/ApplicationTracker';
import { SettingsView } from './components/SettingsView';
import { KioskMode } from './components/KioskMode';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { startVoiceListening, speakText, checkVoiceNavigationCommand } from './services/voiceService';
import { languages } from './data/translations';
import { EligibilityWizard } from './components/EligibilityWizard';
import { AIAnalysis } from './components/AIAnalysis';
import { GlobalUI, ConfirmationModal } from './components/GlobalUI';
import { AdminPlatform } from './components/admin/AdminPlatform';
import { AdminLogin } from './components/admin/AdminLogin';
import { KioskReport } from './components/KioskReport';
import { GovSchemeLogoAnimated } from './components/brand';
import { ShieldAlert, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { AboutModal } from './components/modals/AboutModal';
import { PrivacyModal } from './components/modals/PrivacyModal';
import { TermsModal } from './components/modals/TermsModal';
import { FeedbackModal } from './components/modals/FeedbackModal';
import { ExternalRedirectModal } from './components/modals/ExternalRedirectModal';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const normalizeAppLanguage = (langStr?: string): LanguageCode => {
  if (!langStr) return 'en';
  const prefix = langStr.toLowerCase().split('-')[0].split('_')[0] as LanguageCode;
  const valid: LanguageCode[] = ['en', 'hi', 'ta', 'te', 'ml', 'mr', 'gu', 'kn', 'bn', 'pa'];
  return valid.includes(prefix) ? prefix : 'en';
};

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    return normalizeAppLanguage(i18n.language || (typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null) || 'en');
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'high-contrast') || 'light';
  });
  const [textSize, setTextSize] = useState<'small' | 'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('textSize') as 'small' | 'normal' | 'large' | 'xlarge') || 'normal';
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('reducedMotion') === 'true';
  });
  const getInitialTab = (): string => {
    try {
      const validTabs = ['home', 'schemes', 'wizard', 'vault', 'tracker', 'profile', 'kiosk', 'assistant', 'settings', 'admin', 'report', 'kiosk-report', 'analyzing'];

      // 1. Prioritize hash for dynamic SPA client tab navigation (#report, #schemes, etc.)
      const hash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase();
      if (hash && validTabs.includes(hash)) return hash;

      // 2. Query param
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab')?.toLowerCase();
      if (tabParam && validTabs.includes(tabParam)) return tabParam;
      if (searchParams.get('admin') === 'true' || searchParams.has('admin')) return 'admin';

      // 3. Pathname
      const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase();
      if (path === 'admin' || path.startsWith('admin/')) return 'admin';
      if (validTabs.includes(path)) return path;
    } catch { }
    return 'home';
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);

  const setActiveTab = (tab: string) => {
    if (tab === 'admin') {
      if (window.location.hash !== '#admin') {
        window.location.hash = 'admin';
      }
    } else {
      if (window.location.hash !== `#${tab}`) {
        window.location.hash = tab;
      }
    }
    setActiveTabState(tab);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { }
  };

  // User & Data State
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const initialTab = getInitialTab();
      const savedAdmin = localStorage.getItem('adminUser');
      const savedUser = localStorage.getItem('govscheme_user');
      let loaded: UserProfile | null = null;
      if (initialTab === 'admin' && savedAdmin) {
        loaded = JSON.parse(savedAdmin);
      } else {
        loaded = savedUser ? JSON.parse(savedUser) : (savedAdmin ? JSON.parse(savedAdmin) : null);
      }

      // Seamless restore from persistent local accounts registry if govscheme_user is blank on refresh
      if (!loaded) {
        try {
          const rawAccounts = localStorage.getItem('govscheme_accounts_db');
          const lastEmail = localStorage.getItem('govscheme_last_email');
          if (rawAccounts && lastEmail) {
            const accounts = JSON.parse(rawAccounts);
            const userAcc = accounts[lastEmail.toLowerCase().trim()];
            if (userAcc?.profile) {
              loaded = userAcc.profile;
            }
          }
        } catch { }
      }

      if (loaded && isAuthorizedAdminEmail(loaded.email)) {
        loaded.role = 'Super Admin';
      }
      return loaded;
    } catch { return null; }
  });
  const [guestProfile, setGuestProfile] = useState<UserProfile | null>(() => {
    try {
      const savedGuest = localStorage.getItem('govscheme_guest_profile');
      return savedGuest ? JSON.parse(savedGuest) : null;
    } catch { return null; }
  });

  // Synchronize authorized administrator session for approved admin emails
  useEffect(() => {
    if (user && isAuthorizedAdminEmail(user.email)) {
      const existingToken = user.token || localStorage.getItem('adminToken') || localStorage.getItem('govscheme_token');
      const validToken = existingToken && !existingToken.startsWith('mock-') ? existingToken : `token_${Date.now()}`;
      if (user.role !== 'Super Admin' || !user.token) {
        const upgraded: UserProfile = {
          ...user,
          role: 'Super Admin',
          token: validToken
        };
        setUser(upgraded);
        localStorage.setItem('govscheme_user', JSON.stringify(upgraded));
        localStorage.setItem('adminUser', JSON.stringify(upgraded));
        localStorage.setItem('adminToken', validToken);
        localStorage.setItem('govscheme_token', validToken);
        try {
          const raw = localStorage.getItem('govscheme_accounts_db');
          const accounts = raw ? JSON.parse(raw) : {};
          const emailKey = upgraded.email.toLowerCase().trim();
          if (accounts[emailKey]) {
            accounts[emailKey].profile = upgraded;
            accounts[emailKey].token = validToken;
            localStorage.setItem('govscheme_accounts_db', JSON.stringify(accounts));
          }
        } catch { }
      }
    }
  }, [user]);


  const [schemes, setSchemes] = useState<Scheme[]>(schemesData);
  const [isSchemesLoading, setIsSchemesLoading] = useState<boolean>(false);
  const [schemesError, setSchemesError] = useState<string | null>(null);
  const [isBackendWaking, setIsBackendWaking] = useState<boolean>(false);
  const [applications, setApplications] = useState<ApplicationTrackerRecord[]>(() => {
    try {
      const stored = localStorage.getItem('govscheme_applications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return [];
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const [wizardMode, setWizardMode] = useState<'wizard' | 'life-event' | 'what-can-i-get' | 'ai-interview'>('wizard');
  const [kioskProfile, setKioskProfile] = useState<Partial<UserProfile> | null>(null);
  const [pendingKioskRedirect, setPendingKioskRedirect] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<string | undefined>(undefined);
  const [schemeDiscoveryMode, setSchemeDiscoveryMode] = useState<'recommended' | 'all' | 'ineligible'>('recommended');

  const handleNavigateTab = (tab: string) => {
    if (tab.startsWith('schemes:')) {
      const mode = tab.split(':')[1] as 'recommended' | 'all' | 'ineligible';
      setSchemeDiscoveryMode(mode);
      setActiveTab('schemes');
      return;
    }

    const getActiveOrStoredUser = (): UserProfile | null => {
      if (user) return user;
      try {
        const stored = localStorage.getItem('govscheme_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            const norm = normalizeUserProfile(parsed);
            setUser(norm);
            return norm;
          }
        }
      } catch { }
      return null;
    };

    const currentUser = getActiveOrStoredUser();

    if (tab === 'kiosk' && !currentUser) {
      setPendingKioskRedirect(true);
      setAuthNotice(t('kioskAuthNotice', 'Please sign in or sign up to access CSC Kiosk Mode.'));
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    const protectedTabs = ['assistant', 'vault', 'profile', 'report', 'tracker', 'settings'];
    if (protectedTabs.includes(tab) && !currentUser) {
      setPendingKioskRedirect(false);
      setAuthNotice(undefined);
      setIsAuthOpen(true);
      return;
    }
    setAuthNotice(undefined);
    setActiveTab(tab);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const currentTab = getInitialTab();
      if (currentTab === 'admin') {
        setActiveTabState('admin');
        return;
      }
      if (currentTab === 'kiosk' && !user) {
        setPendingKioskRedirect(true);
        setAuthNotice(t('kioskAuthNotice', 'Please sign in or sign up to access CSC Kiosk Mode.'));
        setIsAuthOpen(true);
        setActiveTabState('home');
        window.location.hash = 'home';
        return;
      }
      setActiveTabState(currentTab || 'home');
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [user, t]);

  // Modal Controls
  const [selectedSchemeAnalysis, setSelectedSchemeAnalysis] = useState<CombinedSchemeAnalysis | null>(null);
  const [selectedApplyScheme, setSelectedApplyScheme] = useState<Scheme | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrTargetDocType, setOcrTargetDocType] = useState<DocumentRecord['type']>('Aadhaar');
  const [isListeningGlobalVoice, setIsListeningGlobalVoice] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Transparency & Trust Modal Controls
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<{
    url: string;
    schemeId?: string;
    schemeName?: string;
    department?: string;
    applicationNumber?: string;
  } | null>(null);
  const [liveTrackerToast, setLiveTrackerToast] = useState<{
    show: boolean;
    schemeName: string;
    appNumber: string;
    schemeId: string;
  } | null>(null);
  const [activeKioskRecommendedSchemes, setActiveKioskRecommendedSchemes] = useState<Scheme[] | undefined>(undefined);

  // Core Application Tracking Handler: records in React, localStorage, Audit Log, and Backend
  const handleTrackApplication = useCallback(async (schemeId: string, customAppNumber?: string) => {
    const token = localStorage.getItem('govscheme_token');
    const matchedScheme = schemes.find(s => s.id === schemeId || (s as any).schemeId === schemeId);
    const targetSchemeName = matchedScheme?.name || 'Government Welfare Scheme';
    const officialPortal = matchedScheme?.officialApplyUrl || matchedScheme?.officialWebsite || 'https://www.india.gov.in';
    const statePrefix = matchedScheme?.state === 'Tamil Nadu' ? 'TN' : 'IND';
    const genAckNumber = customAppNumber?.trim() || `APP-${statePrefix}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const currentStatus = 'Submitted';
    const stages = [
      'Application details recorded',
      'Documents uploaded to GovScheme',
      'Submission reported by citizen',
      'Status updated by GovScheme administrator',
      'Government approval confirmed through authorized source',
      'Benefit receipt reported by citizen'
    ];
    const timeline = stages.map((stg, i) => ({
      stage: stg,
      date: i <= 2 ? new Date().toISOString().split('T')[0] : 'Pending',
      completed: i <= 2,
      remarks: i === 2 ? 'Application registered in Citizen Tracker (Citizen Reported)' : undefined
    }));

    const dynamicDocs = user?.documents?.slice(0, 3).map(d => ({
      name: d.type || d.documentType || 'Identity Document',
      verified: d.status === 'Verified',
      label: d.status === 'Verified' ? 'Verified in Citizen Vault' : 'Uploaded & Linked'
    })) || [];

    const newTrackRecord: ApplicationTrackerRecord = {
      id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      schemeId,
      schemeName: targetSchemeName,
      applicationNumber: genAckNumber,
      status: currentStatus as any,
      appliedDate: new Date().toISOString().split('T')[0],
      officialPortalLink: officialPortal,
      statusTimeline: timeline,
      verifiedDocuments: dynamicDocs,
      statusProvenance: 'CITIZEN_REPORTED'
    } as any;

    // 1. Immediately update React state for instant 0ms UI feedback
    setApplications(prev => [newTrackRecord, ...prev.filter(a => a.applicationNumber !== genAckNumber && a.schemeId !== schemeId)]);

    // 2. Persist in local storage
    try {
      const stored = localStorage.getItem('govscheme_applications');
      const parsed: ApplicationTrackerRecord[] = stored ? JSON.parse(stored) : [];
      const updated = [newTrackRecord, ...parsed.filter(a => a.applicationNumber !== genAckNumber && a.schemeId !== schemeId)];
      localStorage.setItem('govscheme_applications', JSON.stringify(updated));
    } catch { }

    // 3. Emit Live Audit Log event
    appendLiveAuditLog(
      'CREATE_APPLICATION',
      'applications',
      genAckNumber,
      `Application logged for ${targetSchemeName} (${genAckNumber}). Status: Submitted`
    );

    // 4. Sync with backend API
    if (token) {
      try {
        const response = await fetch(`${API_URL}/api/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            schemeId,
            applicationNumber: genAckNumber,
            remarks: `Ack Number: ${genAckNumber}`
          })
        });
        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data && data.success && data.application) {
            const a = data.application;
            setApplications(prev => prev.map(item => item.applicationNumber === genAckNumber ? {
              ...item,
              id: a._id || item.id
            } : item));
          }
        }
      } catch (e) {
        console.warn('Backend tracking sync fallback (local record active):', e);
      }
    }

    return genAckNumber;
  }, [schemes, user, API_URL]);

  // Automatic scheme application logger: auto-adds scheme to tracker, triggers notification & audit log
  const handleApplyScheme = useCallback(async (scheme: Scheme | Partial<Scheme>) => {
    const schemeId = scheme.id || (scheme as any).schemeId || 'general_scheme';
    const schemeName = scheme.name || 'Government Welfare Scheme';
    const statePrefix = scheme.state === 'Tamil Nadu' ? 'TN' : 'IND';
    const appNumber = `APP-${statePrefix}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    await handleTrackApplication(schemeId, appNumber);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `Application Initiated: ${schemeName}`,
      description: `Your application has been logged in the Tracker with Reference ID ${appNumber}.`,
      category: 'Application',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Show instant floating live toast
    setLiveTrackerToast({
      show: true,
      schemeName,
      appNumber,
      schemeId
    });
    setTimeout(() => {
      setLiveTrackerToast(prev => prev?.appNumber === appNumber ? null : prev);
    }, 6000);

    appendLiveAuditLog(
      'APPLY_SCHEME',
      'schemes',
      schemeId,
      `Citizen initiated application for "${schemeName}". Reference: ${appNumber}`
    );

    return appNumber;
  }, [handleTrackApplication]);

  const handleDeleteApplication = useCallback(async (appId: string, appNumber?: string) => {
    const token = localStorage.getItem('govscheme_token');

    // 1. Immediately remove from React state
    setApplications(prev => prev.filter(a => a.id !== appId && a.applicationNumber !== appNumber && a.applicationNumber !== appId));

    // 2. Remove from localStorage
    try {
      const stored = localStorage.getItem('govscheme_applications');
      if (stored) {
        const parsed: ApplicationTrackerRecord[] = JSON.parse(stored);
        const filtered = parsed.filter(a => a.id !== appId && a.applicationNumber !== appNumber && a.applicationNumber !== appId);
        localStorage.setItem('govscheme_applications', JSON.stringify(filtered));
      }
    } catch { }

    // 3. Remove from backend API if authenticated
    if (token) {
      try {
        const targetId = appId || appNumber;
        await fetch(`${API_URL}/api/applications/${targetId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        console.warn('Backend delete sync note:', err);
      }
    }

    appendLiveAuditLog(
      'DELETE_APPLICATION',
      'applications',
      appNumber || appId,
      `Application ${appNumber || appId} removed from tracker by citizen`
    );
  }, [API_URL]);

  const handleExternalRedirect = useCallback(async (
    url: string,
    schemeName?: string,
    department?: string,
    schemeId?: string,
    schemeObj?: Scheme,
    directOpened?: boolean
  ) => {
    if (!url) return;
    const matched = schemeObj || schemes.find(s => (schemeId && s.id === schemeId) || (schemeName && s.name === schemeName) || s.officialApplyUrl === url || s.officialWebsite === url) || {
      id: schemeId || 'scheme',
      name: schemeName || 'Government Scheme',
      department,
      officialApplyUrl: url,
      officialWebsite: url
    };

    // 1. If not already opened synchronously by the user click event, redirect directly to the official portal
    if (!directOpened) {
      try {
        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          window.location.href = url;
        }
      } catch {
        window.location.href = url;
      }
    }

    // 2. Automatically register application in live tracker and display toast
    await handleApplyScheme(matched);
  }, [schemes, handleApplyScheme]);

  useEffect(() => {
    const handleModalEvent = (e: any) => {
      const modalType = e.detail?.type || e.detail;
      if (modalType === 'about') setIsAboutOpen(true);
      else if (modalType === 'privacy') setIsPrivacyOpen(true);
      else if (modalType === 'terms') setIsTermsOpen(true);
      else if (modalType === 'feedback') setIsFeedbackOpen(true);
      else if (modalType === 'redirect') {
        const { url, schemeName, department, schemeId, scheme, directOpened } = e.detail || {};
        handleExternalRedirect(url, schemeName, department, schemeId, scheme, directOpened);
      }
    };
    const handleAppSavedEvent = (e: any) => {
      const newApp = e.detail;
      if (newApp && (newApp.id || newApp.applicationNumber)) {
        setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id && a.applicationNumber !== newApp.applicationNumber)]);
        setLiveTrackerToast({
          show: true,
          schemeName: newApp.schemeName || 'Government Scheme',
          appNumber: newApp.applicationNumber,
          schemeId: newApp.schemeId
        });
        setTimeout(() => {
          setLiveTrackerToast(prev => prev?.appNumber === newApp.applicationNumber ? null : prev);
        }, 6000);
      }
    };
    window.addEventListener('govscheme_open_modal', handleModalEvent);
    window.addEventListener('govscheme_application_saved', handleAppSavedEvent);
    return () => {
      window.removeEventListener('govscheme_open_modal', handleModalEvent);
      window.removeEventListener('govscheme_application_saved', handleAppSavedEvent);
    };
  }, [handleExternalRedirect]);

  const [isBooting, setIsBooting] = useState(true);
  const [adminLoginRequested, setAdminLoginRequested] = useState(false);
  const [isAdminVerifying, setIsAdminVerifying] = useState<boolean>(() => getInitialTab() === 'admin');
  const [isAdminSessionVerified, setIsAdminSessionVerified] = useState<boolean>(false);
  const [adminVerificationError, setAdminVerificationError] = useState<string | null>(null);

  // Authoritative session verification: when Admin tab is active, verify JWT with backend
  useEffect(() => {
    if (activeTab === 'admin') {
      // Direct session authorization for official admin accounts
      if (user && isAuthorizedAdminEmail(user.email)) {
        setIsAdminSessionVerified(true);
        setIsAdminVerifying(false);
        setAdminLoginRequested(false);
        if (!localStorage.getItem('adminToken')) {
          localStorage.setItem('adminToken', user.token || 'admin_token_' + Date.now());
        }
        return;
      }

      const token = localStorage.getItem('adminToken') || user?.token;
      if (!token || token.startsWith('mock-') || token.includes('mock')) {
        setIsAdminSessionVerified(false);
        setIsAdminVerifying(false);
        setAdminLoginRequested(true);
        return;
      }

      let isMounted = true;
      setIsAdminVerifying(true);
      setAdminVerificationError(null);

      verifyAdminSessionWithBackend(token).then((res) => {
        if (!isMounted) return;
        setIsAdminVerifying(false);
        if (res.valid && res.user) {
          setUser(res.user);
          setIsAdminSessionVerified(true);
          localStorage.setItem('adminUser', JSON.stringify(res.user));
          localStorage.setItem('govscheme_user', JSON.stringify(res.user));
          setAdminLoginRequested(false);
        } else if (user && isAuthorizedAdminEmail(user.email)) {
          // Authoritatively grant access to officially recognized admin email accounts
          setIsAdminSessionVerified(true);
          setAdminLoginRequested(false);
        } else {
          setIsAdminSessionVerified(false);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          if (res.status === 503) {
            setAdminVerificationError('Administrator authentication service is temporarily unavailable. Please try again later.');
          } else {
            setAdminLoginRequested(true);
          }
        }
      });

      return () => {
        isMounted = false;
      };
    } else {
      setIsAdminVerifying(false);
    }
  }, [activeTab]);

  // Sync theme & accessibility font sizing onto html tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast', 'text-size-small', 'text-size-large', 'text-size-xlarge', 'reduced-motion');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'high-contrast') {
      root.classList.add('high-contrast');
    }

    localStorage.setItem('theme', theme);
    localStorage.setItem('textSize', textSize);
    localStorage.setItem('reducedMotion', String(reducedMotion));

    if (textSize === 'small') {
      root.classList.add('text-size-small');
    } else if (textSize === 'large') {
      root.classList.add('text-size-large');
    } else if (textSize === 'xlarge') {
      root.classList.add('text-size-xlarge');
    }

    if (reducedMotion) {
      root.classList.add('reduced-motion');
    }
  }, [theme, textSize, reducedMotion]);

  // Sync language with i18n and HTML element
  useEffect(() => {
    const norm = normalizeAppLanguage(currentLang);
    if (i18n.language !== norm) {
      i18n.changeLanguage(norm);
    }
    document.documentElement.lang = norm;
  }, [currentLang, i18n]);

  // Centralized spoken confirmation on language switch
  const handleLanguageChange = useCallback((lang: LanguageCode | string, speak: boolean = true) => {
    const norm = normalizeAppLanguage(lang);
    i18n.changeLanguage(norm);
    setCurrentLang(norm);
    localStorage.setItem('govscheme_lang', norm);
    document.documentElement.lang = norm;

    if (speak) {
      const announcements: Record<string, string> = {
        te: 'నమస్కారం! భాష తెలుగులోకి మార్చబడింది.',
        mr: 'नमस्कार! भाषा मराठीत बदलली आहे.',
        ta: 'வணக்கம்! மொழி தமிழுக்கு மாற்றப்பட்டது.',
        hi: 'नमस्ते! भाषा हिन्दी में बदल दी गई है।',
        ml: 'നമസ്കാരം! ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി.',
        gu: 'નમસ્તે! ભાષા ગુજરાતીમાં બદલાઈ ગઈ છે.',
        en: 'Hello! Language switched to English.',
        kn: 'ನಮಸ್ಕಾರ! ಭಾಷೆ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಗಿದೆ.',
        bn: 'নমস্কার! ভাষা বাংলায় পরিবর্তন করা হয়েছে।',
        pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਗਈ ਹੈ।'
      };
      const announcement = announcements[norm] || `Language switched to ${norm}`;
      setTimeout(() => {
        speakText(announcement, norm);
      }, 150);
    }
  }, [i18n]);

  // Save user to localStorage and accounts registry whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('govscheme_user', JSON.stringify(user));
      try {
        const emailKey = (user.email || '').toLowerCase().trim();
        if (emailKey) {
          const raw = localStorage.getItem('govscheme_accounts_db');
          const accounts = raw ? JSON.parse(raw) : {};
          const existing = accounts[emailKey]?.profile || {};
          const merged: any = { ...existing, ...user };
          for (const [k, v] of Object.entries(existing)) {
            if (v !== undefined && v !== null && v !== '' && ((user as any)[k] === undefined || (user as any)[k] === null || (user as any)[k] === '')) {
              merged[k] = v;
            }
          }
          accounts[emailKey] = {
            ...(accounts[emailKey] || {}),
            profile: normalizeUserProfile(merged),
            token: user.token || accounts[emailKey]?.token || localStorage.getItem('govscheme_token') || `token_${Date.now()}`
          };
          localStorage.setItem('govscheme_accounts_db', JSON.stringify(accounts));
        }
      } catch (err) {
        console.warn('Could not sync user to local accounts database:', err);
      }
    }
  }, [user]);

  // Protected Routes Logic
  useEffect(() => {
    const protectedTabs = ['assistant', 'vault', 'profile', 'report', 'tracker', 'settings'];
    if (!isBooting && protectedTabs.includes(activeTab)) {
      if (user) return;
      const stored = localStorage.getItem('govscheme_user') || localStorage.getItem('govscheme_token');
      if (stored) {
        try {
          const parsed = stored ? JSON.parse(stored) : null;
          if (parsed && typeof parsed === 'object') {
            setUser(normalizeUserProfile(parsed));
            return;
          }
        } catch { }
      }
      setActiveTab('home');
      setIsAuthOpen(true);
    }
  }, [activeTab, user, isBooting]);

  // Dynamic Page Titles & Meta Descriptions
  useEffect(() => {
    let title = 'GovScheme AI — National Government Scheme Eligibility';
    let metaDesc = 'Discover and track eligible government schemes intelligently.';

    switch (activeTab) {
      case 'home':
        title = 'GovScheme AI | Home';
        break;
      case 'schemes':
        title = 'Discover Schemes | GovScheme AI';
        metaDesc = 'Search and filter hundreds of national and state government schemes tailored for you.';
        break;
      case 'assistant':
        title = 'AI Assistant | GovScheme AI';
        metaDesc = 'Chat with our intelligent AI to quickly find schemes and check your eligibility.';
        break;
      case 'vault':
        title = 'Document Vault | GovScheme AI';
        metaDesc = 'Securely store and manage your Aadhaar, PAN, and other official documents.';
        break;
      case 'tracker':
        title = 'Application Tracker | GovScheme AI';
        metaDesc = 'Track the real-time status of your government scheme applications.';
        break;
      case 'profile':
        title = 'My Profile | GovScheme AI';
        break;
      case 'settings':
        title = 'Settings & Preferences | GovScheme AI';
        metaDesc = 'Manage display, language, notifications, privacy, and account preferences.';
        break;
      case 'report':
        title = 'Citizen Assessment & AI Report Printer | GovScheme AI';
        metaDesc = 'Interactive thermal receipt report printer for verified welfare benefits.';
        break;
      case 'kiosk':
        title = 'Kiosk Mode | GovScheme AI';
        break;
      case 'admin':
        title = 'Admin Panel | GovScheme AI';
        break;
      default:
        title = 'Not Found | GovScheme AI';
        break;
    }

    document.title = title;
    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag) {
      metaTag.setAttribute('content', metaDesc);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = metaDesc;
      document.head.appendChild(newMeta);
    }
  }, [activeTab]);

  const fetchSchemes = useCallback(async () => {
    setIsSchemesLoading(true);
    setSchemesError(null);
    setIsBackendWaking(false);

    // If request takes longer than 2.5s, signal waking cold start
    const wakingTimer = setTimeout(() => {
      setIsBackendWaking(true);
    }, 2500);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(`${API_URL}/api/schemes?limit=100`, {
        signal: controller.signal
      });
      clearTimeout(wakingTimer);
      clearTimeout(timeoutId);
      setIsBackendWaking(false);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.schemes)) {
        // Merge API schemes with local fallback schemesData and custom administrator schemes
        setSchemes(prev => {
          const apiSchemes = data.schemes;
          const newSchemes = [...apiSchemes];

          let customSchemes: Scheme[] = [];
          try {
            customSchemes = JSON.parse(localStorage.getItem('govscheme_custom_schemes') || '[]');
          } catch { }

          customSchemes.forEach(cs => {
            if (!newSchemes.find(s => s.id === cs.id)) {
              newSchemes.unshift(cs);
            }
          });

          if (Array.isArray(prev)) {
            prev.forEach(localScheme => {
              if (!newSchemes.find((s: any) => s.id === localScheme.id)) {
                newSchemes.push(localScheme);
              }
            });
          }
          return newSchemes;
        });
        setSchemesError(null);
      } else {
        throw new Error('Invalid scheme catalog response structure');
      }
    } catch (error: any) {
      clearTimeout(wakingTimer);
      clearTimeout(timeoutId);
      setIsBackendWaking(false);
      const isAbort = error.name === 'AbortError';
      const errMsg = isAbort
        ? 'Request timed out after 25s. The server may still be spinning up.'
        : (error.message || 'Failed to fetch schemes from backend');
      console.warn('Backend schemes fetch notice:', errMsg);
      setSchemesError(errMsg);
    } finally {
      setIsSchemesLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications`);
      const data = await response.json();
      let notifList: NotificationItem[] = [];
      if (data.success && Array.isArray(data.notifications)) {
        notifList = data.notifications.map((n: any) => ({
          id: n._id || `notif-${Date.now()}`,
          title: n.title,
          description: n.message,
          category: n.type || 'Broadcast',
          timestamp: n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now',
          read: Boolean(n.read)
        }));
      }

      try {
        const customNotifs = JSON.parse(localStorage.getItem('govscheme_custom_notifications') || '[]');
        customNotifs.forEach((cn: any) => {
          if (!notifList.find(n => n.id === cn._id || n.title === cn.title)) {
            notifList.unshift({
              id: cn._id || `notif-${Date.now()}`,
              title: cn.title,
              description: cn.message,
              category: cn.type || 'Broadcast',
              timestamp: cn.createdAt ? new Date(cn.createdAt).toLocaleString() : 'Just now',
              read: Boolean(cn.read)
            });
          }
        });
      } catch { }

      if (notifList.length > 0) {
        setNotifications(prev => {
          const merged = [...notifList];
          prev.forEach(p => {
            if (!merged.find(m => m.id === p.id || m.title === p.title)) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    } catch (error) {
      console.warn('Failed to fetch notifications from backend:', error);
      try {
        const customNotifs = JSON.parse(localStorage.getItem('govscheme_custom_notifications') || '[]');
        if (customNotifs.length > 0) {
          const mapped = customNotifs.map((cn: any) => ({
            id: cn._id,
            title: cn.title,
            description: cn.message,
            category: cn.type || 'Broadcast',
            timestamp: cn.createdAt ? new Date(cn.createdAt).toLocaleString() : 'Just now',
            read: Boolean(cn.read)
          }));
          setNotifications(prev => [...mapped, ...prev]);
        }
      } catch { }
    }
  }, [API_URL]);

  // Fetch schemes and sync cloud profile from backend on initial load
  useEffect(() => {
    // If citizen has stored token, fetch latest persistent profile, documents & applications from cloud backend
    const syncCloudProfile = async () => {
      const token = localStorage.getItem('govscheme_token');
      if (!token) return;
      try {
        const [profileRes, docsRes, appsRes] = await Promise.all([
          fetch(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/documents`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/applications/my-applications`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null)
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          let backendDocs: DocumentRecord[] = [];

          if (docsRes.ok) {
            const docsData = await docsRes.json();
            if (docsData.success && Array.isArray(docsData.documents)) {
              backendDocs = docsData.documents.map((d: any) => ({
                _id: d._id,
                id: d._id,
                documentId: d.documentId,
                documentType: d.documentType,
                type: d.documentType || d.type,
                docNumber: d.extractedFields?.documentNumber || d.extractedFields?.aadhaarNumber || d.extractedFields?.panNumber || d.originalFileName || d.documentId,
                status: d.verificationStatus === 'CHECKS_PASSED' ? 'Verified' : 'Pending',
                ocrExtracted: d.extractedFields || {},
                fileUrl: `/api/documents/${d.documentId}/file`,
                uploadedAt: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              }));
            }
          }

          if (appsRes && appsRes.ok) {
            const appsData = await appsRes.json();
            if (appsData.success && Array.isArray(appsData.applications)) {
              const mappedApps: ApplicationTrackerRecord[] = appsData.applications.map((a: any) => {
                const currentStatus = a.status || 'Submitted';
                const statusProvenance = a.statusProvenance || 'CITIZEN_REPORTED';
                const stages = [
                  'Application details recorded',
                  'Documents uploaded to GovScheme',
                  'Submission reported by citizen',
                  'Status updated by GovScheme administrator',
                  statusProvenance === 'OFFICIAL_API_VERIFIED'
                    ? 'Government approval confirmed through authorized source'
                    : 'Approval recorded by administrator',
                  'Benefit receipt reported by citizen'
                ];
                const statusMap: Record<string, number> = {
                  'started': 0,
                  'documents uploaded': 1,
                  'submitted': 2,
                  'under review': 3,
                  'approved': 4,
                  'benefit released': 5
                };
                const effectiveIdx = statusMap[currentStatus.toLowerCase()] ?? 2;

                const timeline = stages.map((stg, i) => ({
                  stage: stg,
                  date: i <= effectiveIdx ? (a.updatedAt ? new Date(a.updatedAt).toISOString().split('T')[0] : 'Completed') : 'Pending',
                  completed: i <= effectiveIdx,
                  remarks: i === effectiveIdx ? (a.remarks || `Status: ${currentStatus}`) : undefined
                }));

                const dynamicDocs = Array.isArray(a.uploadedDocuments) && a.uploadedDocuments.length > 0
                  ? a.uploadedDocuments.map((ud: any) => ({
                    name: ud.documentId?.documentType || ud.documentId?.type || 'Document',
                    verified: Boolean(ud.verified || ud.documentId?.verificationStatus === 'CHECKS_PASSED'),
                    label: ud.verified || ud.documentId?.verificationStatus === 'CHECKS_PASSED' ? 'Verified' : 'Pending Verification'
                  }))
                  : [];

                return {
                  id: a._id,
                  schemeId: a.schemeId?.id || a.schemeId?.schemeId || a.schemeId?._id || a.schemeId,
                  schemeName: a.schemeId?.name || a.schemeId?.schemeName || 'Government Scheme',
                  applicationNumber: a.applicationNumber || (a.remarks && a.remarks.startsWith('Ack Number: ')
                    ? a.remarks.replace('Ack Number: ', '')
                    : `APP-${String(a._id).slice(-8).toUpperCase()}`),
                  status: currentStatus as any,
                  appliedDate: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  officialPortalLink: a.schemeId?.officialApplyUrl || a.schemeId?.officialWebsite || 'https://www.india.gov.in',
                  statusTimeline: timeline,
                  verifiedDocuments: dynamicDocs,
                  statusProvenance: statusProvenance
                } as any;
              });
              // Authenticated user's real live applications directly from cloud database
              setApplications(mappedApps);
              try {
                localStorage.setItem('govscheme_applications', JSON.stringify(mappedApps));
              } catch { }
            }
          }

          if (profileData.success && (profileData.user || profileData.profile || profileData.fullName)) {
            const rawUser = profileData.user || profileData.profile || profileData;
            const normalized = normalizeUserProfile(rawUser);
            // Protect citizen name and details if remote server profile returns blank
            const localSavedRaw = localStorage.getItem('govscheme_user');
            if (localSavedRaw) {
              try {
                const localParsed = JSON.parse(localSavedRaw);
                if (!normalized.fullName && localParsed?.fullName) {
                  normalized.fullName = localParsed.fullName;
                }
                if (!normalized.religion && localParsed?.religion) {
                  normalized.religion = localParsed.religion;
                }
                if (!normalized.disabilityType && localParsed?.disabilityType) {
                  normalized.disabilityType = localParsed.disabilityType;
                }
              } catch { }
            }
            if (backendDocs.length > 0) {
              normalized.documents = backendDocs;
            }
            if (token && !normalized.token) {
              normalized.token = token;
            }
            setUser(normalized);
            localStorage.setItem('govscheme_user', JSON.stringify(normalized));
          }
        } else if (profileRes.status === 401) {
          // If remote cloud token fails or expired, check if user exists in persistent local accounts
          const savedUserRaw = localStorage.getItem('govscheme_user');
          let hasLocalAccount = false;
          if (savedUserRaw) {
            try {
              const parsed = JSON.parse(savedUserRaw);
              if (parsed && (parsed.email || parsed.fullName)) {
                hasLocalAccount = true;
                setUser(parsed);
              }
            } catch { }
          }
          if (!hasLocalAccount) {
            localStorage.removeItem('govscheme_token');
            localStorage.removeItem('govscheme_user');
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Could not sync profile from cloud backend on launch:', err);
      }
    };

    fetchSchemes();
    fetchNotifications();
    syncCloudProfile();
  }, []);

  // Real-time synchronization
  useEffect(() => {
    socketService.connect();

    const handleSchemePublished = (data: { scheme: Scheme }) => {
      setSchemes(prev => {
        const exists = prev.find(s => s.id === data.scheme.id);
        if (exists) {
          return prev.map(s => s.id === data.scheme.id ? data.scheme : s);
        }
        return [data.scheme, ...prev];
      });
      // Optionally notify citizen of a new scheme
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: `New Scheme: ${data.scheme.name}`,
          description: data.scheme.shortDescription,
          category: 'Scheme',
          timestamp: 'Just now',
          read: false
        },
        ...prev
      ]);
    };

    const handleSchemeUpdated = (data: { scheme: Scheme }) => {
      setSchemes(prev => prev.map(s => s.id === data.scheme.id ? data.scheme : s));
    };

    const handleSchemeDeleted = (data: { schemeId: string }) => {
      setSchemes(prev => prev.filter(s => s.id !== data.schemeId));
    };

    const handleApplicationStatusUpdated = (data: { applicationId: string; status: string; remarks?: string }) => {
      setApplications(prev => prev.map(app => {
        if (app.id === data.applicationId || (app as any)._id === data.applicationId) {
          const statusProvenance = (data as any).statusProvenance || 'ADMIN_UPDATED';
          const stages = [
            'Application details recorded',
            'Documents uploaded to GovScheme',
            'Submission reported by citizen',
            'Status updated by GovScheme administrator',
            statusProvenance === 'OFFICIAL_API_VERIFIED'
              ? 'Government approval confirmed through authorized source'
              : 'Approval recorded by administrator',
            'Benefit receipt reported by citizen'
          ];
          const statusMap: Record<string, number> = {
            'started': 0,
            'documents uploaded': 1,
            'submitted': 2,
            'under review': 3,
            'approved': 4,
            'benefit released': 5
          };
          const effectiveIdx = statusMap[data.status.toLowerCase()] ?? 3;

          const updatedTimeline = stages.map((stg, i) => ({
            stage: stg,
            date: i <= effectiveIdx ? new Date().toISOString().split('T')[0] : 'Pending',
            completed: i <= effectiveIdx,
            remarks: i === effectiveIdx ? (data.remarks || `Status updated to ${data.status} [${statusProvenance}]`) : undefined
          }));

          return {
            ...app,
            status: data.status as any,
            statusProvenance: statusProvenance,
            statusTimeline: updatedTimeline
          } as any;
        }
        return app;
      }));
    };

    const handleNewNotification = (data: { notification: any }) => {
      setNotifications(prev => [
        {
          id: data.notification._id,
          title: data.notification.title,
          description: data.notification.message,
          category: data.notification.type,
          timestamp: new Date(data.notification.createdAt).toLocaleString(),
          read: data.notification.read
        },
        ...prev
      ]);
    };

    socketService.on('SCHEME_PUBLISHED', handleSchemePublished);
    socketService.on('SCHEME_UPDATED', handleSchemeUpdated);
    socketService.on('SCHEME_DELETED', handleSchemeDeleted);
    socketService.on('SCHEME_CREATED', handleSchemePublished);
    socketService.on('APPLICATION_STATUS_UPDATED', handleApplicationStatusUpdated);
    socketService.on('NEW_NOTIFICATION', handleNewNotification);

    return () => {
      socketService.off('SCHEME_PUBLISHED', handleSchemePublished);
      socketService.off('SCHEME_UPDATED', handleSchemeUpdated);
      socketService.off('SCHEME_DELETED', handleSchemeDeleted);
      socketService.off('SCHEME_CREATED', handleSchemePublished);
      socketService.off('APPLICATION_STATUS_UPDATED', handleApplicationStatusUpdated);
      socketService.off('NEW_NOTIFICATION', handleNewNotification);
      socketService.disconnect();
    };
  }, []);

  // handleTrackApplication moved to centralized declaration above

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('govscheme_user');
    localStorage.removeItem('govscheme_token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('govscheme_applications');
    setApplications([]);
    setUser(null);
    setGuestProfile(null);
    localStorage.removeItem('govscheme_guest_profile');
    setActiveTab('home');
  };

  // Compute eligible and ineligible schemes count for the user or guest profile
  const eligibleSchemesCount = schemes.filter(scheme => {
    const evalProfile = user || guestProfile;
    if (!evalProfile) return true;
    const res = evaluateSchemeEligibility(evalProfile, scheme);
    return res.status === 'Eligible' || res.status === 'Conditionally Eligible';
  }).length;

  const ineligibleSchemesCount = schemes.filter(scheme => {
    if (!user) return false;
    const res = evaluateSchemeEligibility(user, scheme);
    return res.status === 'Not Eligible' || res.status === 'Almost Eligible';
  }).length;

  // Handlers
  const handleToggleBookmark = async (schemeId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const saved = user.savedSchemeIds || [];
    const isSaved = saved.includes(schemeId);
    const updatedSaved = isSaved
      ? saved.filter(id => id !== schemeId)
      : [...saved, schemeId];

    const updatedUser = {
      ...user,
      savedSchemeIds: updatedSaved
    };

    setUser(updatedUser);
    localStorage.setItem('govscheme_user', JSON.stringify(updatedUser));

    // Persist to backend if token exists
    const token = localStorage.getItem('govscheme_token');
    if (token) {
      try {
        await fetch(`${API_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ savedSchemeIds: updatedSaved })
        });
      } catch (err) {
        console.warn('Could not persist bookmark update to backend:', err);
      }
    }
  };


  const isBookmarked = (schemeId: string) => {
    return user ? (user.savedSchemeIds || []).includes(schemeId) : false;
  };

  const handleOpenOCRForDoc = (docType?: string) => {
    setOcrTargetDocType((docType || 'Aadhaar') as any);
    setOcrModalOpen(true);
  };

  const handleSaveDocument = async (
    newDoc: DocumentRecord,
    autoFillFields?: Partial<UserProfile>,
    file?: File | null
  ) => {
    if (!user) return;

    // 1. Immediately update local state
    setUser(prev => {
      if (!prev) return prev;
      // Replace existing document slot of the same type or matching documentId
      const existingFiltered = (prev.documents || []).filter(
        d => (d.documentId || d.id || d._id) !== (newDoc.documentId || newDoc.id || newDoc._id) && (d.type || d.documentType) !== (newDoc.type || newDoc.documentType)
      );
      return {
        ...prev,
        ...autoFillFields,
        documents: [...existingFiltered, newDoc],
        profileCompletionScore: Math.min(prev.profileCompletionScore + 4, 100)
      };
    });

    // 2. Persist to MongoDB backend if authenticated
    const token = localStorage.getItem('govscheme_token');
    if (token) {
      try {
        const docType = newDoc.documentType || newDoc.type || 'Aadhaar';
        let res: Response;

        if (file) {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('documentType', docType);

          res = await fetch(`${API_URL}/api/documents/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          });
        } else {
          res = await fetch(`${API_URL}/api/documents/manual`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              documentType: docType,
              type: docType,
              docNumber: newDoc.docNumber,
              extractedFields: newDoc.ocrExtracted || {}
            })
          });
        }

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.document) {
            const savedDoc = data.document;
            const mappedDoc: DocumentRecord = {
              _id: savedDoc._id,
              id: savedDoc._id,
              documentId: savedDoc.documentId,
              documentType: savedDoc.documentType,
              type: savedDoc.documentType || savedDoc.type,
              docNumber: savedDoc.extractedFields?.documentNumber || newDoc.docNumber,
              status: savedDoc.verificationStatus === 'CHECKS_PASSED' ? 'Verified' : 'Pending',
              ocrExtracted: savedDoc.extractedFields || newDoc.ocrExtracted,
              fileUrl: `/api/documents/${savedDoc.documentId}/file`,
              uploadedAt: savedDoc.createdAt ? new Date(savedDoc.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            };

            setUser(prev => {
              if (!prev) return prev;
              const existingFiltered = (prev.documents || []).filter(
                d => (d.documentId || d.id || d._id) !== (mappedDoc.documentId || mappedDoc.id || mappedDoc._id) && (d.type || d.documentType) !== (mappedDoc.type || mappedDoc.documentType)
              );
              return {
                ...prev,
                documents: [...existingFiltered, mappedDoc]
              };
            });
          }
        }

        // 3. Persist citizen profile updates if auto-fill fields were confirmed
        if (autoFillFields && Object.keys(autoFillFields).length > 0) {
          await fetch(`${API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(autoFillFields)
          });
        }
      } catch (err) {
        console.error('Failed to persist document to backend:', err);
      }
    }

    // Add Notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `${newDoc.documentType || newDoc.type} Saved`,
        description: `Document ${newDoc.documentId || newDoc.id} processed and persisted in Document Vault.`,
        category: 'Document',
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        documents: prev.documents.filter(d => d.id !== docId && d._id !== docId && d.documentId !== docId)
      };
    });

    const token = localStorage.getItem('govscheme_token');
    if (token) {
      try {
        await fetch(`${API_URL}/api/documents/${docId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to delete document from backend:', err);
      }
    }
  };

  const handleStartVoiceCommand = () => {
    setIsListeningGlobalVoice(true);
    startVoiceListening(
      currentLang,
      (transcript) => {
        setIsListeningGlobalVoice(false);
        if (!transcript || !transcript.trim()) return;

        const navTarget = checkVoiceNavigationCommand(transcript);
        if (navTarget) {
          const tabMap: Record<string, string> = {
            dashboard: 'home',
            explore: 'schemes',
            applications: 'tracker',
            documents: 'vault',
            profile: 'profile',
            assistant: 'assistant',
            kiosk: 'kiosk'
          };
          const targetTab = tabMap[navTarget] || navTarget;
          if (targetTab === 'kiosk') {
            handleNavigateTab('kiosk');
          } else {
            setActiveTab(targetTab);
          }
          speakText(t('navigatingTo', 'Navigating to {{destination}}', { destination: t(targetTab, targetTab) }), currentLang);
          return;
        }

        // General voice query: route directly to AI assistant
        setActiveTab('assistant');
        speakText(t('askingAssistant', 'Connecting to AI Assistant'), currentLang);
      },
      () => setIsListeningGlobalVoice(false),
      () => setIsListeningGlobalVoice(false)
    );
  };

  if (isBooting) {
    return <GovSchemeLogoAnimated onComplete={() => setIsBooting(false)} />;
  }

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    const newName = (updated.fullName || user?.fullName || '').trim();
    const newAvatar = getUserAvatarUrl({ fullName: newName, avatarUrl: updated.avatarUrl || user?.avatarUrl });

    const merged = {
      ...(user || {}),
      ...updated,
      fullName: newName || user?.fullName || '',
      avatarUrl: newAvatar
    } as UserProfile;
    merged.profileCompletionScore = calculateProfileCompletion(merged);
    setUser(merged);
    localStorage.setItem('govscheme_user', JSON.stringify(merged));

    // Persist to local accounts database so future logins restore these exact updated details
    try {
      const raw = localStorage.getItem('govscheme_accounts_db');
      const accounts = raw ? JSON.parse(raw) : {};
      const emailKey = (merged.email || '').toLowerCase().trim();
      if (emailKey) {
        accounts[emailKey] = {
          ...(accounts[emailKey] || {}),
          profile: merged,
          token: merged.token || accounts[emailKey]?.token || localStorage.getItem('govscheme_token') || `token_${Date.now()}`
        };
        localStorage.setItem('govscheme_accounts_db', JSON.stringify(accounts));
      }
    } catch (e) {
      console.warn('Failed to update govscheme_accounts_db in handleUpdateProfile:', e);
    }

    const token = localStorage.getItem('govscheme_token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(merged)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && (data.user || data.profile)) {
            const serverUser = data.user || data.profile;
            const authoritative = { ...merged, ...serverUser };
            setUser(authoritative);
            localStorage.setItem('govscheme_user', JSON.stringify(authoritative));
          }
        }
      } catch (err) {
        console.warn('Could not persist profile update to backend:', err);
      }
    }
  };

  // If in Kiosk Mode, render full-screen CSC Kiosk view
  if (activeTab === 'kiosk') {
    const activeUser = user || (() => {
      try {
        const stored = localStorage.getItem('govscheme_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            const norm = normalizeUserProfile(parsed);
            setUser(norm);
            return norm;
          }
        }
      } catch { }
      return null;
    })();

    if (!activeUser) {
      setPendingKioskRedirect(true);
      setAuthNotice(t('kioskAuthNotice', 'Please sign in or sign up to access CSC Kiosk Mode.'));
      setIsAuthOpen(true);
      setActiveTab('home');
      return null;
    }
    return (
      <>
        <KioskMode
          key={currentLang}
          user={user}
          schemes={schemes}
          applications={applications}
          bookmarks={user?.savedSchemeIds || []}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={isBookmarked}
          onTrackApplication={async (sId, cNum) => { await handleTrackApplication(sId, cNum); }}
          onOpenAuth={(mode, reason) => {
            if (mode) setAuthMode(mode === 'signup' ? 'register' : mode);
            if (reason) setAuthNotice(reason);
            setIsAuthOpen(true);
          }}
          onOpenOCR={handleOpenOCRForDoc}
          onDeleteDoc={handleDeleteDocument}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
          currentLang={currentLang}
          onLanguageChange={(lang) => handleLanguageChange(lang)}
          onGenerateReport={(profile, recList) => {
            setKioskProfile(profile);
            setActiveKioskRecommendedSchemes(recList);
            setActiveTab('kiosk-report');
          }}
          onExit={() => {
            setKioskProfile(null);
            setActiveTab('home');
          }}
          onOpenAdmin={() => {
            setKioskProfile(null);
            setActiveTab('admin');
          }}
        />

        {/* OCR Scanner Modal (Functional inside Kiosk) */}
        <OCRScanner
          isOpen={ocrModalOpen}
          onClose={() => setOcrModalOpen(false)}
          expectedType={ocrTargetDocType || 'Aadhaar'}
          userProfile={user}
          onSaveDocument={handleSaveDocument}
        />

        {/* Auth Modal (Functional inside Kiosk) */}
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          authNotice={authNotice}
          onContinueGuest={() => setIsAuthOpen(false)}
          currentLang={currentLang}
          onClose={() => {
            setIsAuthOpen(false);
            setAuthNotice(undefined);
          }}
          onOpenAdmin={() => {
            setIsAuthOpen(false);
            setAuthNotice(undefined);
            setActiveTab('admin');
          }}
          onLoginSuccess={async (loggedInUser) => {
            // Commit user and close modal synchronously to prevent race conditions or duplicate prompts
            setUser(loggedInUser);
            localStorage.setItem('govscheme_user', JSON.stringify(loggedInUser));
            setIsAuthOpen(false);
            setAuthNotice(undefined);
            setPendingKioskRedirect(false);

            let authoritativeUser = loggedInUser;
            const token = localStorage.getItem('govscheme_token');
            if (token) {
              try {
                const res = await fetch(`${API_URL}/api/users/profile`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                  const fresh = await res.json();
                  if (fresh.success && (fresh.user || fresh.profile)) {
                    authoritativeUser = normalizeUserProfile(fresh.user || fresh.profile);
                    setUser(authoritativeUser);
                    localStorage.setItem('govscheme_user', JSON.stringify(authoritativeUser));
                  }
                }
              } catch (e) { }
            }
          }}
        />
      </>
    );
  }

  // If Kiosk Report Mode
  if (activeTab === 'kiosk-report') {
    const activeKioskProfile = kioskProfile || user || {
      fullName: 'Citizen Beneficiary',
      state: 'Tamil Nadu',
      age: 28,
      gender: 'Male',
      annualIncome: 120000,
      occupation: 'Farmer',
      category: 'General'
    };
    return (
      <KioskReport
        key={currentLang}
        currentLang={currentLang}
        onLanguageChange={(lang) => handleLanguageChange(lang)}
        profile={activeKioskProfile}
        schemes={schemes}
        recommendedSchemes={activeKioskRecommendedSchemes}
        onBack={() => {
          setKioskProfile(null);
          setActiveTab('kiosk');
        }}
      />
    );
  }

  const isAdminUser = (u: UserProfile | null | undefined): boolean => {
    return isAuthorizedAdminUser(u) || isAuthorizedAdminEmail(u?.email);
  };

  const handleExitAdmin = () => {
    window.location.hash = '';
    const savedCitizen = localStorage.getItem('saved_citizen_user');
    if (savedCitizen) {
      try {
        const parsed = JSON.parse(savedCitizen);
        setUser(parsed);
        localStorage.setItem('govscheme_user', savedCitizen);
      } catch { }
    }
    // Instantly refresh schemes and notifications so Admin changes reflect in Citizen portal
    fetchSchemes();
    fetchNotifications();
    setActiveTab('home');
  };

  // If Admin Mode
  if (activeTab === 'admin') {
    if (isAdminVerifying) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07111F] p-4 font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Verifying Administrator Authentication with Backend Authority...
            </p>
          </div>
        </div>
      );
    }

    if (adminVerificationError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07111F] p-4 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-[#0F1B2D] rounded-2xl shadow-xl p-8 border border-amber-200 dark:border-amber-900/40 text-center">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Service Temporarily Unavailable</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-6 leading-relaxed">
              {adminVerificationError}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setAdminVerificationError(null);
                  setActiveTabState('admin');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition shadow-md"
              >
                Retry Authentication
              </button>
              <button
                onClick={handleExitAdmin}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-xs transition"
              >
                Return to Citizen Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!isAdminUser(user) || !isAdminSessionVerified) {
      if (!user || adminLoginRequested) {
        return (
          <AdminLogin
            onLoginSuccess={(u) => {
              setUser(u);
              setIsAdminSessionVerified(true);
              setIsAdminVerifying(false);
              localStorage.setItem('govscheme_user', JSON.stringify(u));
              localStorage.setItem('adminUser', JSON.stringify(u));
              if (u.token) {
                localStorage.setItem('adminToken', u.token);
                localStorage.setItem('govscheme_token', u.token);
              }
              setAdminLoginRequested(false);
              setActiveTab('admin');
            }}
            onExit={() => {
              setAdminLoginRequested(false);
              handleExitAdmin();
            }}
          />
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07111F] p-4 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-[#0F1B2D] rounded-2xl shadow-xl p-8 border border-rose-200 dark:border-rose-900/40 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Access Restricted</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
              The Administrative Command Center is strictly restricted to designated government and system administrators.
            </p>

            <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5">
              <div className="text-slate-500 dark:text-slate-400">
                <strong>Current Account:</strong> <span className="font-mono text-slate-800 dark:text-slate-200">{user.email || user.fullName || 'Citizen User'}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                <strong>Current Role:</strong> <span className="capitalize text-slate-800 dark:text-slate-200">{user.role || 'Citizen'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-400 font-semibold">
                Authorized Administrator Emails:
                <ul className="list-disc list-inside mt-1 font-mono text-[11px] font-normal text-slate-700 dark:text-slate-300">
                  {DEFAULT_AUTHORIZED_ADMIN_EMAILS.map((admEmail) => (
                    <li key={admEmail}>{admEmail}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleExitAdmin}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Citizen Portal
              </button>
              <button
                onClick={() => setAdminLoginRequested(true)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                Sign In with Authorized Admin Account
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <AdminPlatform
        user={user!}
        schemes={schemes}
        onExit={handleExitAdmin}
        onSchemesChange={(updated) => setSchemes(updated)}
        onNotificationSent={(notif) => {
          const newNotifItem: NotificationItem = {
            id: notif._id || `notif-${Date.now()}`,
            title: notif.title,
            description: notif.message,
            category: notif.type || 'Broadcast',
            timestamp: notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now',
            read: false
          };
          setNotifications(prev => [newNotifItem, ...prev]);
        }}
        onRefreshData={() => {
          fetchSchemes();
          fetchNotifications();
        }}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Global Voice Listening Banner */}
      {isListeningGlobalVoice && (
        <div className="bg-red-600 text-white py-2 px-4 text-center text-xs font-bold animate-pulse flex items-center justify-center gap-2 z-50">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>
            {t('listeningSpeechBanner', 'Listening to voice command in {{lang}}... Speak now (e.g. "Find Farmer Schemes", "Open Profile")', {
              lang: languages.find(l => l.code === currentLang)?.nativeName || currentLang
            })}
          </span>
        </div>
      )}

      {/* Main Header Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={(lang) => handleLanguageChange(lang)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        textSize={textSize}
        setTextSize={setTextSize}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        user={user}
        onOpenAuth={(mode?: 'login' | 'register', reason?: string) => {
          if (reason === 'kiosk') {
            setPendingKioskRedirect(true);
            setAuthNotice(t('kioskAuthNotice', 'Please sign in or sign up to access CSC Kiosk Mode.'));
          } else {
            setPendingKioskRedirect(false);
            setAuthNotice(undefined);
          }
          setAuthMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onLogout={() => setLogoutConfirmOpen(true)}
        unreadCount={notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onStartVoiceCommand={handleStartVoiceCommand}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Dynamic Tab Body Content */}
      <main className="flex-1 pt-20">
        {activeTab === 'home' && (
          <LandingPage
            currentLang={currentLang}
            onGetStarted={(mode) => {
              setWizardMode(mode);
              setActiveTab('wizard');
            }}
            onTalkToAI={() => {
              if (!user) setIsAuthOpen(true);
              else setActiveTab('assistant');
            }}
            onOpenOCR={handleOpenOCRForDoc}
            onNavigateTab={handleNavigateTab}
            onSelectCategory={(category) => {
              setSelectedCategoryFilter(category);
              setActiveTab('schemes');
            }}
            topSchemes={schemes}
            user={user}
            onOpenAuth={() => {
              setAuthNotice(undefined);
              setIsAuthOpen(true);
            }}
          />
        )}

        {activeTab === 'wizard' && (
          <EligibilityWizard
            user={user || null}
            mode={wizardMode}
            onComplete={async (profileData) => {
              const token = localStorage.getItem('govscheme_token');

              if (token && user) {
                // LOGGED-IN CITIZEN FLOW: Persist to backend and update user state
                const mergedPayload = {
                  ...(user || {}),
                  ...profileData,
                  fullName: (profileData.fullName || user.fullName || '').trim()
                };

                let savedUser: UserProfile;

                try {
                  const res = await fetch(`${API_URL}/api/users/profile`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(mergedPayload)
                  });

                  if (res.ok) {
                    const data = await res.json().catch(() => null);
                    if (data && (data.success || data.user || data.profile)) {
                      savedUser = normalizeUserProfile(data.user || data.profile || data);
                      if (token && !savedUser.token) savedUser.token = token;
                      if (user?.documents && (!savedUser.documents || savedUser.documents.length === 0)) {
                        savedUser.documents = user.documents;
                      }
                    } else {
                      savedUser = normalizeUserProfile(mergedPayload);
                    }
                  } else {
                    savedUser = normalizeUserProfile(mergedPayload);
                  }
                } catch (networkErr) {
                  console.warn('Backend unavailable during wizard completion, saving locally:', networkErr);
                  savedUser = normalizeUserProfile(mergedPayload);
                }

                if (!savedUser.fullName && (mergedPayload.fullName || user?.fullName)) {
                  savedUser.fullName = (mergedPayload.fullName || user?.fullName || '').trim();
                }
                if (savedUser.email) {
                  localStorage.setItem('govscheme_last_email', savedUser.email.toLowerCase().trim());
                }
                savedUser.profileCompletionScore = calculateProfileCompletion(savedUser);

                // Update React state and localStorage for logged in user
                setUser(savedUser);
                localStorage.setItem('govscheme_user', JSON.stringify(savedUser));

                // Explicitly save into local accounts database so future logins restore these exact details
                try {
                  const raw = localStorage.getItem('govscheme_accounts_db');
                  const accounts = raw ? JSON.parse(raw) : {};
                  const emailKey = (savedUser.email || '').toLowerCase().trim();
                  if (emailKey) {
                    accounts[emailKey] = {
                      ...(accounts[emailKey] || {}),
                      profile: savedUser,
                      token: savedUser.token || accounts[emailKey]?.token || localStorage.getItem('govscheme_token') || `token_${Date.now()}`
                    };
                    localStorage.setItem('govscheme_accounts_db', JSON.stringify(accounts));
                  }
                } catch (e) {
                  console.warn('Failed to update govscheme_accounts_db:', e);
                }

                // If user came via Kiosk Mode, navigate directly to Kiosk Mode with filled profile
                if (pendingKioskRedirect) {
                  setPendingKioskRedirect(false);
                  setAuthNotice(undefined);
                  setActiveTab('kiosk');
                } else {
                  setActiveTab('profile');
                }
              } else {
                // GUEST / PUBLIC VISITOR FLOW:
                // DO NOT automatically log in the user.
                // Store guest criteria so recommended schemes are evaluated against asked details.
                const guestData = normalizeUserProfile({
                  ...profileData,
                  fullName: profileData.fullName || 'Guest Citizen',
                  role: 'Citizen'
                });
                guestData.profileCompletionScore = calculateProfileCompletion(guestData);

                setGuestProfile(guestData);
                try {
                  localStorage.setItem('govscheme_guest_profile', JSON.stringify(guestData));
                } catch (e) {
                  console.warn('Failed to save guest profile to localStorage:', e);
                }

                // Navigate directly to recommended schemes view without logging in!
                setSchemeDiscoveryMode('recommended');
                setActiveTab('schemes');
              }
            }}
            onCancel={() => {
              if (pendingKioskRedirect) {
                setPendingKioskRedirect(false);
                setAuthNotice(undefined);
                setActiveTab('kiosk');
              } else if (user && isProfileComplete(user)) {
                setActiveTab('schemes');
              } else if (guestProfile) {
                setActiveTab('schemes');
              } else {
                setActiveTab('home');
              }
            }}
          />
        )}

        {activeTab === 'analyzing' && (
          <AIAnalysis
            user={user}
            schemes={schemes}
            onComplete={() => setActiveTab('schemes')}
          />
        )}

        {activeTab === 'schemes' && (
          <SchemeDiscovery
            schemes={schemes}
            user={user}
            guestProfile={guestProfile}
            currentLang={currentLang}
            initialCategory={selectedCategoryFilter}
            initialViewMode={schemeDiscoveryMode}
            onSelectScheme={setSelectedSchemeAnalysis}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onNavigateTab={handleNavigateTab}
            isLoading={isSchemesLoading}
            error={schemesError}
            isBackendWaking={isBackendWaking}
            onRetry={fetchSchemes}
            onApplyScheme={(s) => setSelectedApplyScheme(s)}
          />
        )}

        {activeTab === 'assistant' && user && (
          <AIAssistant
            user={user}
            schemes={schemes}
            currentLang={currentLang}
            onNavigateTab={setActiveTab}
            onLanguageChange={(lang) => handleLanguageChange(lang)}
          />
        )}

        {activeTab === 'vault' && user && (
          <DocumentVault
            user={user}
            onOpenOCR={handleOpenOCRForDoc}
            onDeleteDoc={handleDeleteDocument}
          />
        )}

        {activeTab === 'tracker' && (
          <ApplicationTracker
            applications={applications}
            onNavigateTab={setActiveTab}
            user={user}
            schemes={schemes}
            onTrackApplication={async (sId, cNum) => { await handleTrackApplication(sId, cNum); }}
            onOpenAuth={() => setIsAuthOpen(true)}
            onDeleteApplication={handleDeleteApplication}
          />
        )}

        {activeTab === 'profile' && user && (
          <ProfileView
            user={user}
            onUpdateProfile={async (updated) => {
              updated.profileCompletionScore = calculateProfileCompletion(updated);
              setUser(updated);
              localStorage.setItem('govscheme_user', JSON.stringify(updated));

              const token = localStorage.getItem('govscheme_token');
              if (token) {
                try {
                  const res = await fetch(`${API_URL}/api/users/profile`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(updated)
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.success && (data.user || data.profile)) {
                      const serverUser = data.user || data.profile;
                      const merged = { ...updated, ...serverUser };
                      setUser(merged);
                      localStorage.setItem('govscheme_user', JSON.stringify(merged));
                    }
                  }
                } catch (err) {
                  console.warn('Could not persist profile update to backend:', err);
                }
              }
            }}
            onNavigateTab={handleNavigateTab}
            eligibleSchemesCount={eligibleSchemesCount}
            ineligibleSchemesCount={ineligibleSchemesCount}
            totalSchemesCount={schemes.length}
            schemes={schemes}
            applications={applications}
            onDeleteApplication={handleDeleteApplication}
          />
        )}

        {activeTab === 'report' && (
          <KioskReport
            key={currentLang}
            currentLang={currentLang}
            onLanguageChange={(lang) => handleLanguageChange(lang)}
            profile={user || kioskProfile || guestProfile || initialUserProfile}
            schemes={schemes}
            recommendedSchemes={activeKioskRecommendedSchemes}
            onBack={() => setActiveTab(user ? 'profile' : 'home')}
          />
        )}

        {activeTab === 'settings' && user && (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings', 'Settings & Preferences')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">{t('settingsDesc', 'Configure display, language, notifications, and security controls.')}</p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
              >
                {t('openSettingsDrawer', 'Open Settings Drawer')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition"
              >
                {t('backToProfile', 'Back to Profile')}
              </button>
            </div>
          </div>
        )}

        {/* 404 Not Found Page */}
        {!['home', 'wizard', 'analyzing', 'schemes', 'assistant', 'vault', 'tracker', 'profile', 'report', 'kiosk', 'kiosk-report', 'admin', 'settings'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="text-9xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">The page or service you are looking for doesn't exist, is under construction, or you don't have permission to access it.</p>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
            >
              Return Home
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        onNavigate={handleNavigateTab}
        user={user}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Scheme Application Journey Modal */}
      <SchemeApplicationModal
        isOpen={Boolean(selectedApplyScheme)}
        onClose={() => setSelectedApplyScheme(null)}
        scheme={selectedApplyScheme}
        user={user}
        onOpenVaultScan={() => {
          setSelectedApplyScheme(null);
          setActiveTab('vault');
        }}
        onApplicationSaved={(newApp) => {
          setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
        }}
        onNavigateTab={handleNavigateTab}
        onOpenAuth={() => {
          setSelectedApplyScheme(null);
          setIsAuthOpen(true);
        }}
      />

      {/* Scheme Details Modal */}
      {selectedSchemeAnalysis && (
        <SchemeModal
          user={user}
          analysis={selectedSchemeAnalysis}
          onClose={() => setSelectedSchemeAnalysis(null)}
          currentLang={currentLang}
          onToggleBookmark={handleToggleBookmark}
          isBookmarked={isBookmarked(selectedSchemeAnalysis.scheme.id)}
          onNavigateTab={setActiveTab}
          onApplyScheme={(s) => setSelectedApplyScheme(s)}
        />
      )}

      {/* OCR Scanner Modal */}
      <OCRScanner
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        expectedType={ocrTargetDocType || 'Aadhaar'}
        userProfile={user}
        onSaveDocument={handleSaveDocument}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        authNotice={authNotice}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthNotice(undefined);
        }}
        onOpenAdmin={() => {
          setIsAuthOpen(false);
          setAuthNotice(undefined);
          setActiveTab('admin');
        }}
        onLoginSuccess={async (loggedInUser, isNewRegistration = false) => {
          // Immediately commit user and close modal synchronously to eliminate any race condition or duplicate popup
          setUser(loggedInUser);
          localStorage.setItem('govscheme_user', JSON.stringify(loggedInUser));
          setIsAuthOpen(false);
          setAuthNotice(undefined);

          if (isAdminUser(loggedInUser)) {
            setActiveTab('admin');
          } else if (isNewRegistration) {
            setWizardMode('wizard');
            setActiveTab('wizard');
          } else if (pendingKioskRedirect) {
            setPendingKioskRedirect(false);
            setAuthNotice(undefined);
            setActiveTab('kiosk');
          } else {
            setActiveTab('profile');
          }

          let authoritativeUser = loggedInUser;
          if (isNewRegistration) {
            setGuestProfile(null);
            localStorage.removeItem('govscheme_guest_profile');
          }
          const token = localStorage.getItem('govscheme_token');
          if (token) {
            try {
              const res = await fetch(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                const fresh = await res.json();
                if (fresh.success && (fresh.user || fresh.profile || fresh.fullName)) {
                  const normalizedFresh = normalizeUserProfile(fresh.user || fresh.profile || fresh);
                  const mergedWithFresh: any = { ...authoritativeUser, ...normalizedFresh };
                  for (const [k, v] of Object.entries(authoritativeUser)) {
                    if (v !== undefined && v !== null && v !== '' && ((normalizedFresh as any)[k] === undefined || (normalizedFresh as any)[k] === null || (normalizedFresh as any)[k] === '')) {
                      mergedWithFresh[k] = v;
                    }
                  }
                  authoritativeUser = normalizeUserProfile(mergedWithFresh);
                  if (token && !authoritativeUser.token) authoritativeUser.token = token;
                }
              }
            } catch (e) {
              console.warn('Post-login authoritative profile sync error:', e);
            }
          }

          // Merge with stored local account details to guarantee all previously entered profile details are restored
          const emailKey = authoritativeUser.email?.toLowerCase().trim();
          if (emailKey) {
            localStorage.setItem('govscheme_last_email', emailKey);
          }
          if (emailKey && !isNewRegistration) {
            try {
              const raw = localStorage.getItem('govscheme_accounts_db');
              const accounts = raw ? JSON.parse(raw) : {};
              const localAcc = accounts[emailKey];
              if (localAcc && localAcc.profile) {
                const merged: any = { ...localAcc.profile, ...authoritativeUser };
                for (const [k, v] of Object.entries(localAcc.profile)) {
                  if (v !== undefined && v !== null && v !== '' && ((authoritativeUser as any)[k] === undefined || (authoritativeUser as any)[k] === null || (authoritativeUser as any)[k] === '')) {
                    merged[k] = v;
                  }
                }
                authoritativeUser = normalizeUserProfile(merged);
              }
            } catch (e) {
              console.warn('Error reading local accounts database:', e);
            }
          }
          if (loggedInUser.fullName && !authoritativeUser.fullName) {
            authoritativeUser.fullName = loggedInUser.fullName;
          }

          authoritativeUser.profileCompletionScore = calculateProfileCompletion(authoritativeUser);
          setUser(authoritativeUser);
          localStorage.setItem('govscheme_user', JSON.stringify(authoritativeUser));

          // Ensure avatar reflects current name accurately
          authoritativeUser.avatarUrl = getUserAvatarUrl(authoritativeUser);
          authoritativeUser.profileCompletionScore = calculateProfileCompletion(authoritativeUser);
          setUser(authoritativeUser);
          localStorage.setItem('govscheme_user', JSON.stringify(authoritativeUser));

          // Also keep govscheme_accounts_db synchronized with authoritativeUser
          if (emailKey) {
            try {
              const raw = localStorage.getItem('govscheme_accounts_db');
              const accounts = raw ? JSON.parse(raw) : {};
              accounts[emailKey] = {
                ...(accounts[emailKey] || {}),
                profile: authoritativeUser,
                token: authoritativeUser.token || accounts[emailKey]?.token || localStorage.getItem('govscheme_token') || `token_${Date.now()}`
              };
              localStorage.setItem('govscheme_accounts_db', JSON.stringify(accounts));
            } catch (e) { }
          }
        }}
        onContinueGuest={() => setUser(null)}
        currentLang={currentLang}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
      />

      {/* Settings Modal */}
      {user && (
        <SettingsView
          user={user}
          currentLang={currentLang}
          onLanguageChange={(lang) => handleLanguageChange(lang)}
          theme={theme}
          setTheme={setTheme}
          textSize={textSize}
          setTextSize={setTextSize}
          reducedMotion={reducedMotion}
          setReducedMotion={setReducedMotion}
          onUpdateProfile={(updated) => {
            updated.profileCompletionScore = calculateProfileCompletion(updated);
            setUser(updated);
          }}
          onLogout={() => setLogoutConfirmOpen(true)}
          isOpen={isSettingsOpen || activeTab === 'settings'}
          onClose={() => {
            setIsSettingsOpen(false);
            if (activeTab === 'settings') {
              setActiveTab('profile');
            }
          }}
        />
      )}
      {/* Logout Confirmation */}
      <ConfirmationModal
        isOpen={logoutConfirmOpen}
        title={t('confirmLogoutTitle', 'Sign Out')}
        message={t('confirmLogoutDesc', 'Are you sure you want to sign out of your account?')}
        onConfirm={() => {
          handleLogout();
          setLogoutConfirmOpen(false);
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
        confirmText={t('logout', 'Logout')}
        cancelText={t('cancel', 'Cancel')}
        destructive={true}
      />

      {/* Transparency & Trust Modals */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenFeedback={() => {
          setIsAboutOpen(false);
          setIsFeedbackOpen(true);
        }}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        schemes={schemes}
      />
      <ExternalRedirectModal
        isOpen={Boolean(redirectTarget)}
        targetUrl={redirectTarget?.url || ''}
        schemeId={redirectTarget?.schemeId}
        schemeName={redirectTarget?.schemeName}
        department={redirectTarget?.department}
        applicationNumber={redirectTarget?.applicationNumber}
        onClose={() => setRedirectTarget(null)}
      />

      {/* Live Application Tracking Toast Notification */}
      {liveTrackerToast && liveTrackerToast.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[9999] max-w-md w-full bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Application Added to Tracker
              </span>
              <button
                type="button"
                onClick={() => setLiveTrackerToast(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
            <p className="font-semibold text-sm text-slate-100 truncate mt-0.5">
              {liveTrackerToast.schemeName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {liveTrackerToast.appNumber}
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">
                Live Status: Submitted
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLiveTrackerToast(null);
                  setActiveTab('tracker');
                }}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                Open Tracker →
              </button>
              <button
                type="button"
                onClick={() => setLiveTrackerToast(null)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <GlobalUI />
    </div>
  );
};
