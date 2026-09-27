import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, ChevronRight, ShieldCheck, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '../types';

interface KioskModeProps {
  onGenerateReport: (profile: Partial<UserProfile>) => void;
  onExit: () => void;
}

export const KioskMode: React.FC<KioskModeProps> = ({ onGenerateReport, onExit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    mobile: '',
    state: '',
    income: '',
    occupation: ''
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateReport({
      fullName: formData.fullName,
      age: Number(formData.age),
      mobile: formData.mobile,
      state: formData.state,
      annualIncome: Number(formData.income),
      occupation: formData.occupation
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F]">
      
      {/* Kiosk Header */}
      <header className="bg-[#123C69] text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
              <Users className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{t('cscAssistedMode', 'CSC Assisted Mode')}</h1>
              <p className="text-xs text-blue-200">{t('cscOperator', 'Authorized Common Service Centre Operator')}</p>
            </div>
          </div>
          <button onClick={onExit} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-bold transition-colors">
            {t('exitKiosk', 'Exit Kiosk')}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#0F1B2D] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center gap-2 mb-6 text-[#15803D]">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider text-sm">{t('secureSearch', 'Secure Beneficiary Search')}</span>
          </div>

          <h2 className="text-3xl font-bold text-[#123C69] dark:text-white mb-2">{t('helpSomeoneFind', 'Help someone find schemes')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('helpSomeoneDesc', "Enter the citizen's basic details to instantly generate a personalized, printable eligibility report. No permanent account creation required.")}
          </p>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">{t('citizenName', 'Citizen Name')}</label>
                <input 
                  required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-3 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-300 dark:border-gray-700 focus:border-[#1769FF] outline-none text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">{t('mobileOptional', 'Mobile Number (Optional)')}</label>
                <input 
                  type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})}
                  className="w-full p-3 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-300 dark:border-gray-700 focus:border-[#1769FF] outline-none text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">{t('yourAge', 'Age')}</label>
                <input 
                  required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full p-3 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-300 dark:border-gray-700 focus:border-[#1769FF] outline-none text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">{t('state', 'State')}</label>
                <input 
                  required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder={t('statePlaceholder', 'e.g. Tamil Nadu')}
                  className="w-full p-3 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-300 dark:border-gray-700 focus:border-[#1769FF] outline-none text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">{t('yourOccupation', 'Occupation')}</label>
                <input 
                  required type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} placeholder={t('occupationPlaceholder', 'e.g. Farmer, Student')}
                  className="w-full p-3 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-300 dark:border-gray-700 focus:border-[#1769FF] outline-none text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">{t('annualIncomeLabel', 'Annual Family Income (₹)')}</label>
                <input 
                  required type="number" value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})}
                  className="w-full p-3 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-300 dark:border-gray-700 focus:border-[#1769FF] outline-none text-gray-900 dark:text-white"
                />
              </div>

            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-4">
              <button 
                type="submit"
                className="flex-1 py-4 bg-[#15803D] hover:bg-green-700 text-white font-bold rounded shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" /> {t('genAssessmentReport', 'Generate Assessment Report')}
              </button>
            </div>

            <div className="text-center">
              <button type="button" className="text-sm font-semibold text-[#1769FF] hover:underline flex items-center justify-center gap-1 mx-auto">
                <Printer className="w-4 h-4" /> {t('connectPrinter', 'Connect Bluetooth Printer')}
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};
