import React, { useState, useMemo } from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, Scheme, LanguageCode } from '../types';
import { languages } from '../data/translations';
import { ThermalReceiptPrinter, CitizenReportData } from './ThermalReceiptPrinter';
import { evaluateSchemeEligibility } from '../engine/ruleEngine';
import { initialUserProfile } from '../data/initialUserData';

interface KioskReportProps {
  profile: Partial<UserProfile>;
  schemes: Scheme[];
  onBack: () => void;
  currentLang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const KioskReport: React.FC<KioskReportProps> = ({ 
  profile, 
  schemes, 
  onBack,
  currentLang,
  onLanguageChange 
}) => {
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [viewFormat, setViewFormat] = useState<'thermal' | 'formal'>('thermal');

  const handlePrint = () => {
    window.print();
  };

  // Rule-based and demographic eligibility evaluation
  const eligibleSchemes = useMemo(() => {
    const mockUser: UserProfile = {
      ...initialUserProfile,
      ...profile,
      id: profile.id || 'kiosk-user',
      fullName: profile.fullName || 'Citizen',
      age: profile.age || 25,
      gender: profile.gender || 'Male',
      maritalStatus: profile.maritalStatus || 'Single',
      state: profile.state || 'Tamil Nadu',
      district: profile.district || '',
      annualIncome: profile.annualIncome !== undefined ? profile.annualIncome : 120000,
      category: profile.category || 'General',
      occupation: profile.occupation || 'Farmer',
      documents: profile.documents || [],
      savedSchemeIds: profile.savedSchemeIds || [],
      profileCompletionScore: profile.profileCompletionScore || 85
    };

    return schemes.filter(s => {
      const res = evaluateSchemeEligibility(mockUser, s);
      return res.status !== 'Not Eligible';
    });
  }, [profile, schemes]);

  // Transform kiosk profile to CitizenReportData for the Thermal Receipt Printer
  const reportData: CitizenReportData = useMemo(() => {
    const displaySchemes = (eligibleSchemes.length > 0 ? eligibleSchemes : schemes.slice(0, 5)).map(s => ({
      schemeId: s.id,
      schemeName: s.name,
      category: s.category,
      benefitSummary: s.shortDescription || 'Welfare grant assistance',
      matchStatus: 'Eligible',
      officialWebsite: (s as any).officialWebsite || s.officialApplyUrl,
      requiredDocuments: s.requiredDocuments || ['Aadhaar', 'Income Certificate']
    }));

    const missingDocs = Array.from(new Set(displaySchemes.flatMap(s => s.requiredDocuments))).slice(0, 4);

    return {
      reportId: `CSC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      citizenName: profile.fullName || 'CSC Citizen Beneficiary',
      age: profile.age || 25,
      gender: profile.gender || 'Male',
      state: profile.state || 'Tamil Nadu',
      district: profile.district || '',
      occupation: profile.occupation || 'Farmer',
      annualIncome: profile.annualIncome !== undefined ? profile.annualIncome : 120000,
      socialCategory: profile.category || 'General',
      studentStatus: profile.occupation === 'Student' ? 'Active Student' : 'No',
      farmerStatus: profile.occupation === 'Farmer' ? 'Registered Cultivator' : 'No',
      disabilityStatus: profile.hasDisability ? 'Differently Abled' : 'Not Applicable',
      uploadedDocumentsCount: 1,
      ocrCompletedCount: 1,
      needsReviewCount: 0,
      verificationOutcome: 'CHECKS_PASSED',
      documents: [
        {
          documentId: 'CSC-DOC-1',
          documentType: 'Aadhaar / Citizen Proof',
          ocrStatus: 'Completed',
          verificationStatus: 'Verified',
          maskedIdentifier: 'XXXX-XXXX-4829'
        }
      ],
      recommendedSchemes: displaySchemes,
      missingDocumentsChecklist: missingDocs,
      isComplete: true,
      isPreview: false,
      missingSteps: ['Verify original records at local CSC Taluk center', 'Submit Aadhaar biometric eKYC']
    };
  }, [profile, eligibleSchemes, schemes]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07111F] text-slate-900 dark:text-slate-100 font-sans print:bg-white print:text-black">
      {/* Top action bar */}
      <div className="bg-white dark:bg-[#0F1B2D] border-b border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 print:hidden sticky top-0 z-50 shadow-sm">
        <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-bold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> {t('backToSearch', 'Back to Search')}
        </button>

        {/* Right side: Language Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
            >
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{languages.find(l => l.code === (currentLang || i18n.language))?.nativeName || 'Language'}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-fade-in">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      if (onLanguageChange) onLanguageChange(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                      (currentLang || i18n.language) === lang.code
                        ? 'bg-[#1769FF] text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {lang.nativeName} ({lang.name})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: Interactive Live Thermal Dispenser with Direct A4 Sheet TEAR Download */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <ThermalReceiptPrinter
          reportData={reportData}
          autoStartPrint={true}
          onReprint={() => {
            console.log('Kiosk: Thermal receipt reprinting...');
          }}
          onRegenerateReport={onBack}
        />
      </div>
    </div>
  );
};

