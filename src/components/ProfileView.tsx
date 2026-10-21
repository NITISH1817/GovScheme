import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, Clock, Bookmark, FileText, AlertCircle, ChevronRight,
  User as UserIcon, Settings, Edit3, MapPin, Briefcase, IndianRupee,
  Activity, GraduationCap, LayoutDashboard, Printer, Sparkles, ShieldCheck,
  X, Loader2, Save, XCircle, Users, Award, Home, Accessibility, Heart
} from 'lucide-react';
import { UserProfile, Scheme } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationSelector } from './LocationSelector';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateTab: (tab: string) => void;
  eligibleSchemesCount: number;
  ineligibleSchemesCount?: number;
  totalSchemesCount?: number;
  schemes?: Scheme[];
  initialSubTab?: 'overview' | 'report';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateProfile,
  onNavigateTab,
  eligibleSchemesCount,
  ineligibleSchemesCount,
  totalSchemesCount,
  schemes = []
}) => {
  const totalCount = totalSchemesCount ?? (schemes.length || 75);
  const ineligibleCount = ineligibleSchemesCount ?? Math.max(0, totalCount - eligibleSchemesCount);
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserProfile>({ ...user });

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header with Title and Settings */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#1769FF] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                CITIZEN PROFILE DASHBOARD
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight">
              {t('myProfile', 'My Profile')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {t('manageProfileDesc', 'Manage your information to improve your government scheme recommendations.')}
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
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Overview Card */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1769FF]/5 to-transparent rounded-bl-full -z-10 pointer-events-none"></div>
              
              <div className="flex items-center gap-6 z-10">
                <div 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 border-4 border-white dark:border-[#0F1B2D] shadow-md relative group cursor-pointer"
                  title={t('clickToEdit', 'Click to edit profile')}
                >
                  <img src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=0369a1`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t(user.fullName, user.fullName)}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.email || t('notProvided', 'No email provided')} • +91 {user.mobile}</p>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('profileCompleteness', 'Profile Completeness')}: {user.profileCompletionScore}%</span>
                    </div>
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-[#15803D] h-1.5 rounded-full" style={{ width: `${user.profileCompletionScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="z-10 w-full md:w-auto flex flex-col sm:flex-row gap-2">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(true)} 
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1769FF] text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Edit3 className="w-4 h-4" /> {t('editProfile', 'Edit Profile')}
                </button>
              </div>
            </motion.div>

            {/* Direct Action: Generate Citizen Eligibility Assessment Report */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-6 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
            >
              <div className="flex items-start gap-4 z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {t('citizenAssessmentReport', 'Citizen Assessment & Eligibility Report')}
                  </h3>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
                    {t('genReportDesc', 'Generate an instant deterministic assessment report with live physical thermal receipt printing evaluating all welfare schemes.')}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => onNavigateTab('report')}
                className="z-10 w-full md:w-auto px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>{t('genAssessmentReport', 'Generate Assessment Report')}</span>
              </button>
            </motion.div>

            {/* Welfare Scheme Exploration Cards */}
            <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-[#123C69] dark:text-white">
                    {t('exploreWelfareSchemes', 'Explore Government Schemes')}
                  </h2>
                </div>
                <span className="text-xs text-gray-500 font-semibold">{totalCount} {t('schemesInCatalogue', 'Schemes Available')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Recommended Schemes Card */}
                <div 
                  onClick={() => onNavigateTab('schemes:recommended')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 hover:border-emerald-500 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {t('eligible', 'Eligible')}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                      {eligibleSchemesCount}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">
                      {t('recommendedForYou', 'Recommended Schemes')}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {t('recommendedSchemesDesc', 'Personalized schemes strictly matched to your verified profile.')}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>{t('viewRecommended', 'View Matching Schemes')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* 2. Total Schemes Available Card */}
                <div 
                  onClick={() => onNavigateTab('schemes:all')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-10 h-10 rounded-xl bg-[#1769FF] text-white flex items-center justify-center shadow-md">
                        <LayoutDashboard className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                        {t('allIndia', 'Central + State')}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-[#123C69] dark:text-blue-400">
                      {totalCount}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">
                      {t('totalSchemesAvailable', 'Total Schemes Available')}
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

                {/* 3. Not Applicable Schemes Card */}
                <div 
                  onClick={() => onNavigateTab('schemes:ineligible')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border-2 border-red-200 dark:border-red-800 hover:border-red-500 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md">
                        <XCircle className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300">
                        {t('notEligible', 'Not Applicable')}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-red-600 dark:text-red-400">
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

            {/* Comprehensive Demographic & Socio-Economic Profile Details */}
            <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[#1769FF]" />
                  <h2 className="text-lg font-bold text-[#123C69] dark:text-white">
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
                      {t('category', 'Category')}: <strong className="text-gray-700 dark:text-gray-300">{user.category || 'General'}</strong>
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
                      {t('residenceType', 'Residence')}: <strong className="text-gray-700 dark:text-gray-300">{user.residenceType || 'Rural'}</strong>
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
                      {t('education', 'Education')}: <strong className="text-gray-700 dark:text-gray-300">{user.educationLevel || t('notSpecified', 'Not specified')}</strong>
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
                      {user.landHoldingAcres ? `${user.landHoldingAcres} Acres` : t('landlessOrNone', '0 Acres (Landless)')}
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
                      {user.hasDisability ? `Yes (${user.disabilityPercentage || 40}% UDID)` : t('none', 'No Disability')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('maritalStatus', 'Marital')}: <strong className="text-gray-700 dark:text-gray-300">{user.maritalStatus || t('notSpecified', 'Not specified')}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Personalized Profile Insights */}
            {user.profileCompletionScore < 100 && (
              <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="bg-[#123C69] rounded-xl p-6 shadow-sm text-white flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg">{t('profileInsight', 'Profile Insight')}</h3>
                      <p className="text-blue-100 text-sm mt-1 max-w-md">
                        {user.educationLevel === undefined && user.occupation === 'Student' 
                          ? t('missingEduInsight', 'Adding your education level could help identify additional scholarship schemes.')
                          : t('missingInfoInsight', 'Adding your missing information could help identify additional schemes.')}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => onNavigateTab('wizard')} className="w-full md:w-auto px-6 py-2 bg-white text-[#123C69] text-sm font-bold rounded-lg shadow hover:bg-gray-50 transition-colors whitespace-nowrap">
                    {t('completeProfile', 'Complete Profile')}
                  </button>
                </div>
              </motion.section>
            )}
            
            {/* Recent Activity */}
            <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[#1769FF]" />
                <h2 className="text-lg font-bold text-[#123C69] dark:text-white">{t('recentActivity', 'Recent Activity')}</h2>
              </div>
              <div className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-2">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#1769FF]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('loggedIntoPlatform', 'Logged into GovScheme platform')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t('justNow', 'Just now')}</p>
                    </div>
                  </div>
                  {(user.savedSchemeIds || []).length > 0 && (
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#15803D]" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('savedSchemeToProfile', 'Saved a new scheme to profile')}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t('recently', 'Recently')}</p>
                      </div>
                    </div>
                  )}
                  {(user.documents || []).length > 0 && (
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('addedDocToVault', 'Added document to Document Vault')}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t('recently', 'Recently')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => onNavigateTab('schemes:recommended')} 
                className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group"
              >
                <CheckCircle2 className="w-6 h-6 text-[#15803D] mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{eligibleSchemesCount}</div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mt-1">{t('recommended', 'Recommended')}</div>
              </div>

              <div 
                onClick={() => onNavigateTab('schemes:all')} 
                className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <LayoutDashboard className="w-6 h-6 text-[#1769FF] mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mt-1">{t('totalSchemes', 'Total Schemes')}</div>
              </div>

              <div 
                onClick={() => onNavigateTab('schemes:ineligible')} 
                className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-500 hover:shadow-md transition-all group"
              >
                <XCircle className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{ineligibleCount}</div>
                <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mt-1">{t('notApplicable', 'Not Applicable')}</div>
              </div>

              <div 
                onClick={() => onNavigateTab('vault')} 
                className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 hover:shadow-md transition-all group"
              >
                <AlertCircle className="w-6 h-6 text-[#D97706] mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{(user.documents || []).length}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">{t('documents', 'Documents')}</div>
              </div>
            </div>

            {/* Empty Applications State */}
            <section>
              <h2 className="text-lg font-bold text-[#123C69] dark:text-white mb-4">{t('myApplications', 'My Applications')}</h2>
              <div className="bg-white dark:bg-[#0F1B2D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{t('noAppsYet', 'No applications yet')}</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">{t('noAppsDesc', "Once you start an application, you'll be able to track it here.")}</p>
                <button onClick={() => onNavigateTab('schemes')} className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded hover:bg-gray-200 transition-colors">
                  {t('exploreSchemes', 'Explore Schemes')}
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>

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
                      min={1}
                      max={120}
                      value={formData.age || ''}
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
                      <option value="Male">{t('Male', 'Male')}</option>
                      <option value="Female">{t('Female', 'Female')}</option>
                      <option value="Transgender">{t('Transgender', 'Transgender')}</option>
                      <option value="Other">{t('Other', 'Other')}</option>
                    </select>
                  </div>

                  {/* Social Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('category', 'Social Category')}</label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    >
                      <option value="">{t('selectCategory', 'Select Category')}</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC (Other Backward Class)</option>
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                      <option value="EWS">EWS (Economically Weaker Section)</option>
                    </select>
                  </div>

                  {/* Location Selector */}
                  <div className="sm:col-span-2">
                    <LocationSelector
                      state={formData.state || ''}
                      district={formData.district || ''}
                      onStateChange={(st) => setFormData(prev => ({ ...prev, state: st, district: '' }))}
                      onDistrictChange={(dt) => setFormData(prev => ({ ...prev, district: dt }))}
                    />
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('occupation', 'Primary Occupation')}</label>
                    <select
                      value={formData.occupation || ''}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-[#1769FF] outline-none"
                    >
                      <option value="">{t('selectOccupation', 'Select Occupation')}</option>
                      <option value="Farmer">{t('Farmer', 'Farmer')}</option>
                      <option value="Agriculture Worker">{t('Agriculture Worker', 'Agriculture Worker')}</option>
                      <option value="Student">{t('Student', 'Student')}</option>
                      <option value="Street Vendor">{t('Street Vendor', 'Street Vendor')}</option>
                      <option value="Self Employed">{t('Self Employed', 'Self Employed')}</option>
                      <option value="Daily Wage Worker">{t('Daily Wage Worker', 'Daily Wage Worker')}</option>
                      <option value="Private Employee">{t('Private Employee', 'Private Employee')}</option>
                      <option value="Government Employee">{t('Government Employee', 'Government Employee')}</option>
                      <option value="Unemployed">{t('Unemployed', 'Unemployed')}</option>
                      <option value="Retired">{t('Retired', 'Retired')}</option>
                    </select>
                  </div>

                  {/* Annual Household Income */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">{t('annualIncome', 'Annual Household Income (₹)')} *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.annualIncome !== undefined ? formData.annualIncome : ''}
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
                      <option value="">Select Education Level</option>
                      <option value="Below 10th">Below 10th Standard</option>
                      <option value="10th Pass">10th Standard Pass (SSLC)</option>
                      <option value="12th Pass">12th Standard Pass (HSC)</option>
                      <option value="Diploma">Diploma / Polytechnic</option>
                      <option value="Graduate">Graduate (Bachelor's Degree)</option>
                      <option value="Post Graduate">Post Graduate (Master's Degree)</option>
                      <option value="Doctorate">Doctorate / PhD</option>
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

                {/* Additional Toggles */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white text-xs block">{t('hasDisability', 'Person with Disability (Divyangjan)')}</span>
                      <span className="text-[11px] text-gray-500">Enable if certified with benchmark disability</span>
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
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Disability Percentage (%)</label>
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
                      <span className="text-[11px] text-gray-500">Eligible for e-Shram / BOCW welfare boards</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isRegisteredWorker)}
                      onChange={(e) => setFormData({ ...formData, isRegisteredWorker: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      onNavigateTab('wizard');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {t('useGuidedWizard', 'Prefer Step-by-Step Guided Wizard? Click here')}
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition"
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSubmitting ? t('saving', 'Saving...') : t('saveChanges', 'Save Changes')}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
