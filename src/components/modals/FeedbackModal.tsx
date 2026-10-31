import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquarePlus, AlertCircle, CheckCircle2, Send, Link, FileWarning, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Scheme } from '../../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemes?: Scheme[];
  preselectedSchemeId?: string;
  preselectedIssueCategory?: string;
}

export interface CitizenFeedbackReport {
  id: string;
  category: 'incorrect_rule' | 'outdated_info' | 'broken_link' | 'missing_scheme' | 'translation_error' | 'privacy_security' | 'other';
  schemeId?: string;
  schemeName?: string;
  description: string;
  suggestedCorrection?: string;
  officialSourceUrl?: string;
  citizenEmail?: string;
  createdAt: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  resolutionNotes?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  schemes = [],
  preselectedSchemeId,
  preselectedIssueCategory
}) => {
  const { t } = useTranslation();

  const [category, setCategory] = useState<CitizenFeedbackReport['category']>(
    (preselectedIssueCategory as any) || 'incorrect_rule'
  );
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(preselectedSchemeId || '');
  const [description, setDescription] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of the issue or suggested correction.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const refNumber = `FB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const matchedScheme = schemes.find(s => s.id === selectedSchemeId);

    const feedbackItem: CitizenFeedbackReport = {
      id: refNumber,
      category,
      schemeId: selectedSchemeId || undefined,
      schemeName: matchedScheme ? matchedScheme.name : undefined,
      description: description.trim(),
      suggestedCorrection: suggestedCorrection.trim() || undefined,
      officialSourceUrl: sourceUrl.trim() || undefined,
      citizenEmail: citizenEmail.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };

    try {
      // 1. Store in localStorage for audit & immediate display in Admin Feedback Center
      const existingRaw = localStorage.getItem('govscheme_citizen_feedbacks');
      const existing: CitizenFeedbackReport[] = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(feedbackItem);
      localStorage.setItem('govscheme_citizen_feedbacks', JSON.stringify(existing.slice(0, 200)));

      // 2. Opportunistically post to backend if available
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
      fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackItem)
      }).catch(() => {
        // Local persistence succeeded, quiet catch for offline/demo mode
      });

      setSubmittedRef(refNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setDescription('');
    setSuggestedCorrection('');
    setSourceUrl('');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#07111F] rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white dark:from-[#0B1524] dark:to-[#07111F]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1769FF] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {t('reportIssueTitle', 'Report an Issue / Suggest Correction')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Help keep government scheme records accurate, verified, and updated.
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form / Success State */}
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
            {submittedRef ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Report Received & Logged
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your reference tracking code is:
                  </p>
                  <div className="inline-block px-4 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 font-mono font-bold text-sm text-[#1769FF]">
                    {submittedRef}
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  Our verification team cross-references citizen feedback against official state and central gazettes. If verified, the scheme catalogue will be updated in the next synchronization cycle.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-xs shadow transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Issue Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-[#1769FF]"
                  >
                    <option value="incorrect_rule">Incorrect Eligibility Rule / Age / Income Ceiling</option>
                    <option value="outdated_info">Outdated Scheme Details / Benefit Amount Changed</option>
                    <option value="broken_link">Broken Official Application Portal Link (404/Error)</option>
                    <option value="missing_scheme">Missing Government Scheme (Request Addition)</option>
                    <option value="translation_error">Language / Multilingual Translation Error</option>
                    <option value="privacy_security">Privacy / Security / Personal Data Concern</option>
                    <option value="other">General Platform Feedback</option>
                  </select>
                </div>

                {/* Related Scheme */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Affected Scheme (Optional)
                  </label>
                  <select
                    value={selectedSchemeId}
                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-[#1769FF]"
                  >
                    <option value="">-- General / Not Scheme Specific --</option>
                    {schemes.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.state})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Description of Issue *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what is incorrect, broken, or outdated..."
                    required
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-[#1769FF]"
                  />
                </div>

                {/* Suggested Correction */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Suggested Correction (Optional)
                  </label>
                  <input
                    type="text"
                    value={suggestedCorrection}
                    onChange={(e) => setSuggestedCorrection(e.target.value)}
                    placeholder="e.g. Income ceiling has been raised to ₹2,50,000 as per latest GO"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-[#1769FF]"
                  />
                </div>

                {/* Supporting Source URL */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Official Government Gazette / Order Link (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://tn.gov.in/go... or myscheme.gov.in"
                      className="w-full p-2.5 pl-8 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-[#1769FF]"
                    />
                    <Link className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                {/* Citizen Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Your Email (Optional, if you wish to receive update notification)
                  </label>
                  <input
                    type="email"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="citizen@example.com"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-[#1769FF]"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

