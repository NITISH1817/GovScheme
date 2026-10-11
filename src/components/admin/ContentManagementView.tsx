import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Globe, Layers, AlertCircle, CheckCircle2, 
  ExternalLink, Plus, Edit, Eye, Trash2, ArrowUpRight, HelpCircle
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const ContentManagementView: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: 'faq1',
      question: 'What documents are universally required for scheme applications?',
      answer: 'Most national and state schemes require Aadhaar card for KYC, an active bank passbook for Direct Benefit Transfer (DBT), and state residence certificates.',
      category: 'General'
    },
    {
      id: 'faq2',
      question: 'How does GovScheme protect citizen Aadhaar and private certificates?',
      answer: 'All numbers are masked in administrative views, and documents are stored with encrypted tokens in compliance with privacy guidelines.',
      category: 'Privacy & Security'
    },
    {
      id: 'faq3',
      question: 'What is the processing turnaround time for income verification?',
      answer: 'Automated OCR optical processing provides pre-matching instantly. Official revenue officer verification typically concludes within 3-5 working days.',
      category: 'Application Workflow'
    }
  ]);

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newItem: FaqItem = {
      id: `faq_${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
      category: newCategory
    };
    setFaqs(prev => [newItem, ...prev]);
    setNewQuestion('');
    setNewAnswer('');
    setFeedback('New public FAQ published to citizen portal knowledge base.');
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDelete = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Content & Knowledge Management</h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Manage citizen-facing portal banners, FAQs, policy advisories, and informational guidelines.
        </p>
      </div>

      {feedback && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-[#15803D]/10 border border-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80] font-semibold text-sm rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> {feedback}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose FAQ */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#07111F] dark:text-[#F8FAFC] mb-4 pb-2 border-b border-[#E2E8F0] dark:border-[#243449] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#1769FF]" /> Publish Knowledge Article / FAQ
          </h2>

          <form onSubmit={handleAddFaq} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Audience Section</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
              >
                <option value="General">General Inquiries</option>
                <option value="Application Workflow">Application Workflow</option>
                <option value="Privacy & Security">Privacy & Security</option>
                <option value="Disbursement">Direct Benefit Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Question / Title *</label>
              <input 
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. How do I link Aadhaar with DBT?"
                className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Official Response / Guidance *</label>
              <textarea 
                rows={4}
                required
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Provide authoritative guidance..."
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-500/20"
            >
              Publish to Public Portal
            </button>
          </form>
        </div>

        {/* Right: Active Articles & FAQs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#07111F] dark:text-[#F8FAFC] mb-4 pb-2 border-b border-[#E2E8F0] dark:border-[#243449] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1769FF]" /> Published Help Center Content ({faqs.length})
              </span>
              <span className="text-xs font-semibold text-[#64748B]">Visible to all citizens</span>
            </h2>

            <div className="space-y-3">
              {faqs.map(faq => (
                <div 
                  key={faq.id}
                  className="p-4 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-xl flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#1769FF]/10 text-[#1769FF] dark:text-[#60A5FA] text-[10px] font-bold uppercase">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]">{faq.question}</h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">{faq.answer}</p>
                  </div>

                  <button 
                    onClick={() => handleDelete(faq.id)}
                    className="p-1.5 text-[#64748B] hover:text-[#B91C1C] rounded transition-colors opacity-70 group-hover:opacity-100"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
