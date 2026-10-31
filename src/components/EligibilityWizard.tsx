import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { ChevronRight, ChevronLeft, Check, Loader2, AlertCircle, Save } from 'lucide-react';
import { LocationSelector } from './LocationSelector';
import { getMissingProfileFields } from '../utils/profileUtils';

interface EligibilityWizardProps {
  user: UserProfile | null;
  mode?: 'wizard' | 'life-event' | 'what-can-i-get' | 'ai-interview';
  onComplete: (profile: Partial<UserProfile>) => Promise<void> | void;
  onCancel: () => void;
}

export const EligibilityWizard: React.FC<EligibilityWizardProps> = ({ user, mode = 'wizard', onComplete, onCancel }) => {
  const { t } = useTranslation();
  const [[page, direction], setPage] = useState([1, 0]);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>(() => ({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    age: user?.age !== undefined && user?.age !== null ? user.age : ('' as any),
    gender: user?.gender || ('' as any),
    maritalStatus: user?.maritalStatus || '',
    state: user?.state || '',
    district: user?.district || '',
    annualIncome: user?.annualIncome !== undefined && user?.annualIncome !== null ? user.annualIncome : ('' as any),
    category: user?.category || ('' as any),
    occupation: user?.occupation || '',
    educationLevel: user?.educationLevel || '',
    landHoldingAcres: user?.landHoldingAcres ?? 0,
    familyMembersCount: user?.familyMembersCount ?? 1,
    hasDisability: user?.hasDisability ?? false,
    disabilityPercentage: user?.disabilityPercentage ?? 0,
    isRegisteredWorker: user?.isRegisteredWorker ?? false,
    residenceType: user?.residenceType || 'Rural',
    interests: user?.interests || [],
    ...(user || {})
  }));

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName || '',
        email: user.email || prev.email || '',
        mobile: user.mobile || prev.mobile || '',
        age: user.age !== undefined && user.age !== null ? user.age : prev.age,
        gender: user.gender || prev.gender,
        maritalStatus: user.maritalStatus || prev.maritalStatus,
        state: user.state || prev.state,
        district: user.district || prev.district,
        annualIncome: user.annualIncome !== undefined ? user.annualIncome : prev.annualIncome,
        category: user.category || prev.category,
        occupation: user.occupation || prev.occupation,
        educationLevel: user.educationLevel || prev.educationLevel,
        landHoldingAcres: user.landHoldingAcres !== undefined ? user.landHoldingAcres : prev.landHoldingAcres,
        familyMembersCount: user.familyMembersCount || prev.familyMembersCount,
        hasDisability: user.hasDisability !== undefined ? user.hasDisability : prev.hasDisability,
        disabilityPercentage: user.disabilityPercentage !== undefined ? user.disabilityPercentage : prev.disabilityPercentage,
        isRegisteredWorker: user.isRegisteredWorker !== undefined ? user.isRegisteredWorker : prev.isRegisteredWorker,
        residenceType: user.residenceType || prev.residenceType || 'Rural',
        interests: Array.isArray(user.interests) && user.interests.length > 0 ? user.interests : prev.interests
      }));
    }
  }, [user]);

  const updateForm = useCallback((key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isWhatCanIGet = mode === 'what-can-i-get';
  const isLifeEvent = mode === 'life-event';

  const validateCurrentStep = useCallback((): boolean => {
    setValidationError(null);
    setApiError(null);
    if (isWhatCanIGet || isLifeEvent) return true;

    if (page === 1) {
      if (formData.fullName !== undefined && String(formData.fullName).trim() === '') {
        setValidationError(t('nameRequired', 'Please enter your full name.'));
        return false;
      }
      if (formData.age === undefined || formData.age === null || String(formData.age).trim() === '' || isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
        setValidationError(t('validAgeRequired', 'Please enter a valid age between 1 and 120.'));
        return false;
      }
      if (!formData.gender) {
        setValidationError(t('genderRequired', 'Please select your gender.'));
        return false;
      }
    } else if (page === 2) {
      if (!formData.state || !formData.district) {
        setValidationError(t('locationRequired', 'Please select both your state and district.'));
        return false;
      }
    } else if (page === 3) {
      if (formData.annualIncome === undefined || formData.annualIncome === null || String(formData.annualIncome).trim() === '' || isNaN(Number(formData.annualIncome)) || Number(formData.annualIncome) < 0) {
        setValidationError(t('incomeRequired', 'Please enter your annual household income (0 or above).'));
        return false;
      }
      if (!formData.category) {
        setValidationError(t('categoryRequired', 'Please select your social category.'));
        return false;
      }
    } else if (page === 4) {
      if (!formData.occupation) {
        setValidationError(t('occupationRequired', 'Please select your primary occupation.'));
        return false;
      }
    }
    return true;
  }, [page, formData, isWhatCanIGet, isLifeEvent, t]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) return;
    setPage(prev => (prev[0] < 5 ? [prev[0] + 1, 1] : prev));
  }, [validateCurrentStep]);
  
  const prevStep = useCallback(() => {
    setValidationError(null);
    setApiError(null);
    setPage(prev => (prev[0] > 1 ? [prev[0] - 1, -1] : prev));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!validateCurrentStep()) return;

    const dataToSubmit: Partial<UserProfile> = {
      ...formData,
      fullName: formData.fullName?.trim() || user?.fullName || 'Guest Citizen'
    };

    if (!isWhatCanIGet && !isLifeEvent) {
      const missing = getMissingProfileFields(dataToSubmit);
      if (missing.length > 0) {
        setValidationError(t('missingRequiredFields', `Please fill all required profile fields before saving: ${missing.join(', ')}`));
        return;
      }
    }

    setValidationError(null);
    setApiError(null);
    setIsSubmitting(true);

    try {
      await onComplete(dataToSubmit);
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('Failed to save citizen profile:', err);
      setIsSubmitting(false);
      setSubmitSuccess(false);
      setApiError(err?.message || t('profileSaveFailed', 'Failed to save profile. Please check your network connection and try again.'));
    }
  }, [formData, isSubmitting, validateCurrentStep, onComplete, isWhatCanIGet, isLifeEvent, t]);

  const steps = useMemo(() => [
    { id: 1, title: t('wizardPersonal', 'Personal') },
    { id: 2, title: t('wizardLocation', 'Location') },
    { id: 3, title: t('wizardIncome', 'Income') },
    { id: 4, title: t('wizardOccupation', 'Occupation') },
    { id: 5, title: t('wizardNeeds', 'Needs') },
  ], [t]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };
  
  const displaySteps = useMemo(() => isWhatCanIGet 
    ? [{ id: 1, title: t('whatDoYouNeed', 'What do you need?') }] 
    : isLifeEvent 
    ? [{ id: 1, title: t('lifeEvent', 'Life Event') }]
    : steps, [isWhatCanIGet, isLifeEvent, steps, t]);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateForm('age', val === '' ? '' : parseInt(val, 10));
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateForm('annualIncome', val === '' ? '' : parseInt(val, 10));
  };
  
  const handleLandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateForm('landHoldingAcres', val === '' ? '' : parseFloat(val));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F] flex flex-col">
      <div className="bg-white dark:bg-[#0F1B2D] border-b border-gray-200 dark:border-gray-800 px-6 py-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-gray-800 -z-10 rounded" />
            <motion.div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1769FF] -z-10 rounded" 
              initial={{ width: 0 }}
              animate={{ width: `${((page - 1) / Math.max(1, steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
            {displaySteps.map((s) => {
              const isActive = s.id === page;
              const isCompleted = s.id < page;
              return (
                <div key={s.id} className="flex flex-col items-center bg-white dark:bg-[#0F1B2D] px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isActive ? 'bg-[#1769FF] text-white border-2 border-[#1769FF]' : isCompleted ? 'bg-[#15803D] text-white border-2 border-[#15803D]' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 border-2 border-gray-200 dark:border-gray-700'}`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : `0${s.id}`}
                  </div>
                  <span className={`hidden sm:block mt-2 text-xs font-semibold ${isActive ? 'text-[#123C69] dark:text-white' : 'text-gray-500'}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 sm:p-12 overflow-x-hidden">
        <div className="w-full max-w-2xl relative min-h-[400px]">
          {/* Validation & Feedback Banners */}
          {validationError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
              <span>{validationError}</span>
            </div>
          )}

          {apiError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
                <span>{apiError}</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="shrink-0 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition"
              >
                {t('retry', 'Retry')}
              </button>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm flex items-center gap-3">
              <Check className="w-5 h-5 shrink-0 text-green-600 dark:text-green-400" />
              <span className="font-semibold">{t('profileSavedSuccess', 'Profile saved successfully! Redirecting to scheme recommendations...')}</span>
            </div>
          )}

          <AnimatePresence custom={direction} mode="wait">
            <motion.div 
              key={page} 
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {isWhatCanIGet && page === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('whatHelpTitle', 'What do you need help with?')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('whatHelpDesc', 'Select the areas where you are looking for government support.')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['Education', 'Job', 'Business', 'Farming', 'Healthcare', 'Housing', 'Financial Support', 'Women & Child Welfare', 'Skill Development', 'Pension', 'Disability Support'].map(need => (
                      <button 
                        key={need}
                        type="button"
                        onClick={() => {
                          const current = formData.interests || [];
                          if(current.includes(need)) updateForm('interests', current.filter(n => n !== need));
                          else updateForm('interests', [...current, need]);
                        }}
                        className={`p-4 rounded border text-left text-sm font-medium transition-colors ${(formData.interests || []).includes(need) ? 'border-[#15803D] bg-[#15803D]/5 text-[#15803D]' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#15803D]/50'}`}
                      >
                        {t(need, need)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLifeEvent && page === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('lifeEventTitle', 'What\'s happening in your life?')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('lifeEventDesc', 'Select a life event to find relevant schemes.')}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "I'm starting college", interest: "Education", occupation: "Student" },
                      { label: "I'm looking for a job", interest: "Employment", occupation: "Unemployed" },
                      { label: "I'm starting a business", interest: "Business", occupation: "Entrepreneur" },
                      { label: "I'm a farmer", interest: "Agriculture", occupation: "Farmer" },
                      { label: "I'm getting married", interest: "Financial Support", occupation: "" },
                      { label: "I need healthcare support", interest: "Healthcare", occupation: "" },
                      { label: "I'm buying/building a house", interest: "Housing", occupation: "" },
                      { label: "I'm approaching retirement", interest: "Pension", occupation: "Retired" }
                    ].map(event => (
                      <button 
                        key={event.label}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            interests: [event.interest],
                            occupation: event.occupation || prev.occupation
                          }));
                        }}
                        className={`p-4 rounded border text-left text-sm font-medium transition-colors ${formData.interests?.includes(event.interest) ? 'border-[#1769FF] bg-[#1769FF]/5 text-[#1769FF]' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#1769FF]/50'}`}
                      >
                        {t(event.label, event.label)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isWhatCanIGet && !isLifeEvent && page === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('personalInfo', 'Personal Information')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('personalInfoDesc', 'Basic details help us filter out irrelevant schemes.')}</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('fullName', 'Full Name')}</label>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName || ''} 
                        onChange={e => updateForm('fullName', e.target.value)} 
                        className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all" 
                        placeholder={t('namePlaceholder', 'e.g. Ramesh Kumar')} 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('age', 'Age')} *</label>
                        <input type="number" name="age" min="1" max="120" value={formData.age ?? ''} onChange={handleAgeChange} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all" placeholder="e.g. 25" required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('mobile', 'Mobile Number')}</label>
                        <input type="tel" name="mobile" value={formData.mobile || ''} onChange={e => updateForm('mobile', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all" placeholder="e.g. 9876543210" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('gender', 'Gender')} *</label>
                        <select name="gender" value={formData.gender || ''} onChange={e => updateForm('gender', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none" required>
                          <option value="">{t('select', 'Select')}</option>
                          <option value="Male">{t('Male', 'Male')}</option>
                          <option value="Female">{t('Female', 'Female')}</option>
                          <option value="Other">{t('Other', 'Other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('maritalStatus', 'Marital Status')}</label>
                        <select name="maritalStatus" value={formData.maritalStatus || ''} onChange={e => updateForm('maritalStatus', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none">
                          <option value="">{t('select', 'Select')}</option>
                          <option value="Single">{t('Single', 'Single')}</option>
                          <option value="Married">{t('Married', 'Married')}</option>
                          <option value="Widowed">{t('Widowed', 'Widowed')}</option>
                          <option value="Divorced">{t('Divorced', 'Divorced')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isWhatCanIGet && !isLifeEvent && page === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('wizardLocation', 'Location')} *</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('locationDesc', 'State-level schemes require precise location data.')}</p>
                  </div>
                  <div className="space-y-6">
                    <LocationSelector 
                      state={formData.state || ''}
                      district={formData.district || ''}
                      onStateChange={(state) => updateForm('state', state)}
                      onDistrictChange={(district) => updateForm('district', district)}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('residenceArea', 'Area of Residence')}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Rural', 'Urban', 'Semi-Urban'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => updateForm('residenceType', type)}
                            className={`p-3 rounded border text-center text-sm font-medium transition-colors ${formData.residenceType === type ? 'border-[#1769FF] bg-[#1769FF]/10 text-[#1769FF] font-bold' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#1769FF]/50'}`}
                          >
                            {t(type, type)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isWhatCanIGet && !isLifeEvent && page === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('economicInfo', 'Economic Information')} *</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('economicInfoDesc', 'Financial assistance is heavily dependent on income limits.')}</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('annualHouseholdIncome', 'Annual Household Income (₹)')} *</label>
                      <input type="number" min="0" name="annualIncome" value={formData.annualIncome ?? ''} onChange={handleIncomeChange} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all" placeholder={t('egIncome', 'e.g. 150000')} required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('socialCategory', 'Social Category')} *</label>
                      <select name="category" value={formData.category || ''} onChange={e => updateForm('category', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none" required>
                        <option value="">{t('selectCategory', 'Select Category')}</option>
                        <option value="General">{t('General', 'General')}</option>
                        <option value="OBC">{t('OBC', 'OBC')}</option>
                        <option value="SC">{t('SC', 'SC')}</option>
                        <option value="ST">{t('ST', 'ST')}</option>
                        <option value="EWS">{t('EWS', 'EWS')}</option>
                        <option value="Minority">{t('Minority', 'Minority')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!isWhatCanIGet && !isLifeEvent && page === 4 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('wizardOccupation', 'Occupation')} *</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('occupationDesc', 'Select your current primary occupation.')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['Student', 'Farmer', 'Worker', 'Entrepreneur', 'Government', 'Private Sector', 'Unemployed', 'Retired'].map(occ => (
                      <button 
                        key={occ} 
                        type="button"
                        onClick={() => updateForm('occupation', occ)}
                        className={`p-4 rounded border text-left text-sm font-medium transition-colors ${formData.occupation === occ ? 'border-[#1769FF] bg-[#1769FF]/5 text-[#1769FF]' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#1769FF]/50'}`}
                      >
                        {t(occ, occ)}
                      </button>
                    ))}
                  </div>

                  {formData.occupation === 'Student' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4">
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('educationLevel', 'Education Level')}</label>
                      <select name="educationLevel" value={formData.educationLevel || ''} onChange={e => updateForm('educationLevel', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none">
                        <option value="">{t('selectLevel', 'Select Level')}</option>
                        <option value="High School">{t('HighSchool', 'High School')}</option>
                        <option value="Undergraduate">{t('Undergraduate', 'Undergraduate')}</option>
                        <option value="Postgraduate">{t('Postgraduate', 'Postgraduate')}</option>
                      </select>
                    </motion.div>
                  )}

                  {formData.occupation === 'Farmer' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4">
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('landHolding', 'Land Holding (in Acres)')}</label>
                      <input type="number" min="0" step="0.1" name="landHoldingAcres" value={formData.landHoldingAcres ?? ''} onChange={handleLandChange} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none" placeholder={t('egLand', 'e.g. 2.5')} />
                    </motion.div>
                  )}
                </div>
              )}

              {!isWhatCanIGet && !isLifeEvent && page === 5 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('wizardNeeds', 'Needs & Interests')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('needsDesc', 'Select all areas you are looking for assistance in.')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['Education', 'Employment', 'Agriculture', 'Healthcare', 'Housing', 'Women & Child', 'Financial'].map(need => (
                      <button 
                        key={need}
                        type="button"
                        onClick={() => {
                          const current = formData.interests || [];
                          if(current.includes(need)) {
                            updateForm('interests', current.filter(n => n !== need));
                          } else {
                            updateForm('interests', [...current, need]);
                          }
                        }}
                        className={`p-4 rounded border text-left text-sm font-medium transition-colors ${(formData.interests || []).includes(need) ? 'border-[#15803D] bg-[#15803D]/5 text-[#15803D]' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#15803D]/50'}`}
                      >
                        {t(need, need)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F1B2D] border-t border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center max-w-5xl mx-auto w-full">
        {page > 1 ? (
          <button 
            type="button" 
            onClick={prevStep} 
            disabled={isSubmitting || submitSuccess}
            className="px-6 py-3 rounded text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" /> {t('back', 'Back')}
          </button>
        ) : (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting || submitSuccess}
            className="px-6 py-3 rounded text-gray-500 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {t('cancel', 'Cancel')}
          </button>
        )}

        {(isWhatCanIGet || isLifeEvent || page < 5) ? (
          <button 
            type="button"
            onClick={isWhatCanIGet || isLifeEvent ? handleSubmit : nextStep} 
            disabled={isSubmitting || submitSuccess}
            className="px-8 py-3 rounded bg-[#1769FF] text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t('saving', 'Saving Profile...')}</>
            ) : submitSuccess ? (
              <><Check className="w-5 h-5" /> {t('success', 'Saved!')}</>
            ) : (
              <>{isWhatCanIGet || isLifeEvent ? t('saveAndRecommendations', 'Save & View Schemes') : t('continue', 'Continue')} <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleSubmit} 
            disabled={isSubmitting || submitSuccess}
            className={`px-8 py-3 rounded text-white font-semibold transition-colors flex items-center gap-2 disabled:opacity-70 cursor-pointer ${submitSuccess ? 'bg-green-600' : 'bg-[#15803D] hover:bg-green-700'}`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t('savingProfile', 'Saving Profile...')}</>
            ) : submitSuccess ? (
              <><Check className="w-5 h-5" /> {t('success', 'Saved!')}</>
            ) : apiError ? (
              <><Save className="w-5 h-5" /> {t('retrySaveProfile', 'Retry Save Profile')} <ChevronRight className="w-5 h-5" /></>
            ) : (
              <><Save className="w-5 h-5" /> {t('saveProfileViewRecs', 'Save Profile & View Schemes')} <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
