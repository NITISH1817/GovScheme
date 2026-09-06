import React from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Building2, MapPin, Tags, IndianRupee, Users, FileCheck } from 'lucide-react';

interface SchemeDetailsModalProps {
  scheme: any;
  onClose: () => void;
}

export const SchemeDetailsModal: React.FC<SchemeDetailsModalProps> = ({ scheme, onClose }) => {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Scheme Details
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          
          {/* Header Info */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{scheme.name}</h1>
            <p className="text-slate-600">{scheme.shortDescription || scheme.detailedDescription || 'No description provided.'}</p>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                <Building2 size={16} /> {scheme.department}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                <MapPin size={16} /> {scheme.state}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                <Tags size={16} /> {scheme.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                scheme.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {scheme.status || 'Active'}
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Financials & Eligibility Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <IndianRupee size={18} className="text-slate-500" /> Financial Benefits
              </h3>
              <div className="text-3xl font-bold text-emerald-600">
                ₹{scheme.financialBenefitAmount ? scheme.financialBenefitAmount.toLocaleString('en-IN') : '0'}
              </div>
              <p className="text-sm text-slate-500 mt-1">Direct Benefit Transfer Amount</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Users size={18} className="text-slate-500" /> Eligibility Rules
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Max Family Income:</span>
                  <span className="font-medium text-slate-900">
                    {scheme.eligibilityRules?.incomeLimit ? `₹${scheme.eligibilityRules.incomeLimit.toLocaleString('en-IN')}` : 'No Limit'}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Age Requirement:</span>
                  <span className="font-medium text-slate-900">
                    {scheme.eligibilityRules?.ageMin || 0} - {scheme.eligibilityRules?.ageMax || 100} years
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Target Gender:</span>
                  <span className="font-medium text-slate-900">{scheme.eligibilityRules?.gender || 'All'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <FileCheck size={18} className="text-slate-500" /> Required Documents
            </h3>
            {scheme.documentsRequired && scheme.documentsRequired.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {scheme.documentsRequired.map((doc: string, idx: number) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm border border-slate-200">
                    • {doc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No specific documents required.</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
