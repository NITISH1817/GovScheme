import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, AlertCircle, CheckCircle2, Clock, Filter, 
  ExternalLink, Check, X, ShieldAlert, Sparkles, RefreshCw, Send, Search
} from 'lucide-react';
import { CitizenFeedbackReport } from '../modals/FeedbackModal';
import { Scheme } from '../../types';

interface FeedbackManagementViewProps {
  schemes?: Scheme[];
}

export const FeedbackManagementView: React.FC<FeedbackManagementViewProps> = ({ schemes = [] }) => {
  const [feedbacks, setFeedbacks] = useState<CitizenFeedbackReport[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<CitizenFeedbackReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const loadFeedbacks = () => {
    try {
      const raw = localStorage.getItem('govscheme_citizen_feedbacks');
      let items: CitizenFeedbackReport[] = raw ? JSON.parse(raw) : [];

      // Seed initial verified reports if empty
      if (items.length === 0) {
        items = [
          {
            id: 'FB-2026-9102',
            category: 'outdated_info',
            schemeId: 'pm-kisan',
            schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
            description: '17th installment release status requires updated date verification.',
            suggestedCorrection: '17th installment was released in June 2026; next due is 18th installment.',
            officialSourceUrl: 'https://pmkisan.gov.in',
            citizenEmail: 'farmer.welfare@tn.nic.in',
            createdAt: '2026-10-28T09:30:00Z',
            status: 'RESOLVED',
            resolutionNotes: 'Updated PM-KISAN installment guidance and verified official portal links.'
          },
          {
            id: 'FB-2026-4418',
            category: 'broken_link',
            schemeId: 'edu-post-matric-sc',
            schemeName: 'Post Matric Scholarship for SC/ST Students',
            description: 'Application link redirects to old portal URL instead of updated NSP portal.',
            suggestedCorrection: 'Use scholarships.gov.in canonical URL.',
            officialSourceUrl: 'https://scholarships.gov.in',
            createdAt: '2026-10-30T14:15:00Z',
            status: 'PENDING'
          },
          {
            id: 'FB-2026-3829',
            category: 'incorrect_rule',
            schemeId: 'tn-pudhumai-penn',
            schemeName: 'Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)',
            description: 'Check whether Class 6 to 12 government school study requirement includes model schools.',
            suggestedCorrection: 'Confirmed: Tamil Nadu Government Model Schools and CM Schools of Excellence are included.',
            officialSourceUrl: 'https://pudhumaipenn.tn.gov.in',
            citizenEmail: 'headmaster.tn@gmail.com',
            createdAt: '2026-10-31T08:00:00Z',
            status: 'INVESTIGATING'
          }
        ];
        localStorage.setItem('govscheme_citizen_feedbacks', JSON.stringify(items));
      }

      setFeedbacks(items);
    } catch {
      setFeedbacks([]);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateStatus = (id: string, newStatus: CitizenFeedbackReport['status'], notes?: string) => {
    const updated = feedbacks.map(f => {
      if (f.id === id) {
        return {
          ...f,
          status: newStatus,
          resolutionNotes: notes !== undefined ? notes : f.resolutionNotes
        };
      }
      return f;
    });

    setFeedbacks(updated);
    try {
      localStorage.setItem('govscheme_citizen_feedbacks', JSON.stringify(updated));
    } catch {}

    showToast(`Report ${id} marked as ${newStatus}`);
    if (selectedFeedback && selectedFeedback.id === id) {
      setSelectedFeedback(prev => prev ? { ...prev, status: newStatus, resolutionNotes: notes || prev.resolutionNotes } : null);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchScheme = (f.schemeName || '').toLowerCase().includes(q);
      const matchDesc = f.description.toLowerCase().includes(q);
      const matchId = f.id.toLowerCase().includes(q);
      if (!matchScheme && !matchDesc && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-[#1769FF] flex items-center justify-center font-bold shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Citizen Feedback & Issue Reports
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Audit reports from citizens regarding incorrect rules, outdated information, broken links, and translation errors.
            </p>
          </div>
        </div>

        <button
          onClick={loadFeedbacks}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Feedbacks
        </button>
      </div>

      {toast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Reports</span>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{feedbacks.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Pending Review</span>
          <div className="text-2xl font-extrabold text-amber-600">
            {feedbacks.filter(f => f.status === 'PENDING').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Investigating</span>
          <div className="text-2xl font-extrabold text-blue-600">
            {feedbacks.filter(f => f.status === 'INVESTIGATING').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Resolved</span>
          <div className="text-2xl font-extrabold text-emerald-600">
            {feedbacks.filter(f => f.status === 'RESOLVED').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, scheme, keyword..."
            className="w-full p-2.5 pl-8 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs outline-none focus:border-[#1769FF]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs outline-none font-semibold"
          >
            <option value="all">All Categories</option>
            <option value="incorrect_rule">Incorrect Rule / Criteria</option>
            <option value="outdated_info">Outdated Information</option>
            <option value="broken_link">Broken Portal Link</option>
            <option value="missing_scheme">Missing Scheme</option>
            <option value="translation_error">Translation Error</option>
            <option value="privacy_security">Privacy / Security</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs outline-none font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-gray-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="font-bold text-sm text-gray-700 dark:text-gray-300">No matching reports found</p>
            <p className="text-xs">All citizen feedback has been addressed or no reports match the active filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredFeedbacks.map(f => {
              const statusBadge = 
                f.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300' :
                f.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300' :
                f.status === 'DISMISSED' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300' :
                'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';

              return (
                <div key={f.id} className="p-5 sm:p-6 space-y-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#1769FF] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                        {f.id}
                      </span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {f.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
                        {f.status}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {f.schemeName && (
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      Target Scheme: <span className="text-blue-600 dark:text-blue-400 font-semibold">{f.schemeName}</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    <strong>Citizen Observation:</strong> {f.description}
                  </p>

                  {f.suggestedCorrection && (
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#07111F] border border-gray-200 dark:border-gray-800 text-xs text-emerald-700 dark:text-emerald-300">
                      <strong>Suggested Correction:</strong> {f.suggestedCorrection}
                    </div>
                  )}

                  {f.officialSourceUrl && (
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <ExternalLink className="w-3 h-3 text-blue-500" />
                      <span>Source: <a href={f.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-mono">{f.officialSourceUrl}</a></span>
                    </div>
                  )}

                  {f.resolutionNotes && (
                    <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
                      <strong>Admin Resolution Note:</strong> {f.resolutionNotes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(f.id, 'INVESTIGATING')}
                      disabled={f.status === 'INVESTIGATING'}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold transition disabled:opacity-50"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => {
                        const note = window.prompt("Enter resolution note for scheme update:", f.resolutionNotes || "Verified against official gazette. Updated scheme catalogue.");
                        if (note !== null) {
                          handleUpdateStatus(f.id, 'RESOLVED', note);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(f.id, 'DISMISSED')}
                      disabled={f.status === 'DISMISSED'}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold transition disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

