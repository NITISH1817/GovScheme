import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Monitor, 
  Volume2, 
  RefreshCw, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  ExternalLink,
  User,
  Sparkles
} from 'lucide-react';
import { Scheme, UserProfile, LanguageCode } from '../types';
import { evaluateSchemeEligibility } from '../engine/ruleEngine';

interface KioskModeProps {
  schemes: Scheme[];
  currentLang: LanguageCode;
  onSelectScheme: (scheme: Scheme) => void;
  onExitKiosk: () => void;
}

export const KioskMode: React.FC<KioskModeProps> = ({
  schemes,
  currentLang,
  onSelectScheme,
  onExitKiosk
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOccupation, setSelectedOccupation] = useState<string>('Farmer');
  const [selectedIncomeRange, setSelectedIncomeRange] = useState<number>(100000);

  const occupations = ['Farmer', 'Daily Wager / Laborer', 'Artisan / Craftsman', 'Student', 'Small Business Owner'];
  const incomeRanges = [
    { label: 'Below ₹1 Lakh / year', maxIncome: 100000 },
    { label: '₹1 Lakh to ₹2.5 Lakh / year', maxIncome: 250000 },
    { label: 'Above ₹2.5 Lakh / year', maxIncome: 500000 },
  ];

  const kioskProfile: UserProfile = {
    id: 'kiosk-temp',
    fullName: 'Gram Panchayat Citizen',
    mobile: '9999999999',
    email: 'kiosk@csc.gov.in',
    age: 40,
    gender: 'Male',
    state: 'Tamil Nadu',
    district: 'Rural District',
    category: 'OBC',
    occupation: selectedOccupation,
    annualIncome: selectedIncomeRange,
    landHoldingAcres: 2.0,
    educationLevel: 'Class 10 Pass',
    familyMembersCount: 4,
    hasDisability: false,
    verificationBadge: true,
    profileCompletionScore: 90,
    savedSchemeIds: [],
    documents: []
  };

  const eligibleKioskSchemes = schemes.filter(scheme => {
    const res = evaluateSchemeEligibility(kioskProfile, scheme);
    return res.status !== 'Not Eligible';
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-heading text-amber-400">
              CSC Gram Panchayat Touch Kiosk Mode
            </h1>
            <p className="text-xs text-slate-300">Simplified 3-Step Scheme Discovery for Rural Citizens</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setStep(1);
              setSelectedOccupation('Farmer');
            }}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition flex items-center gap-2 shadow"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Reset Kiosk Session</span>
          </button>

          <button
            onClick={onExitKiosk}
            className="px-4 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs"
          >
            Exit Kiosk Mode
          </button>
        </div>
      </div>

      {/* Step Wizard */}
      <div className="my-8 max-w-4xl mx-auto w-full">
        {step === 1 && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-black font-heading text-white">
              Step 1: Select Your Occupation (தொழில்)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {occupations.map(occ => (
                <button
                  key={occ}
                  onClick={() => {
                    setSelectedOccupation(occ);
                    setStep(2);
                  }}
                  className={`p-8 rounded-3xl border-2 text-xl font-extrabold text-left transition transform hover:scale-105 shadow-xl flex justify-between items-center ${
                    selectedOccupation === occ
                      ? 'bg-purple-600 border-amber-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <span>{occ}</span>
                  <ChevronRight className="w-8 h-8 text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-black font-heading text-white">
              Step 2: Select Household Annual Income Range
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {incomeRanges.map(inc => (
                <button
                  key={inc.label}
                  onClick={() => {
                    setSelectedIncomeRange(inc.maxIncome);
                    setStep(3);
                  }}
                  className="p-8 rounded-3xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-xl font-extrabold text-left transition transform hover:scale-102 shadow-xl flex justify-between items-center"
                >
                  <span>{inc.label}</span>
                  <ChevronRight className="w-8 h-8 text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black font-heading text-amber-400">
                  Step 3: Eligible Government Schemes Found ({eligibleKioskSchemes.length})
                </h2>
                <p className="text-sm text-slate-300">Filtered for {selectedOccupation} with income below ₹{selectedIncomeRange.toLocaleString('en-IN')}.</p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs border border-slate-700"
              >
                ← Change Parameters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eligibleKioskSchemes.map(scheme => (
                <div key={scheme.id} className="bg-slate-800 border-2 border-purple-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xl">
                  <div className="space-y-2">
                    <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full inline-block">
                      ✓ ELIGIBLE FOR YOU
                    </span>
                    <h3 className="text-xl font-extrabold text-white font-heading">{scheme.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{scheme.shortDescription}</p>
                    <div className="text-lg font-black text-amber-400">
                      Benefit: ₹{(scheme.financialBenefitAmount || 0).toLocaleString('en-IN')}/year
                    </div>
                  </div>

                  <a
                    href={scheme.officialApplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-lg transition text-center flex items-center justify-center gap-2"
                  >
                    <span>Apply Now on Official Portal</span>
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800">
        Common Service Centre (CSC) Kiosk Terminal • National Portal Verified Dataset
      </div>
    </div>
  );
};
