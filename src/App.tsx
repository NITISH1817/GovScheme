

import React, { useState, useEffect } from 'react';
import { socketService } from './api/socketClient';
import { useTranslation } from 'react-i18next';
import { LanguageCode, UserProfile, Scheme, CombinedSchemeAnalysis, DocumentRecord, ApplicationTrackerRecord, NotificationItem } from './types';
import { schemesData } from './data/schemes';
import { initialUserProfile, initialApplications, initialNotifications } from './data/initialUserData';
import { evaluateSchemeEligibility } from './engine/ruleEngine';
import { computeMLRecommendation } from './engine/mlEngine';
import { calculateProfileCompletion } from './utils/profileUtils';
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
  const [activeTab, setActiveTab] = useState<string>('home');
  const [wizardMode, setWizardMode] = useState<'wizard' | 'life-event' | 'what-can-i-get' | 'ai-interview'>('wizard');
  const [kioskProfile, setKioskProfile] = useState<Partial<UserProfile> | null>(null);

  // User & Data State
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('govscheme_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [schemes, setSchemes] = useState<Scheme[]>(schemesData);
  const [applications, setApplications] = useState<ApplicationTrackerRecord[]>(initialApplications);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Modal Controls
  const [selectedSchemeAnalysis, setSelectedSchemeAnalysis] = useState<CombinedSchemeAnalysis | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrTargetDocType, setOcrTargetDocType] = useState<DocumentRecord['type']>('Aadhaar');
  const [isListeningGlobalVoice, setIsListeningGlobalVoice] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  
  const [isBooting, setIsBooting] = useState(true);

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

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('govscheme_user', JSON.stringify(user));
    }
  }, [user]);

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

  // Fetch schemes from backend on initial load
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/schemes?limit=100');
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
        }
      } catch (error) {
        console.error('Failed to fetch schemes from backend:', error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notifications');
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

    fetchSchemes();
    fetchNotifications();
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
    socketService.on('SCHEME_CREATED', handleSchemePublished); // Treat created as published for now in the demo
    socketService.on('NEW_NOTIFICATION', handleNewNotification);

    return () => {
      socketService.off('SCHEME_PUBLISHED', handleSchemePublished);
      socketService.off('SCHEME_UPDATED', handleSchemeUpdated);
      socketService.off('SCHEME_DELETED', handleSchemeDeleted);
      socketService.off('SCHEME_CREATED', handleSchemePublished);
      socketService.off('NEW_NOTIFICATION', handleNewNotification);
      socketService.disconnect();
    };
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('govscheme_user');
    setUser(null);
    setActiveTab('home');
  };

  // Compute eligible schemes count for the user
  const eligibleSchemesCount = schemes.filter(scheme => {
    if (!user) return true;
    const res = evaluateSchemeEligibility(user, scheme);
    return res.status !== 'Not Eligible';
  }).length;

  // Handlers
  const handleToggleBookmark = (schemeId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setUser(prev => {
      if (!prev) return prev;
      const isSaved = prev.savedSchemeIds.includes(schemeId);
      const updatedSaved = isSaved
        ? prev.savedSchemeIds.filter(id => id !== schemeId)
        : [...prev.savedSchemeIds, schemeId];
      return {
        ...prev,
        savedSchemeIds: updatedSaved
      };
    });
  };

  const isBookmarked = (schemeId: string) => {
    return user ? user.savedSchemeIds.includes(schemeId) : false;
  };

  const handleOpenOCRForDoc = (docType: DocumentRecord['type']) => {
    setOcrTargetDocType(docType);
    setOcrModalOpen(true);
  };

  const handleSaveDocument = (newDoc: DocumentRecord, autoFillFields?: Partial<UserProfile>) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return prev;
      const existingFiltered = prev.documents.filter(d => d.type !== newDoc.type);
      return {
        ...prev,
        ...autoFillFields,
        documents: [...existingFiltered, newDoc],
        profileCompletionScore: Math.min(prev.profileCompletionScore + 4, 100)
      };
    });

    // Add Notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `${newDoc.type} Verified`,
        description: `Your ${newDoc.type} document has been parsed & saved to your DigiLocker Vault.`,
        category: 'Document',
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleDeleteDocument = (docId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        documents: prev.documents.filter(d => d.id !== docId)
      };
    });
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
          setActiveTab('kiosk');
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
    return (
      <KioskMode
        onGenerateReport={(profile) => {
          setKioskProfile(profile);
          setActiveTab('kiosk-report');
        }}
        onExit={() => setActiveTab('home')}
      />
    );
  }

  // If Kiosk Report Mode
  if (activeTab === 'kiosk-report' && kioskProfile) {
    return (
      <KioskReport 
        profile={kioskProfile} 
        schemes={schemes} 
        onBack={() => setActiveTab('kiosk')} 
      />
    );
  }

  // If Admin Mode
  if (activeTab === 'admin') {
    if (!user || user.role !== 'admin') {
      return (
        <AdminLogin 
          onLoginSuccess={(u) => {
            setUser(u);
            localStorage.setItem('govscheme_user', JSON.stringify(u));
          }} 
          onExit={() => setActiveTab('home')}
        />
      );
    }
    return (
      <AdminPlatform 
        user={user} 
        schemes={schemes} 
        onExit={() => setActiveTab('home')}
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
        onOpenAuth={() => setIsAuthOpen(true)}
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
            onNavigateTab={(tab) => {
              const protectedTabs = ['schemes', 'assistant', 'vault', 'profile', 'tracker'];
              if (protectedTabs.includes(tab) && !user) {
                setIsAuthOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            topSchemes={schemes}
            user={user}
          />
        )}

        {activeTab === 'wizard' && (
          <EligibilityWizard
            user={user}
            mode={wizardMode}
            onComplete={(profileData) => {
              setUser(prev => {
                const updated = prev ? { ...prev, ...profileData } : { ...initialUserProfile, ...profileData };
                updated.profileCompletionScore = calculateProfileCompletion(updated);
                return updated;
              });
              setActiveTab('analyzing');
            }}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'analyzing' && (
          <AIAnalysis
            onComplete={() => setActiveTab('schemes')}
          />
        )}

        {activeTab === 'schemes' && user && (
          <SchemeDiscovery
            schemes={schemes}
            user={user}
            currentLang={currentLang}
            onSelectScheme={setSelectedSchemeAnalysis}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={isBookmarked}
          />
        )}

        {activeTab === 'assistant' && user && (
          <AIAssistant
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
          />
        )}

        {activeTab === 'profile' && user && (
          <ProfileView
            user={user}
            onUpdateProfile={(updated) => {
              updated.profileCompletionScore = calculateProfileCompletion(updated);
              setUser(updated);
            }}
            onNavigateTab={setActiveTab}
            eligibleSchemesCount={eligibleSchemesCount}
          />
        )}

        {/* 404 Not Found Page */}
        {!['home', 'wizard', 'analyzing', 'schemes', 'assistant', 'vault', 'tracker', 'profile'].includes(activeTab) && (
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
      <Footer currentLang={currentLang} onNavigate={setActiveTab} />

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
        expectedType={ocrTargetDocType}
        onSaveDocument={handleSaveDocument}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          localStorage.setItem('govscheme_user', JSON.stringify(loggedInUser));
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
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
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
