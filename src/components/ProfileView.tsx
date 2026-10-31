import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2, Clock, Bookmark, FileText, AlertCircle, ChevronRight,
  User as UserIcon, Settings, Edit3, MapPin, Briefcase, IndianRupee,
  Activity, GraduationCap, LayoutDashboard, Printer, Sparkles, ShieldCheck,
  X, Loader2, Save, XCircle, Users, Award, Home, Accessibility, Heart,
  ExternalLink, Lock, CheckSquare, ArrowRight, FolderLock
} from 'lucide-react';
import { UserProfile, Scheme, ApplicationTrackerRecord } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationSelector } from './LocationSelector';
import { CitizenAssessmentModal } from './CitizenAssessmentModal';
import { evaluateSchemeEligibility } from '../engine/ruleEngine';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateTab: (tab: string) => void;
  eligibleSchemesCount: number;
  ineligibleSchemesCount?: number;
  totalSchemesCount?: number;
  schemes?: Scheme[];
  initialSubTab?: 'overview' | 'report';
  applications?: ApplicationTrackerRecord[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateProfile,
  onNavigateTab,
  eligibleSchemesCount,
  ineligibleSchemesCount,
  totalSchemesCount,
  schemes = [],
  initialSubTab,
  applications = []
}) => {
  const { t } = useTranslation();

  // Single Consistent Source of Truth for Scheme Statistics
  const totalCount = totalSchemesCount ?? schemes.length;
  const eligibleCount = eligibleSchemesCount;
  const ineligibleCount = ineligibleSchemesCount ?? Math.max(0, totalCount - eligibleCount);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(initialSubTab === 'report');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Edit Profile Form State
  const [formData, setFormData] = useState<UserProfile>({ ...user });

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  // Top recommended schemes for the citizen (up to 3 previews)
  const topRecommended = useMemo(() => {
    if (!schemes || schemes.length === 0) return [];
    return schemes
      .filter((s) => {
        const res = evaluateSchemeEligibility(user, s);
        return res.status === 'Eligible' || res.status === 'Conditionally Eligible';
      })
      .slice(0, 3);
  }, [user, schemes]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName || !formData.fullName.trim()) {
      setValidationError(t('nameRequired', 'Full Name is required.'));
      return;
    }
    if (formData.age === undefined || formData.age === null || isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
      setValidationError(t('validAgeRequired', 'Please enter a valid age between 1 and 120.'));
      return;
    }
    if (!formData.state || !formData.district) {
      setValidationError(t('locationRequired', 'Please select both State and District.'));
      return;
    }
    if (formData.annualIncome === undefined || formData.annualIncome === null || isNaN(Number(formData.annualIncome)) || Number(formData.annualIncome) < 0) {
      setValidationError(t('incomeRequired', 'Please enter a valid annual income (0 or above).'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateProfile({
        ...formData,
        age: Number(formData.age),
        annualIncome: Number(formData.annualIncome),
        familyMembersCount: Number(formData.familyMembersCount || 1),
        landHoldingAcres: Number(formData.landHoldingAcres || 0),
        disabilityPercentage: Number(formData.disabilityPercentage || 0)
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsEditModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to persist profile update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userDocs = user.documents || [];
  const verifiedDocsCount = userDocs.filter(d => d.status === 'Verified' || d.verificationStatus === 'CHECKS_PASSED').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#1769FF] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">{t('citizenDashboard', 'CITIZEN DASHBOARD')}</span>
            </div>
            <h1 className="text-3xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight">
              {t('myProfile', 'Citizen Profile & Scheme Dashboard')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {t('manageProfileDesc', 'Manage your eligibility criteria, view matched government welfare schemes, and generate assessment reports.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4" /> {t('settings', 'Settings')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Column (Span 2) */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. CITIZEN PROFILE CARD */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1769FF]/5 to-transparent rounded-bl-full -z-10 pointer-events-none" />

              <div className="flex items-center gap-5 sm:gap-6 z-10">
                <div
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 border-4 border-white dark:border-[#0F1B2D] shadow-md relative group cursor-pointer"
                  title={t('clickToEdit', 'Click to edit profile')}
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=0369a1`}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {t(user.fullName, user.fullName)}
                    </h2>
                    {user.verificationBadge && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    {user.email || t('notProvided', 'No email provided')} • +91 {user.mobile || '—'}
                  </p>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {t('profileCompleteness', 'Profile Completeness')}: {user.profileCompletionScore}%
                      </span>
                    </div>
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#15803D] h-full rounded-full transition-all duration-700"
                        style={{ width: `${user.profileCompletionScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="z-10 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] text-white font-bold text-xs sm:text-sm hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{t('editProfile', 'Edit Profile')}</span>
                </button>
              </div>
            </motion.div>

            {/* 2. CITIZEN ASSESSMENT & ELIGIBILITY REPORT CARD */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-7 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden"
            >
              <div className="flex items-start gap-4 z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-sm">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-emerald-100">{t('officialAdvisory', 'OFFICIAL ADVISORY')}</span>
                    <span className="text-xs text-emerald-200">
                      {eligibleCount} {t('matchesFound', 'Matches Found')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl text-white font-heading">
                    {t('citizenAssessmentReport', 'Citizen Assessment & Eligibility Report')}
                  </h3>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                    {t('genReportDesc', 'Generate an instant deterministic assessment report evaluating all welfare schemes with PDF export and print options.')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAssessmentModalOpen(true)}
                className="z-10 w-full md:w-auto px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2 shrink-0"
              >
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>{t('genAssessmentReport', 'Generate Assessment Report')}</span>
              </button>
            </motion.div>

            {/* 3. CONSOLIDATED SCHEME STATISTICS SECTION (ONLY ONCE) */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-[#123C69] dark:text-white font-heading">
                    {t('exploreWelfareSchemes', 'Explore Government Schemes')}
                  </h2>
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  {totalCount} {t('schemesInCatalogue', 'Schemes Available')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1 — Recommended Schemes */}
                <div
                  onClick={() => onNavigateTab('schemes:recommended')}
                  className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 hover:border-emerald-500 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {t('eligible', 'Eligible')}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-sans">
                      {eligibleCount}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">
                      {t('recommendedForYou', 'Recommended Schemes')}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {t('recommendedSchemesDesc', 'Personalized schemes strictly matched to your verified profile attributes.')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>{t('viewRecommended', 'View Matching Schemes')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Card 2 — Total Schemes */}
                <div
                  onClick={() => onNavigateTab('schemes:all')}
                  className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-10 h-10 rounded-xl bg-[#1769FF] text-white flex items-center justify-center shadow-md">
                        <LayoutDashboard className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                        {t('allIndia', 'Central + State')}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-[#123C69] dark:text-blue-400 font-sans">
                      {totalCount}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">
                      {t('totalSchemesAvailable', 'Total Schemes')}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {t('totalSchemesDesc', 'Full national repository across agriculture, pensions, health, and education.')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800/60 flex items-center justify-between text-xs font-bold text-[#1769FF] dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>{t('exploreAllCatalog', 'Explore Entire Catalogue')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Card 3 — Not Applicable Schemes */}
                <div
                  onClick={() => onNavigateTab('schemes:ineligible')}
                  className="p-5 rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border-2 border-red-200 dark:border-red-800 hover:border-red-500 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md">
                        <XCircle className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300">
                        {t('notEligible', 'Not Applicable')}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-red-600 dark:text-red-400 font-sans">
                      {ineligibleCount}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">
                      {t('notApplicableForYou', 'Not Applicable Schemes')}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {t('notApplicableDesc', 'Inspect schemes where your profile does not meet rules and see exact failure reasons.')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800/60 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform">
                    <span>{t('seeWhyIneligible', 'See Why Not Applicable')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 4. RECOMMENDED SCHEMES PREVIEW SECTION */}
            {topRecommended.length > 0 && (
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-[#123C69] dark:text-white font-heading">{t('topMatchingSchemes', 'Top Matching Schemes for You')}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('schemes:recommended')}
                    className="text-xs font-bold text-[#1769FF] hover:underline flex items-center gap-1"
                  >
                    <span>{t('viewAllSchemesCount', `View All ${eligibleCount} Schemes`, { count: eligibleCount })}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topRecommended.map((scheme) => (
                    <div
                      key={scheme.id}
                      onClick={() => onNavigateTab('schemes')}
                      className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#1769FF] dark:bg-blue-950 dark:text-blue-300">
                            {t(scheme.category, scheme.category)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">
                            ✓ {t('eligible', 'Eligible')}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">
                          {t(`${scheme.id}_name`, t(scheme.name, scheme.name))}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">
                          {t(`${scheme.id}_desc`, t(scheme.benefitsSummary || scheme.shortDescription, scheme.benefitsSummary || scheme.shortDescription))}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                        {scheme.financialBenefitAmount ? (
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            ₹{scheme.financialBenefitAmount.toLocaleString('en-IN')}/{t('yr', 'yr')}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-semibold">{t('subsidizedAid', 'Subsidized Aid')}</span>
                        )}
                        <span className="text-[#1769FF] font-bold flex items-center gap-0.5">
                          {t('details', 'Details')} <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 5. SAVED PROFILE & ELIGIBILITY ATTRIBUTES */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[#1769FF]" />
                  <h2 className="text-lg font-bold text-[#123C69] dark:text-white font-heading">
                    {t('demographicProfileDetails', 'Saved Profile & Eligibility Attributes')}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-bold text-[#1769FF] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {t('edit', 'Edit')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* 1. Demographics */}
                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">{t('demographics', 'Demographics')}</span>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
                      {user.age != null && user.age > 0 ? `${user.age} ${t('years', 'years')}` : t('notSpecified', 'Age not set')} • {t(user.gender || 'Not specified', user.gender || 'Gender not set')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('category', 'Category')}: <strong className="text-gray-700 dark:text-gray-300">{user.category ? t(user.category, user.category) : t('General', 'General')}</strong>
                    </p>
                  </div>
                </div>

                {/* 2. Location */}
                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">{t('location', 'Location')}</span>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
                      {t(user.state, user.state || 'State not set')}{user.district ? ` • ${t(user.district, user.district)}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('residenceType', 'Residence')}: <strong className="text-gray-700 dark:text-gray-300">{user.residenceType ? t(user.residenceType, user.residenceType) : t('Rural', 'Rural')}</strong>
                    </p>
                  </div>
                </div>

                {/* 3. Occupation & Education */}
                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">{t('occupation', 'Occupation')}</span>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
                      {t(user.occupation, user.occupation || 'Not specified')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('education', 'Education')}: <strong className="text-gray-700 dark:text-gray-300">{user.educationLevel ? t(user.educationLevel, user.educationLevel) : t('notSpecified', 'Not specified')}</strong>
                    </p>
                  </div>
                </div>

                {/* 4. Financial & Household */}
                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">{t('financial', 'Annual Income')}</span>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
                      {user.annualIncome != null ? `₹${user.annualIncome.toLocaleString()}/${t('year', 'year')}` : t('incomeNotSpecified', 'Not specified')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('familySize', 'Family')}: <strong className="text-gray-700 dark:text-gray-300">{user.familyMembersCount || 1} {t('members', 'Members')}</strong>
                    </p>
                  </div>
                </div>

                {/* 5. Landholding & Farm */}
                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">{t('landHolding', 'Land Holding')}</span>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
                      {user.landHoldingAcres ? `${user.landHoldingAcres} ${t('acresUnit', 'Acres')}` : t('landlessOrNone', '0 Acres (Landless)')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('workerStatus', 'Registered Worker')}: <strong className="text-gray-700 dark:text-gray-300">{user.isRegisteredWorker ? t('yes', 'Yes') : t('no', 'No')}</strong>
                    </p>
                  </div>
                </div>

                {/* 6. Disability & Special Needs */}
                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Accessibility className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">{t('disabilityStatus', 'Disability Status')}</span>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">
                      {user.hasDisability ? `${t('yes', 'Yes')} (${user.disabilityPercentage || 40}% UDID)` : t('none', 'No Disability')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('maritalStatus', 'Marital')}: <strong className="text-gray-700 dark:text-gray-300">{user.maritalStatus ? t(user.maritalStatus, user.maritalStatus) : t('Single', 'Single')}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 6. MY APPLICATIONS SECTION */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1769FF]" />
                  <h2 className="text-lg font-bold text-[#123C69] dark:text-white font-heading">
                    {t('myApplications', 'My Applications')}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('tracker')}
                  className="text-xs font-bold text-[#1769FF] hover:underline flex items-center gap-1"
                >
                  <span>{t('openTracker', 'Open Tracker')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {applications && applications.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {applications.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      onClick={() => onNavigateTab('tracker')}
                      className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:border-blue-400 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {app.applicationNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                            {app.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {app.schemeName}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {t('applied', 'Applied')}: {app.appliedDate}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-[#1769FF] font-semibold">
                        <span>{t('viewMilestones', 'View Milestones')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0F1B2D] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {t('noAppsYet', 'No applications tracked yet')}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    {t('noAppsDesc', "When you apply for a scheme and record your acknowledgement number, you can monitor its progress here.")}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('schemes:recommended')}
                    className="mt-4 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-[#1769FF] dark:text-blue-300 text-xs font-bold rounded-xl transition"
                  >{t('findSchemesToApply', 'Find Schemes to Apply')}</button>
                </div>
              )}
            </motion.section>

          </div>

          {/* Right Sidebar Column (Span 1) — ZERO DUPLICATE STATISTICS */}
          <div className="space-y-6">

            {/* Document Vault Summary Card */}
            <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderLock className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-base text-[#123C69] dark:text-white font-heading">{t('documentVault', 'Document Vault')}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">{t('encrypted', 'ENCRYPTED')}</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{t('storedDocuments', 'Stored Documents')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">{userDocs.length} / 10</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{t('formatVerified', 'Format Verified')}:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">{verifiedDocsCount}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((userDocs.length / 5) * 100))}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('vault')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs transition flex items-center justify-between"
              >
                <span>{t('manageStoredDocuments', 'Manage Stored Documents')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <h3 className="font-bold text-base text-[#123C69] dark:text-white font-heading">{t('quickActions', 'Quick Actions')}</h3>

              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsAssessmentModalOpen(true)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    {t('printAssessmentReport', 'Print Assessment Report')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('assistant')}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    {t('askAiAssistant', 'Ask AI Assistant')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('kiosk')}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-amber-600" />
                    {t('openCscKioskMode', 'Open CSC Kiosk Mode')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Profile Insights Card */}
            {user.profileCompletionScore < 100 && (
              <div className="bg-[#123C69] rounded-3xl p-6 shadow-sm text-white space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-300" />
                  <h4 className="font-bold text-sm">
                    {t('profileInsight', 'Profile Discovery Tip')}
                  </h4>
                </div>
                <p className="text-blue-100 text-xs leading-relaxed">
                  Completing your education level, family size, and social category attributes will automatically unlock additional targeted state schemes.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full py-2.5 bg-white text-[#123C69] text-xs font-bold rounded-xl shadow hover:bg-gray-100 transition-colors"
                >
                  Complete Missing Info
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* CITIZEN ASSESSMENT & ELIGIBILITY REPORT MODAL */}
      <CitizenAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        user={user}
        schemes={schemes}
        onNavigateTab={onNavigateTab}
      />

      {/* Interactive Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0B1424] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#123C69] to-[#1769FF] text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Edit3 className="w-5 h-5" /> {t('editProfile', 'Edit Profile')}
                  </h2>
                  <p className="text-xs text-blue-100 mt-1">
                    {t('editProfileSub', 'Update your demographic details to calculate verified scheme eligibility.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 space-y-5 text-sm">
                {validationError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t('profileSavedSuccess', 'Profile saved successfully and synced with cloud database!')}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('fullName', 'Full Name')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('age', 'Age')} *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={formData.age !== undefined && formData.age !== null ? formData.age : ''}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('gender', 'Gender')}</label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    >
                      <option value="">{t('selectGender', 'Select Gender')}</option>
                      <option value="Male">{t('male', 'Male')}</option>
                      <option value="Female">{t('female', 'Female')}</option>
                      <option value="Transgender">{t('transgender', 'Transgender')}</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('socialCategory', 'Social Category')}</label>
                    <select
                      value={formData.category || 'General'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    >
                      <option value="">{t('selectCategory', 'Select Category')}</option>
                      <option value="General">{t('General', 'General')}</option>
                      <option value="OBC">{t('OBC', 'OBC (Other Backward Class)')}</option>
                      <option value="SC">{t('SC', 'SC (Scheduled Caste)')}</option>
                      <option value="ST">{t('ST', 'ST (Scheduled Tribe)')}</option>
                      <option value="EWS">{t('EWS', 'EWS (Economically Weaker Section)')}</option>
                    </select>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('occupation', 'Occupation')}</label>
                    <select
                      value={formData.occupation || 'Farmer'}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    >
                      <option value="Farmer">Farmer / Agriculture</option>
                      <option value="Student">Student</option>
                      <option value="Self-Employed">Self-Employed / Business</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Employed">Salaried / Private Employee</option>
                      <option value="Daily Wage Laborer">Daily Wage Laborer</option>
                      <option value="Artisan">Artisan / Weaver</option>
                      <option value="Fisherman">Fisherman</option>
                      <option value="Senior Citizen">Senior Citizen / Pensioner</option>
                    </select>
                  </div>

                  {/* Annual Income */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('annualIncome', 'Annual Family Income (₹)')} *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.annualIncome !== undefined && formData.annualIncome !== null ? formData.annualIncome : ''}
                      onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    />
                  </div>

                  {/* Education Level */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('educationLevel', 'Education Level')}</label>
                    <select
                      value={formData.educationLevel || ''}
                      onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    >
                      <option value="">{t('selectEducationLevel', 'Select Education Level')}</option>
                      <option value="Below 10th">{t('Below 10th', 'Below 10th Standard')}</option>
                      <option value="10th Pass">{t('10th Pass', '10th Standard Pass (SSLC)')}</option>
                      <option value="12th Pass">{t('12th Pass', '12th Standard Pass (HSC)')}</option>
                      <option value="Diploma">{t('Diploma', 'Diploma / Polytechnic')}</option>
                      <option value="Graduate">{t('Graduate', "Graduate (Bachelor's Degree)")}</option>
                      <option value="Post Graduate">{t('Post Graduate', "Post Graduate (Master's Degree)")}</option>
                      <option value="Doctorate">{t('Doctorate', 'Doctorate / PhD')}</option>
                    </select>
                  </div>

                  {/* Landholding */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('landHoldingAcres', 'Landholding (Acres)')}</label>
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={formData.landHoldingAcres ?? 0}
                      onChange={(e) => setFormData({ ...formData, landHoldingAcres: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    />
                  </div>
                </div>

                {/* State & District Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('location', 'State & District')} *</label>
                  <LocationSelector
                    state={formData.state || ''}
                    district={formData.district || ''}
                    onStateChange={(state) => setFormData({ ...formData, state, district: '' })}
                    onDistrictChange={(district) => setFormData({ ...formData, district })}
                  />
                </div>

                {/* Additional Toggles */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white text-xs block">{t('hasDisability', 'Person with Disability (Divyangjan)')}</span>
                      <span className="text-[11px] text-gray-500">{t('enableIfCertifiedDisability', 'Enable if certified with benchmark disability')}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasDisability)}
                      onChange={(e) => setFormData({ ...formData, hasDisability: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  {formData.hasDisability && (
                    <div className="pl-4 border-l-2 border-blue-500">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{t('disabilityPercentageLabel', 'Disability Percentage (%)')}</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.disabilityPercentage ?? 40}
                        onChange={(e) => setFormData({ ...formData, disabilityPercentage: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white text-xs font-bold"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white text-xs block">{t('isRegisteredWorker', 'Registered Construction / Unorganized Worker')}</span>
                      <span className="text-[11px] text-gray-500">{t('eligibleForEShram', 'Eligible for e-Shram / BOCW welfare boards')}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isRegisteredWorker)}
                      onChange={(e) => setFormData({ ...formData, isRegisteredWorker: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xs"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#1769FF] text-white font-bold hover:bg-blue-700 transition flex items-center gap-2 text-xs shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSubmitting ? t('saving', 'Saving...') : t('saveChanges', 'Save Changes')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
