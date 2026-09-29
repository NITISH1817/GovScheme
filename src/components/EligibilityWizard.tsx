import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { LocationSelector } from './LocationSelector';

interface EligibilityWizardProps {
  user: UserProfile | null;
  mode?: 'wizard' | 'life-event' | 'what-can-i-get' | 'ai-interview';
  onComplete: (profile: Partial<UserProfile>) => void;
  onCancel: () => void;
}

export const EligibilityWizard: React.FC<EligibilityWizardProps> = ({ user, mode = 'wizard', onComplete, onCancel }) => {
  const { t } = useTranslation();
  const [[page, direction], setPage] = useState([1, 0]);
  const [formData, setFormData] = useState<Partial<UserProfile>>(
    user || {
      age: 25,
      gender: 'Male',
      maritalStatus: 'Single',
      state: '',
      district: '',
      annualIncome: 0,
      occupation: '',
      interests: []
    }
  );

  const updateForm = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (page < 5) setPage([page + 1, 1]);
  };
  
  const prevStep = () => {
    if (page > 1) setPage([page - 1, -1]);
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const steps = [
    { id: 1, title: t('wizardPersonal', 'Personal') },
    { id: 2, title: t('wizardLocation', 'Location') },
    { id: 3, title: t('wizardIncome', 'Income') },
    { id: 4, title: t('wizardOccupation', 'Occupation') },
    { id: 5, title: t('wizardNeeds', 'Needs') },
  ];

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

  const isWhatCanIGet = mode === 'what-can-i-get';
  const isLifeEvent = mode === 'life-event';
  
  // If in quick modes, skip standard steps
  const displaySteps = isWhatCanIGet 
    ? [{ id: 1, title: t('whatDoYouNeed', 'What do you need?') }] 
    : isLifeEvent 
    ? [{ id: 1, title: t('lifeEvent', 'Life Event') }]
    : steps;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F] flex flex-col">
      {/* Header / Stepper */}
      <div className="bg-white dark:bg-[#0F1B2D] border-b border-gray-200 dark:border-gray-800 px-6 py-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-gray-800 -z-10 rounded" />
            <motion.div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1769FF] -z-10 rounded" 
              initial={{ width: 0 }}
              animate={{ width: `${((page - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
            {displaySteps.map((s, i) => {
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-6 sm:p-12 overflow-x-hidden">
        <div className="w-full max-w-2xl relative min-h-[400px]">
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
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('age', 'Age')}</label>
                      <input type="number" value={formData.age || ''} onChange={e => updateForm('age', parseInt(e.target.value))} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] focus:border-transparent outline-none transition-all" placeholder="e.g. 25" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('gender', 'Gender')}</label>
                        <select value={formData.gender || ''} onChange={e => updateForm('gender', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none">
                          <option value="">{t('select', 'Select')}</option>
                          <option value="Male">{t('Male', 'Male')}</option>
                          <option value="Female">{t('Female', 'Female')}</option>
                          <option value="Other">{t('Other', 'Other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('maritalStatus', 'Marital Status')}</label>
                        <select value={formData.maritalStatus || ''} onChange={e => updateForm('maritalStatus', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none">
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
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('wizardLocation', 'Location')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('locationDesc', 'State-level schemes require precise location data.')}</p>
                  </div>
                  <div className="space-y-6">
                    <LocationSelector 
                      state={formData.state || ''}
                      district={formData.district || ''}
                      onStateChange={(state) => updateForm('state', state)}
                      onDistrictChange={(district) => updateForm('district', district)}
                    />
                  </div>
                </div>
              )}

              {!isWhatCanIGet && !isLifeEvent && page === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('economicInfo', 'Economic Information')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('economicInfoDesc', 'Financial assistance is heavily dependent on income limits.')}</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('annualHouseholdIncome', 'Annual Household Income (₹)')}</label>
                      <input type="number" value={formData.annualIncome || ''} onChange={e => updateForm('annualIncome', parseInt(e.target.value))} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none transition-all" placeholder={t('egIncome', 'e.g. 150000')} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('socialCategory', 'Social Category')}</label>
                      <select value={formData.category || ''} onChange={e => updateForm('category', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none">
                        <option value="">{t('selectCategory', 'Select Category')}</option>
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!isWhatCanIGet && !isLifeEvent && page === 4 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('wizardOccupation', 'Occupation')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('occupationDesc', 'Select your current primary occupation.')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['Student', 'Farmer', 'Worker', 'Entrepreneur', 'Government', 'Private Sector', 'Unemployed', 'Retired'].map(occ => (
                      <button 
                        key={occ} 
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
                      <select value={formData.educationLevel || ''} onChange={e => updateForm('educationLevel', e.target.value)} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none">
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
                      <input type="number" value={formData.landHoldingAcres || ''} onChange={e => updateForm('landHoldingAcres', parseFloat(e.target.value))} className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none" placeholder={t('egLand', 'e.g. 2.5')} />
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

      {/* Footer Navigation */}
      <div className="bg-white dark:bg-[#0F1B2D] border-t border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center max-w-5xl mx-auto w-full">
        {page > 1 ? (
          <button onClick={prevStep} className="px-6 py-3 rounded text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" /> {t('back', 'Back')}
          </button>
        ) : (
          <button onClick={onCancel} className="px-6 py-3 rounded text-gray-500 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {t('cancel', 'Cancel')}
          </button>
        )}

        {(isWhatCanIGet || isLifeEvent || page < 5) ? (
          <button onClick={isWhatCanIGet || isLifeEvent ? handleSubmit : nextStep} className="px-8 py-3 rounded bg-[#1769FF] text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            {isWhatCanIGet || isLifeEvent ? t('viewResults', 'View Results') : t('continue', 'Continue')} <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={handleSubmit} className="px-8 py-3 rounded bg-[#15803D] text-white font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
            {t('viewResults', 'View Results')} <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
