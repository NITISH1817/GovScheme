import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  Briefcase,
  IndianRupee,
  Building,
  Tag,
  ExternalLink,
  ShieldCheck,
  Award,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, Scheme } from '../types';
import {
  generateAssessment,
  generateAssessmentPDF,
  CitizenAssessmentResult
} from '../services/assessmentService';

interface CitizenAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  schemes: Scheme[];
  onNavigateTab?: (tab: string) => void;
}

export const CitizenAssessmentModal: React.FC<CitizenAssessmentModalProps> = ({
  isOpen,
  onClose,
  user,
  schemes,
  onNavigateTab
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'notApplicable'>('recommended');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const assessment: CitizenAssessmentResult = useMemo(() => {
    return generateAssessment(user, schemes);
  }, [user, schemes]);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPdf(true);
      const pdf = generateAssessmentPDF(assessment);
      pdf.save(`GovScheme_Assessment_Report_${assessment.assessmentId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full my-4 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:m-0 print:border-none print:shadow-none"
        >
          {/* Header */}
          <div className="bg-[#123C69] text-white p-5 sm:p-6 relative shrink-0 print:bg-white print:text-black print:border-b-2 print:border-slate-900">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-blue-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition print:hidden"
              aria-label="Close report modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-blue-200 px-2.5 py-0.5 rounded-md border border-white/20">
                    GOVSCHEME OFFICIAL REPORT
                  </span>
                  <span className="text-[11px] text-blue-200 font-mono">
                    Ref: {assessment.assessmentId}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white print:text-black">
                  Citizen Assessment & Eligibility Report
                </h2>
                <p className="text-xs text-blue-100/80 mt-0.5">
                  Evaluation Date: {assessment.assessmentDate} • Deterministic Statutory Rule Engine
                </p>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto print:hidden">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#123C69] font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  title="Download authentic A4 PDF assessment report"
                >
                  <Download className="w-4 h-4 text-[#1769FF]" />
                  <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  title="Print official assessment report"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs print:overflow-visible">
            {/* Incomplete Profile Advisory Banner */}
            {!assessment.citizen.isProfileComplete && assessment.citizen.missingFields.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">
                      Limited Assessment: Missing Profile Attributes
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      The following attributes are currently missing from your profile: <strong className="underline">{assessment.citizen.missingFields.join(', ')}</strong>.
                      Providing these enables 100% accurate scheme discovery.
                    </p>
                  </div>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateTab('profile');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap self-end sm:self-auto print:hidden"
                  >
                    Complete Profile
                  </button>
                )}
              </div>
            )}

            {/* Citizen Profile Overview Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Citizen Demographic & Socio-Economic Information
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Profile Completeness: <strong className="text-emerald-600 dark:text-emerald-400">{assessment.citizen.profileCompleteness}%</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{assessment.citizen.fullName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Age & Gender</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {assessment.citizen.age ? `${assessment.citizen.age} yrs` : 'Not Set'} • {assessment.citizen.gender || 'Not Set'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">State & District</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {assessment.citizen.state}{assessment.citizen.district ? `, ${assessment.citizen.district}` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Occupation</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{assessment.citizen.occupation}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Family Income</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {assessment.citizen.annualIncome !== undefined
                      ? `₹${Number(assessment.citizen.annualIncome).toLocaleString('en-IN')}/year`
                      : 'Not Set'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Social Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{assessment.citizen.category || 'General'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Land Holding</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {assessment.citizen.landHoldingAcres ? `${assessment.citizen.landHoldingAcres} Acres` : '0 Acres (Landless)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Disability Status</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {assessment.citizen.hasDisability
                      ? `Yes (${assessment.citizen.disabilityPercentage || 40}%)`
                      : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scheme Evaluation Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Recommended */}
              <div
                onClick={() => setActiveTab('recommended')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  activeTab === 'recommended'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Recommended Schemes
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  {assessment.statistics.totalRecommendedCount}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Fully or conditionally matched to your verified eligibility criteria.
                </p>
              </div>

              {/* Card 2: Total Evaluated */}
              <div
                onClick={() => setActiveTab('all')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Total Evaluated
                  </span>
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-blue-700 dark:text-blue-400">
                  {assessment.statistics.totalEvaluated}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Full active Central and State government welfare repository.
                </p>
              </div>

              {/* Card 3: Not Applicable */}
              <div
                onClick={() => setActiveTab('notApplicable')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  activeTab === 'notApplicable'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                    Not Applicable
                  </span>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-black text-red-600 dark:text-red-400">
                  {assessment.statistics.notApplicableCount}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Schemes where one or more demographic or income conditions were not met.
                </p>
              </div>
            </div>

            {/* Scheme List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  {activeTab === 'recommended' && `Recommended Schemes (${assessment.recommendedSchemes.length})`}
                  {activeTab === 'all' && `All Evaluated Schemes (${assessment.allEvaluatedSchemes.length})`}
                  {activeTab === 'notApplicable' && `Not Applicable Schemes (${assessment.notApplicableSchemes.length})`}
                </h3>
                <span className="text-[11px] text-slate-500">
                  Showing statutory evaluation results
                </span>
              </div>

              {/* Displayed Schemes */}
              <div className="space-y-3">
                {(activeTab === 'recommended'
                  ? assessment.recommendedSchemes
                  : activeTab === 'notApplicable'
                  ? assessment.notApplicableSchemes
                  : assessment.allEvaluatedSchemes
                ).map((item) => {
                  const isEligible = item.status === 'Eligible';
                  const isCondEligible = item.status === 'Conditionally Eligible';

                  return (
                    <div
                      key={item.scheme.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                              {item.scheme.category}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {item.department}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                isEligible
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isCondEligible
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {item.scheme.name}
                          </h4>
                        </div>

                        {item.financialBenefitAmount ? (
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Annual Benefit</span>
                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                              ₹{item.financialBenefitAmount.toLocaleString('en-IN')}/yr
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        {item.benefitSummary}
                      </p>

                      {/* Criteria Explanations */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                        {item.matchedCriteria.length > 0 && (
                          <div>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">✓ Satisfied Criteria: </span>
                            <span className="text-slate-700 dark:text-slate-300">{item.matchedCriteria.join(' • ')}</span>
                          </div>
                        )}
                        {item.failedCriteria.length > 0 && (
                          <div>
                            <span className="font-bold text-red-600 dark:text-red-400">✗ Unmet Criteria: </span>
                            <span className="text-slate-700 dark:text-slate-300">{item.failedCriteria.join(' • ')}</span>
                          </div>
                        )}
                        {item.requiredDocuments.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-600 dark:text-slate-300">Required Documents: </span>
                            <span className="text-slate-600 dark:text-slate-400">{item.requiredDocuments.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Portal Link */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">
                          Verified Portal: <span className="font-mono text-slate-700 dark:text-slate-300">{item.officialUrl}</span>
                        </span>
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition print:hidden"
                        >
                          <span>Apply on Official Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Readiness Checklist */}
            {assessment.missingDocumentsChecklist.length > 0 && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
                    Application Document Readiness Checklist
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Ensure the following statutory certificates are ready or stored in your Document Vault before visiting portals:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {assessment.missingDocumentsChecklist.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                      <div className="w-4 h-4 rounded border border-slate-400 flex items-center justify-center shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-700 dark:text-slate-300">Statutory Notice: </strong>
                {assessment.disclaimer}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
            <span className="text-xs text-slate-500">
              Evaluated across {assessment.statistics.totalEvaluated} Central & State schemes
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
