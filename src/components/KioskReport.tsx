import React, { useState, useMemo } from 'react';
import { Printer, ArrowLeft, CheckCircle, FileText, Globe, Receipt, FileSpreadsheet } from 'lucide-react';
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
      {/* Top action bar - Hidden during print */}
      <div className="bg-white dark:bg-[#0F1B2D] border-b border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 print:hidden sticky top-0 z-50 shadow-sm">
        <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-bold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> {t('backToSearch', 'Back to Search')}
        </button>
        
        {/* View Mode Switcher (Thermal Animated Printer vs Formal A4 Sheet) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewFormat('thermal')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewFormat === 'thermal'
                ? 'bg-[#1769FF] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> {t('thermalReceiptView', 'Thermal Receipt (Animated)')}
          </button>
          <button
            type="button"
            onClick={() => setViewFormat('formal')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewFormat === 'formal'
                ? 'bg-[#1769FF] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> {t('formalA4View', 'Formal A4 Sheet')}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{languages.find(l => l.code === (currentLang || i18n.language))?.nativeName || 'Language'}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1 z-50">
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

          {viewFormat === 'formal' && (
            <button onClick={handlePrint} className="flex items-center px-5 py-2 bg-primary text-white font-bold text-xs rounded-lg shadow hover:bg-blue-600 transition-colors">
              <Printer className="w-4 h-4 mr-2" /> {t('printPdfReport', 'Print PDF')}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewFormat === 'thermal' ? (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <ThermalReceiptPrinter
            reportData={reportData}
            autoStartPrint={true}
            onReprint={() => {
              console.log('Kiosk: Thermal receipt reprinting...');
            }}
            onRegenerateReport={onBack}
          />
        </div>
      ) : (
        /* Formal Printable A4 Area */
        <div className="max-w-4xl mx-auto p-8 print:p-0">
          <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm print:shadow-none print:border-none p-8 md:p-12 print:p-0">
            
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 dark:border-white pb-6 mb-8 print:border-black">
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900 dark:text-white print:text-black">GovScheme</h1>
                <p className="text-sm font-bold text-slate-500 print:text-black">{t('citizenEligibilityReport', 'Citizen Eligibility Report')}</p>
              </div>
              <div className="text-right text-sm text-slate-500 print:text-black font-medium space-y-1">
                <div>{t('reportDate', 'Date')}: {new Date().toLocaleDateString()}</div>
                <div>{t('generatedBy', 'Generated by')}: CSC Digital Seva</div>
                <div>{t('refId', 'Ref ID')}: {reportData.reportId}</div>
              </div>
            </div>

            {/* Citizen Details */}
            <div className="mb-10 p-6 bg-slate-50 dark:bg-[#16243A] rounded-xl print:bg-white print:border print:border-slate-300">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white print:text-black mb-4 uppercase tracking-wider">{t('beneficiaryProfile', 'Beneficiary Profile')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-slate-500 mb-1 print:text-black font-semibold">{t('reportName', 'Name')}</div>
                  <div className="font-bold text-slate-900 dark:text-white print:text-black">{profile.fullName || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 print:text-black font-semibold">{t('reportAge', 'Age')}</div>
                  <div className="font-bold text-slate-900 dark:text-white print:text-black">{profile.age || 'N/A'} {t('reportYrs', 'yrs')}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 print:text-black font-semibold">{t('reportState', 'State')}</div>
                  <div className="font-bold text-slate-900 dark:text-white print:text-black">{profile.state || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 print:text-black font-semibold">{t('reportMobile', 'Mobile')}</div>
                  <div className="font-bold text-slate-900 dark:text-white print:text-black">{profile.mobile || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 print:text-black font-semibold">{t('reportOccupation', 'Occupation')}</div>
                  <div className="font-bold text-slate-900 dark:text-white print:text-black">{profile.occupation || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1 print:text-black font-semibold">{t('reportAnnualIncome', 'Annual Income')}</div>
                  <div className="font-bold text-slate-900 dark:text-white print:text-black">₹{profile.annualIncome?.toLocaleString() || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Evaluation Results */}
            <div className="mb-6 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center print:bg-emerald-100">
                 <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 print:text-emerald-700" />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white print:text-black">{t('eligibleSchemesFound', 'Eligible Schemes Found')}: {eligibleSchemes.length}</h2>
                  <p className="text-sm text-slate-500 print:text-black">{t('kioskReportIntro', 'Based on the provided demographic data, the citizen qualifies for the following benefits.')}</p>
               </div>
            </div>

            {/* Scheme List */}
            <div className="space-y-6 mt-8">
              {eligibleSchemes.map((scheme, idx) => (
                <div key={scheme.id} className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl print:border-slate-300 print:break-inside-avoid">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white print:text-black">{idx + 1}. {scheme.name}</h3>
                     <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 print:bg-gray-100 print:text-black text-xs font-bold rounded-full">
                       {scheme.department}
                     </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 print:text-black mb-4">{scheme.shortDescription}</p>
                  
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 print:border-slate-200 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary print:text-black" />
                      <span className="font-bold text-slate-900 dark:text-white print:text-black">{t('requiredDocs', 'Required Docs:')}</span>
                      <span className="text-slate-500 print:text-black">{scheme.requiredDocuments?.join(', ') || 'Standard KYC'}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {eligibleSchemes.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl print:border-slate-300 text-slate-500 print:text-black">
                  {t('noMatchingSchemes', 'No matching schemes found for this profile.')}
                </div>
              )}
            </div>

            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 print:border-slate-300 flex justify-between items-end text-sm text-slate-500 print:text-black break-inside-avoid">
               <div>
                 <p className="font-bold mb-1">{t('disclaimer', 'Disclaimer')}</p>
                 <p className="max-w-md text-xs">{t('kioskDisclaimer', 'This report is automatically generated based on user input and does not guarantee benefit disbursement. Final approval is subject to document verification by the respective department.')}</p>
               </div>
               <div className="text-right">
                 <div className="w-48 border-b border-slate-400 mb-2 print:border-black"></div>
                 <p>{t('authorizedSignature', 'Authorized Signature')}</p>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
