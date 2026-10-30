import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Building,
  Tag,
  Gift,
  UserCheck,
  MapPin,
  FileText,
  ListOrdered,
  Calendar,
  Globe,
  Phone,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Scheme } from '../types';

interface SchemeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemes: Scheme[];
  onRemoveScheme?: (schemeId: string) => void;
  onClearAll?: () => void;
  onApplyScheme?: (scheme: Scheme) => void;
}

export const SchemeComparisonModal: React.FC<SchemeComparisonModalProps> = ({
  isOpen,
  onClose,
  schemes,
  onRemoveScheme,
  onClearAll,
  onApplyScheme
}) => {
  const { t } = useTranslation();

  if (!isOpen || schemes.length === 0) return null;

  const handleApply = (scheme: Scheme) => {
    if (onApplyScheme) {
      onClose();
      onApplyScheme(scheme);
    } else if (scheme.officialApplyUrl || scheme.officialWebsite) {
      window.open(scheme.officialApplyUrl || scheme.officialWebsite, '_blank', 'noopener,noreferrer');
    }
  };

  const formatAgeEligibility = (s: Scheme) => {
    const min = s.eligibilityRules.minAge ?? s.eligibilityRules.ageMin;
    const max = s.eligibilityRules.maxAge ?? s.eligibilityRules.ageMax;
    if (min !== undefined && max !== undefined) return `${min} – ${max} years`;
    if (min !== undefined) return `Min ${min} years`;
    if (max !== undefined) return `Max ${max} years`;
    return 'No age restriction';
  };

  const formatIncomeEligibility = (s: Scheme) => {
    const limit = s.eligibilityRules.maxAnnualIncome ?? s.eligibilityRules.incomeLimit;
    if (limit !== undefined && limit > 0) return `Up to ₹${limit.toLocaleString('en-IN')}/year`;
    return 'No strict income ceiling';
  };

  const formatOccupations = (s: Scheme) => {
    const occs = s.eligibilityRules.allowedOccupations || s.eligibilityRules.occupation;
    if (Array.isArray(occs) && occs.length > 0) return occs.join(', ');
    if (typeof occs === 'string' && occs) return occs;
    return 'All occupations';
  };

  const formatCategories = (s: Scheme) => {
    const cats = s.eligibilityRules.allowedCategories || s.eligibilityRules.category;
    if (Array.isArray(cats) && cats.length > 0) return cats.join(', ');
    if (typeof cats === 'string' && cats) return cats;
    return 'All categories (General, OBC, SC, ST)';
  };

  const getRequiredDocs = (s: Scheme): string[] => {
    const docs = s.requiredDocuments || s.eligibilityRules?.requiredDocuments || [];
    return docs.length > 0 ? docs : ['Aadhaar Card', 'Income Certificate', 'Bank Passbook'];
  };

  const getApplicationSteps = (s: Scheme): string[] => {
    const steps = s.applicationSteps || [];
    return steps.length > 0 ? steps : ['Visit official portal', 'Fill application form', 'Upload documents', 'Submit and track'];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#07111F]/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="bg-white dark:bg-[#0F1B2D] w-full max-w-7xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800 gap-4 bg-slate-50 dark:bg-slate-900/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {schemes.length} / 4 Schemes
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#123C69] dark:text-white font-sans">
                  {t('compareSchemes', 'Side-by-Side Scheme Comparison')}
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('compareDesc', 'Comprehensive 11-point evaluation across ministry, eligibility, benefits, steps, and official portal.')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {onClearAll && schemes.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('clearAll', 'Clear All')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close comparison modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto p-4 sm:p-6 flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-3 sm:p-4 w-44 sm:w-56 border-b-2 border-gray-300 dark:border-gray-700 font-extrabold text-gray-400 uppercase text-[11px] tracking-wider align-bottom bg-slate-50/50 dark:bg-slate-900/40">
                    {t('feature', 'Scheme Parameter')}
                  </th>
                  {schemes.map((s) => (
                    <th
                      key={s.id}
                      className="p-3 sm:p-4 min-w-[240px] max-w-[320px] border-b-2 border-gray-300 dark:border-gray-700 align-top bg-blue-50/20 dark:bg-blue-950/10 relative"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {t(s.category, s.category)}
                        </span>
                        {onRemoveScheme && schemes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onRemoveScheme(s.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-gray-400 hover:text-red-600 transition"
                            title="Remove from comparison"
                            aria-label={`Remove ${s.name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2">
                        {t(`${s.id}_name`, s.name)}
                      </h3>

                      <button
                        type="button"
                        onClick={() => handleApply(s)}
                        className="mt-3 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
                      >
                        <span>{t('applyNow', 'Apply Now')}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                {/* 1. Scheme Name */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>1. Scheme Name</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 font-bold text-gray-900 dark:text-white">
                      {s.name}
                    </td>
                  ))}
                </tr>

                {/* 2. Department / Ministry */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>2. Department / Ministry</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 text-gray-700 dark:text-gray-300">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {s.department || s.ministry || 'Not Available'}
                      </p>
                      {s.ministry && s.department && s.ministry !== s.department && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {s.ministry}
                        </p>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 3. Category */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>3. Category</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 font-semibold text-gray-800 dark:text-gray-200">
                      {s.category || 'Not Available'}
                    </td>
                  ))}
                </tr>

                {/* 4. Benefits */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300 align-top">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>4. Benefits</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 align-top space-y-1.5">
                      {s.financialBenefitAmount ? (
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          ₹{s.financialBenefitAmount.toLocaleString('en-IN')}/year
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Subsidized / In-Kind Welfare Benefit
                        </div>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {s.benefitsSummary || 'Statutory welfare subsidy & direct entitlement.'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* 5. Eligibility */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300 align-top">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>5. Eligibility Criteria</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 align-top space-y-1 text-[11px]">
                      <div>
                        <span className="font-bold text-gray-500">Age: </span>
                        <span className="text-gray-800 dark:text-gray-200">{formatAgeEligibility(s)}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-500">Income: </span>
                        <span className="text-gray-800 dark:text-gray-200">{formatIncomeEligibility(s)}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-500">Occupation: </span>
                        <span className="text-gray-800 dark:text-gray-200">{formatOccupations(s)}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-500">Category: </span>
                        <span className="text-gray-800 dark:text-gray-200">{formatCategories(s)}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 6. Residence Requirements */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                      <span>6. Residence Scope</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 text-gray-800 dark:text-gray-200 font-medium">
                      {s.state === 'Central' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                          ✓ All India (Central Scheme)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                          State Specific ({s.state})
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 7. Required Documents */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300 align-top">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>7. Required Documents</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 align-top">
                      <ul className="space-y-1">
                        {getRequiredDocs(s).map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* 8. Application Process */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300 align-top">
                    <div className="flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>8. Application Process</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 align-top">
                      <ol className="space-y-1 list-decimal list-inside text-gray-700 dark:text-gray-300">
                        {getApplicationSteps(s).map((step, idx) => (
                          <li key={idx} className="leading-snug">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </td>
                  ))}
                </tr>

                {/* 9. Application Deadline */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>9. Application Deadline</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4 text-gray-800 dark:text-gray-200 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{s.deadline || 'Ongoing / No fixed deadline'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 10. Official Portal */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>10. Official Portal</span>
                    </div>
                  </td>
                  {schemes.map((s) => {
                    const portalUrl = s.officialApplyUrl || s.officialWebsite;
                    return (
                      <td key={s.id} className="p-3 sm:p-4">
                        {portalUrl ? (
                          <button
                            type="button"
                            onClick={() => handleApply(s)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1 text-xs break-all text-left"
                          >
                            <span>Open Portal</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">Not Available</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 11. Helpline */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 sm:p-4 font-bold text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-600 shrink-0" />
                      <span>11. Helpline / Support</span>
                    </div>
                  </td>
                  {schemes.map((s) => (
                    <td key={s.id} className="p-3 sm:p-4">
                      {s.helplineNumber ? (
                        <a
                          href={`tel:${s.helplineNumber.replace(/[^0-9+]/g, '')}`}
                          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{s.helplineNumber}</span>
                        </a>
                      ) : (
                        <span className="text-gray-500 font-mono text-[11px]">1800-11-0001 (National Helpdesk)</span>
                      )}
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
