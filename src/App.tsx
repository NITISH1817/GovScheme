import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageCode, UserProfile, Scheme, CombinedSchemeAnalysis, DocumentRecord, ApplicationTrackerRecord, NotificationItem } from './types';
import { schemesData } from './data/schemes';
import { initialUserProfile, initialApplications, initialNotifications } from './data/initialUserData';
import { evaluateSchemeEligibility } from './engine/ruleEngine';
import { computeMLRecommendation } from './engine/mlEngine';
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
import { AdminPanel } from './components/AdminPanel';
import { KioskMode } from './components/KioskMode';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { startVoiceListening } from './services/voiceService';

export const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<LanguageCode>(
    (i18n.language as LanguageCode) || 'en'
  );
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'high-contrast') || 'light';
  });
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [activeTab, setActiveTab] = useState<string>('home');

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

  // Sync theme & accessibility font sizing onto html tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast', 'text-size-large', 'text-size-xlarge');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'high-contrast') {
      root.classList.add('high-contrast');
    }

    localStorage.setItem('theme', theme);

    if (textSize === 'large') {
      root.classList.add('text-size-large');
    } else if (textSize === 'xlarge') {
      root.classList.add('text-size-xlarge');
    }
  }, [theme, textSize]);

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

  // If in Kiosk Mode, render full-screen CSC Kiosk view
  if (activeTab === 'kiosk') {
    return (
      <KioskMode
        schemes={schemes}
        currentLang={currentLang}
        onSelectScheme={(sch) => {
          const ruleRes = evaluateSchemeEligibility(user || initialUserProfile, sch);
          const mlRes = computeMLRecommendation(user || initialUserProfile, sch, ruleRes, schemes);
          setSelectedSchemeAnalysis({ scheme: sch, ruleResult: ruleRes, mlResult: mlRes });
        }}
        onExitKiosk={() => setActiveTab('home')}
      />
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Global Voice Listening Banner */}
      {isListeningGlobalVoice && (
        <div className="bg-red-600 text-white py-2 px-4 text-center text-xs font-bold animate-pulse flex items-center justify-center gap-2 z-50">
          <span>Listening to voice command... Speak (e.g. "Find Farmer Schemes", "Open Profile")</span>
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
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        unreadCount={notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onStartVoiceCommand={handleStartVoiceCommand}
      />

      {/* Dynamic Tab Body Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            currentLang={currentLang}
            onGetStarted={() => {
              if (!user) setIsAuthOpen(true);
              else setActiveTab('profile');
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
            onUpdateProfile={(updated) => setUser(updated)}
            onNavigateTab={setActiveTab}
            eligibleSchemesCount={eligibleSchemesCount}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            schemes={schemes}
            onAddScheme={(newSch) => setSchemes(prev => [newSch, ...prev])}
            onDeleteScheme={(id) => setSchemes(prev => prev.filter(s => s.id !== id))}
          />
        )}
      </main>

      {/* Footer */}
      <Footer currentLang={currentLang} onNavigate={setActiveTab} />

      {/* Scheme Details Modal */}
      {selectedSchemeAnalysis && (
        <SchemeModal
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
    </div>
  );
};
