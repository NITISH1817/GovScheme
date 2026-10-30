

import React, { useState, useEffect, useCallback } from 'react';
import { socketService } from './api/socketClient';
import { useTranslation } from 'react-i18next';
import { LanguageCode, UserProfile, Scheme, CombinedSchemeAnalysis, DocumentRecord, ApplicationTrackerRecord, NotificationItem } from './types';
import { schemesData } from './data/schemes';
import { initialUserProfile, initialApplications, initialNotifications } from './data/initialUserData';
import { evaluateSchemeEligibility } from './engine/ruleEngine';
import { computeMLRecommendation } from './engine/mlEngine';
import { calculateProfileCompletion, normalizeUserProfile, isProfileComplete } from './utils/profileUtils';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ProfileView } from './components/ProfileView';
import { SchemeDiscovery } from './components/SchemeDiscovery';
import { SchemeModal } from './components/SchemeModal';
import { AIAssistant } from './components/AIAssistant';
import { DocumentVault } from './components/DocumentVault';
import { OCRScanner } from './components/OCRScanner';
import { ApplicationTracker } from './components/ApplicationTracker';
import { SettingsView } from './components/SettingsView';
import { KioskMode } from './components/KioskMode';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { startVoiceListening } from './services/voiceService';
import { EligibilityWizard } from './components/EligibilityWizard';
import { AIAnalysis } from './components/AIAnalysis';
import { GlobalUI, ConfirmationModal } from './components/GlobalUI';
import { AdminPlatform } from './components/admin/AdminPlatform';
import { AdminLogin } from './components/admin/AdminLogin';
import { KioskReport } from './components/KioskReport';
import { GovSchemeLogoAnimated } from './components/brand';
import { ShieldAlert, ArrowLeft, Sparkles } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<LanguageCode>(
    (i18n.language as LanguageCode) || 'en'
  );
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
      const path = (window.location.pathname || '').replace(/^\/+|\/+$/g, '').toLowerCase();
      if (path === 'admin' || path.startsWith('admin/')) return 'admin';
      const validTabs = ['home', 'schemes', 'wizard', 'vault', 'tracker', 'profile', 'kiosk', 'assistant', 'settings', 'admin'];
      if (validTabs.includes(path)) return path;

      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab')?.toLowerCase();
      if (tabParam && validTabs.includes(tabParam)) return tabParam;
      if (searchParams.get('admin') === 'true' || searchParams.has('admin')) return 'admin';

      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash && validTabs.includes(hash)) return hash;
    } catch {}
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
  };

  // User & Data State
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const initialTab = getInitialTab();
      const savedAdmin = localStorage.getItem('adminUser');
      const savedUser = localStorage.getItem('govscheme_user');
      if (initialTab === 'admin' && savedAdmin) {
        return JSON.parse(savedAdmin);
      }
      return savedUser ? JSON.parse(savedUser) : (savedAdmin ? JSON.parse(savedAdmin) : null);
    } catch { return null; }
  });
  const [schemes, setSchemes] = useState<Scheme[]>(schemesData);
  const [isSchemesLoading, setIsSchemesLoading] = useState<boolean>(false);
  const [schemesError, setSchemesError] = useState<string | null>(null);
  const [isBackendWaking, setIsBackendWaking] = useState<boolean>(false);
  const [applications, setApplications] = useState<ApplicationTrackerRecord[]>([]);
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
    if (tab === 'kiosk' && !user) {
      setPendingKioskRedirect(true);
      setAuthNotice(t('kioskAuthNotice', 'Please sign in or sign up to access CSC Kiosk Mode.'));
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    const protectedTabs = ['assistant', 'vault', 'profile', 'report', 'tracker', 'settings'];
    if (protectedTabs.includes(tab) && !user) {
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrTargetDocType, setOcrTargetDocType] = useState<DocumentRecord['type']>('Aadhaar');
  const [isListeningGlobalVoice, setIsListeningGlobalVoice] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const [isBooting, setIsBooting] = useState(true);
  const [adminLoginRequested, setAdminLoginRequested] = useState(false);

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
    i18n.changeLanguage(currentLang);
    document.documentElement.lang = currentLang;
  }, [currentLang, i18n]);

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
    if (!isBooting && protectedTabs.includes(activeTab) && !user) {
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
        // Merge API schemes with local fallback schemesData
        setSchemes(prev => {
          const apiSchemes = data.schemes;
          const newSchemes = [...apiSchemes];

          if (Array.isArray(prev)) {
            prev.forEach(localScheme => {
              if (!apiSchemes.find((s: any) => s.id === localScheme.id)) {
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

  // Fetch schemes and sync cloud profile from backend on initial load
  useEffect(() => {

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/api/notifications`);
        const data = await response.json();
        if (data.success && data.notifications) {
          const apiNotifs = data.notifications.map((n: any) => ({
            id: n._id,
            title: n.title,
            description: n.message,
            category: n.type,
            timestamp: new Date(n.createdAt).toLocaleString(),
            read: n.read
          }));
          setNotifications(apiNotifs);
        }
      } catch (error) {
        console.error('Failed to fetch notifications from backend:', error);
      }
    };

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
                const stages = [
                  'Application Started',
                  'Documents Uploaded',
                  'Submitted',
                  'Under Review',
                  'Approved',
                  'Benefit Released'
                ];
                const statusIdx = stages.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());
                const effectiveIdx = statusIdx >= 0 ? statusIdx : 2;

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
                  verifiedDocuments: dynamicDocs
                };
              });
              setApplications(mappedApps);
            }
          }

          if (profileData.success && (profileData.user || profileData.profile || profileData.fullName)) {
            const rawUser = profileData.user || profileData.profile || profileData;
            const normalized = normalizeUserProfile(rawUser);
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
          localStorage.removeItem('govscheme_token');
          localStorage.removeItem('govscheme_user');
          setUser(null);
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
          const stages = [
            'Application Started',
            'Documents Uploaded',
            'Submitted',
            'Under Review',
            'Approved',
            'Benefit Released'
          ];
          const statusIdx = stages.findIndex(s => s.toLowerCase() === data.status.toLowerCase());
          const effectiveIdx = statusIdx >= 0 ? statusIdx : 3;

          const updatedTimeline = stages.map((stg, i) => ({
            stage: stg,
            date: i <= effectiveIdx ? new Date().toISOString().split('T')[0] : 'Pending',
            completed: i <= effectiveIdx,
            remarks: i === effectiveIdx ? (data.remarks || `Status updated to ${data.status} by Admin`) : undefined
          }));

          return {
            ...app,
            status: data.status as any,
            statusTimeline: updatedTimeline
          };
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

  const handleTrackApplication = async (schemeId: string, customAppNumber?: string) => {
    const token = localStorage.getItem('govscheme_token');
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          schemeId,
          applicationNumber: customAppNumber ? customAppNumber.trim() : undefined,
          remarks: customAppNumber ? `Ack Number: ${customAppNumber}` : 'Submitted via GovScheme Tracker'
        })
      });

      const data = await response.json();
      if (data.success && data.application) {
        const a = data.application;
        const currentStatus = a.status || 'Submitted';
        const stages = [
          'Application Started',
          'Documents Uploaded',
          'Submitted',
          'Under Review',
          'Approved',
          'Benefit Released'
        ];
        const statusIdx = stages.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());
        const effectiveIdx = statusIdx >= 0 ? statusIdx : 2;

        const timeline = stages.map((stg, i) => ({
          stage: stg,
          date: i <= effectiveIdx ? (a.updatedAt ? new Date(a.updatedAt).toISOString().split('T')[0] : 'Completed') : 'Pending',
          completed: i <= effectiveIdx,
          remarks: i === effectiveIdx ? (a.remarks || `Status: ${currentStatus}`) : undefined
        }));

        const newTrackRecord: ApplicationTrackerRecord = {
          id: a._id,
          schemeId: a.schemeId?.id || a.schemeId?.schemeId || a.schemeId?._id || schemeId,
          schemeName: a.schemeId?.name || a.schemeId?.schemeName || 'Government Scheme',
          applicationNumber: a.applicationNumber || customAppNumber || `APP-${String(a._id).slice(-8).toUpperCase()}`,
          status: currentStatus as any,
          appliedDate: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          officialPortalLink: a.schemeId?.officialApplyUrl || a.schemeId?.officialWebsite || 'https://www.india.gov.in',
          statusTimeline: timeline
        };

        setApplications(prev => [newTrackRecord, ...prev]);
      } else {
        throw new Error(data.message || 'Failed to record application');
      }
    } catch (err: any) {
      console.error('Error tracking application:', err.message);
      throw err;
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('govscheme_user');
    localStorage.removeItem('govscheme_token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('adminUser');
    setUser(null);
    setActiveTab('home');
  };

  // Compute eligible and ineligible schemes count for the user
  const eligibleSchemesCount = schemes.filter(scheme => {
    if (!user) return true;
    const res = evaluateSchemeEligibility(user, scheme);
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
        d => (d.documentId || d.id || d._id) !== (newDoc.documentId || newDoc.id || newDoc._id) && d.type !== newDoc.type
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
                d => (d.documentId || d.id || d._id) !== (mappedDoc.documentId || mappedDoc.id || mappedDoc._id) && d.type !== mappedDoc.type
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
        const lower = transcript.toLowerCase();
        if (lower.includes('profile')) {
          setActiveTab('profile');
        } else if (lower.includes('scheme') || lower.includes('search') || lower.includes('farmer')) {
          setActiveTab('schemes');
        } else if (lower.includes('ai') || lower.includes('talk')) {
          setActiveTab('assistant');
        } else if (lower.includes('vault') || lower.includes('aadhaar')) {
          setActiveTab('vault');
        } else if (lower.includes('kiosk')) {
          handleNavigateTab('kiosk');
        } else {
          setActiveTab('schemes');
        }
      },
      () => setIsListeningGlobalVoice(false)
    );
  };

  if (isBooting) {
    return <GovSchemeLogoAnimated onComplete={() => setIsBooting(false)} />;
  }

  // If in Kiosk Mode, render full-screen CSC Kiosk view
  if (activeTab === 'kiosk') {
    if (!user) {
      setPendingKioskRedirect(true);
      setAuthNotice(t('kioskAuthNotice', 'Please sign in or sign up to access CSC Kiosk Mode.'));
      setIsAuthOpen(true);
      setActiveTab('home');
      return null;
    }
    return (
      <KioskMode
        key={currentLang}
        user={user}
        currentLang={currentLang}
        onLanguageChange={(lang) => {
          i18n.changeLanguage(lang);
          setCurrentLang(lang);
        }}
        onGenerateReport={(profile) => {
          setKioskProfile(profile);
          setActiveTab('kiosk-report');
        }}
        onExit={() => {
          setKioskProfile(null);
          setActiveTab('home');
        }}
      />
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
        onLanguageChange={(lang) => {
          i18n.changeLanguage(lang);
          setCurrentLang(lang);
        }}
        profile={activeKioskProfile}
        schemes={schemes}
        onBack={() => {
          setKioskProfile(null);
          setActiveTab('kiosk');
        }}
      />
    );
  }

  const isAdminUser = (u: UserProfile | null | undefined): boolean => {
    if (!u) return false;
    if (u.email === 'admin@govscheme.in') return true;
    const role = (u.role || '').toLowerCase();
    return (
      role.includes('admin') ||
      role === 'super admin' ||
      role === 'superadmin' ||
      role === 'state admin' ||
      role === 'ministry admin' ||
      role === 'district officer' ||
      role === 'nodal officer' ||
      role === 'data entry operator'
    );
  };

  const handleAutoConnectAdmin = () => {
    if (user && !isAdminUser(user)) {
      localStorage.setItem('saved_citizen_user', JSON.stringify(user));
    }
    const adminUser: UserProfile = {
      id: 'admin_1',
      fullName: 'Super Administrator',
      email: 'admin@govscheme.in',
      mobile: '9999999999',
      age: 40,
      gender: 'Male',
      state: 'Central',
      district: 'New Delhi',
      category: 'General',
      occupation: 'Government Administrator',
      annualIncome: 1200000,
      landHoldingAcres: 0,
      educationLevel: 'Post Graduate',
      familyMembersCount: 4,
      hasDisability: false,
      verificationBadge: true,
      profileCompletionScore: 100,
      savedSchemeIds: [],
      documents: [],
      role: 'Super Admin',
      token: localStorage.getItem('adminToken') || 'mock-admin-token-govscheme-2026'
    };
    setUser(adminUser);
    localStorage.setItem('govscheme_user', JSON.stringify(adminUser));
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    localStorage.setItem('adminToken', adminUser.token || 'mock-admin-token-govscheme-2026');
    setAdminLoginRequested(false);
    setActiveTab('admin');
  };

  const handleExitAdmin = () => {
    const savedCitizen = localStorage.getItem('saved_citizen_user');
    if (savedCitizen) {
      try {
        const parsed = JSON.parse(savedCitizen);
        setUser(parsed);
        localStorage.setItem('govscheme_user', savedCitizen);
      } catch {}
    }
    setActiveTab('home');
  };

  // If Admin Mode
  if (activeTab === 'admin') {
    if (!isAdminUser(user)) {
      if (!user || adminLoginRequested) {
        return (
          <AdminLogin
            onLoginSuccess={(u) => {
              setUser(u);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#07111F] p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#0F1B2D] rounded-2xl shadow-xl p-8 border border-amber-200 dark:border-amber-900/30 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Command Center</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              You are currently signed in as <strong className="text-gray-900 dark:text-white">{user.fullName || user.email}</strong> (Citizen).
              Connect directly to the GovScheme Administrative Platform below.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAutoConnectAdmin}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Auto-Connect to Admin Command Center</span>
              </button>
              <button
                onClick={() => setAdminLoginRequested(true)}
                className="w-full py-2.5 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                Sign In with Different Admin Account
              </button>
              <button
                onClick={handleExitAdmin}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Citizen Portal
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
          <span>{t('listeningSpeechBanner', 'Listening to voice command... Speak (e.g. "Find Farmer Schemes", "Open Profile")')}</span>
        </div>
      )}

      {/* Main Header Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={(lang) => {
          i18n.changeLanguage(lang);
          setCurrentLang(lang);
        }}
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
            onNavigateTab={handleNavigateTab}
            onSelectCategory={(category) => {
              setSelectedCategoryFilter(category);
              setActiveTab('schemes');
            }}
            topSchemes={schemes}
            user={user}
          />
        )}

        {activeTab === 'wizard' && (
          <EligibilityWizard
            user={user}
            mode={wizardMode}
            onComplete={async (profileData) => {
              const token = localStorage.getItem('govscheme_token');
              const mergedPayload = {
                ...(user || {}),
                ...profileData
              };

              let savedUser: UserProfile;

              if (token) {
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
              } else {
                savedUser = normalizeUserProfile(mergedPayload);
              }

              savedUser.profileCompletionScore = calculateProfileCompletion(savedUser);

              // Update React state and localStorage
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
            }}
            onCancel={() => {
              if (pendingKioskRedirect) {
                setPendingKioskRedirect(false);
                setAuthNotice(undefined);
                setActiveTab('kiosk');
              } else if (user && isProfileComplete(user)) {
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
          />
        )}

        {activeTab === 'assistant' && user && (
          <AIAssistant
            key={currentLang}
            user={user}
            schemes={schemes}
            currentLang={currentLang}
            onNavigateTab={setActiveTab}
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
            onTrackApplication={handleTrackApplication}
            onOpenAuth={() => setIsAuthOpen(true)}
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
          />
        )}

        {activeTab === 'report' && user && (
          <KioskReport
            key={currentLang}
            currentLang={currentLang}
            onLanguageChange={(lang) => {
              i18n.changeLanguage(lang);
              setCurrentLang(lang);
            }}
            profile={user}
            schemes={schemes}
            onBack={() => setActiveTab('profile')}
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
      <Footer currentLang={currentLang} onNavigate={handleNavigateTab} />

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
          let authoritativeUser = loggedInUser;
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

          authoritativeUser.profileCompletionScore = calculateProfileCompletion(authoritativeUser);
          setUser(authoritativeUser);
          localStorage.setItem('govscheme_user', JSON.stringify(authoritativeUser));

          if (isAdminUser(authoritativeUser)) {
            setActiveTab('admin');
          } else if (isNewRegistration || !isProfileComplete(authoritativeUser)) {
            // When citizen signs up (or profile is incomplete), automatically prompt user to fill their profile
            setWizardMode('wizard');
            setActiveTab('wizard');
          } else if (pendingKioskRedirect) {
            setPendingKioskRedirect(false);
            setAuthNotice(undefined);
            setActiveTab('kiosk');
          } else {
            // Complete citizen profile: show the user's profile details
            setActiveTab('profile');
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
          onLanguageChange={(lang) => {
            i18n.changeLanguage(lang);
            setCurrentLang(lang);
          }}
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

      <GlobalUI />
    </div>
  );
};
