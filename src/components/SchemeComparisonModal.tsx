import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Scheme } from '../types';

interface SchemeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemes: Scheme[];
}

export const SchemeComparisonModal: React.FC<SchemeComparisonModalProps> = ({ isOpen, onClose, schemes }) => {
  const { t } = useTranslation();

  if (!isOpen || schemes.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111F]/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white dark:bg-[#0F1B2D] w-full max-w-6xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-[#123C69] dark:text-white font-sans">{t('compareSchemes', 'Compare Schemes')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('compareDesc', 'Review up to 3 schemes side-by-side to find the best fit.')}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto p-6 flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 w-48 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-400 uppercase text-xs tracking-wider">{t('feature', 'Feature')}</th>
                  {schemes.map(s => (
                    <th key={s.id} className="p-4 min-w-[250px] border-b border-gray-200 dark:border-gray-800 align-top">
                      <div className="text-xs font-semibold text-[#1769FF] mb-2">{t(s.category, s.category).split('&')[0]}</div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{t(`${s.id}_name`, s.name)}</h3>
                      <button 
                        onClick={() => window.open(s.officialApplyUrl || '#', '_blank')}
                        className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded transition-colors"
                      >
                        {t('applyNow', 'Apply Now')}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                <tr>
                  <td className="p-4 font-semibold text-gray-500 text-sm">{t('govtLevel', 'Government Level')}</td>
                  {schemes.map(s => (
                    <td key={s.id} className="p-4 text-sm text-gray-900 dark:text-white font-medium">
                      {s.state === 'Central' ? t('centralGovt', 'Central Government') : `${t('stateGovt', 'State')} (${s.state})`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 text-sm">{t('financialBenefit', 'Financial Benefit')}</td>
                  {schemes.map(s => (
                    <td key={s.id} className="p-4">
                      {s.financialBenefitAmount ? (
                        <span className="text-sm font-bold text-[#15803D]">₹{s.financialBenefitAmount.toLocaleString('en-IN')}/{t('year', 'year')}</span>
                      ) : (
                        <span className="text-sm text-gray-500 italic">{t('variesNonFin', 'Varies / Non-financial')}</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 text-sm align-top">{t('keyReqs', 'Key Requirements')}</td>
                  {schemes.map(s => (
                    <td key={s.id} className="p-4 align-top">
                      <ul className="space-y-2">
                        {s.eligibilityRules.requiredDocuments.slice(0, 3).map((doc, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                            <span>{t(doc, doc)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 text-sm align-top">{t('appProcess', 'Application Process')}</td>
                  {schemes.map(s => (
                    <td key={s.id} className="p-4 align-top">
                      <ul className="space-y-2">
                        {s.applicationSteps.slice(0, 3).map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold shrink-0">{i+1}</span>
                            <span>{t(step, step)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-500 text-sm">{t('deadline', 'Deadline')}</td>
                  {schemes.map(s => (
                    <td key={s.id} className="p-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#D97706]" />
                        {t(s.deadline, s.deadline)}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
