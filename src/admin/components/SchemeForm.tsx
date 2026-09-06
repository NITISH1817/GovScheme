import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Upload, FileText, IndianRupee, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface SchemeFormProps {
  onClose: () => void;
  onSuccess: () => void;
  scheme?: any; // Pre-fill for edit mode
}

export const SchemeForm: React.FC<SchemeFormProps> = ({ onClose, onSuccess, scheme }) => {
  const isEdit = !!scheme;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: scheme?.id || `SCH-${Date.now()}`,
    name: scheme?.name || '',
    department: scheme?.department || '',
    ministry: scheme?.ministry || '',
    state: scheme?.state || 'Central',
    category: scheme?.category || 'General',
    shortDescription: scheme?.shortDescription || '',
    detailedDescription: scheme?.detailedDescription || '',
    financialBenefitAmount: scheme?.financialBenefitAmount || 0,
    eligibilityRules: {
      incomeLimit: scheme?.eligibilityRules?.incomeLimit || 0,
      ageMin: scheme?.eligibilityRules?.ageMin || 0,
      ageMax: scheme?.eligibilityRules?.ageMax || 100,
      gender: scheme?.eligibilityRules?.gender || 'All',
    },
    dynamicRules: scheme?.dynamicRules || [],
    documentsRequired: scheme?.documentsRequired || [] as string[],
    officialWebsite: scheme?.officialWebsite || '',
    applyURL: scheme?.applyURL || '',
    faqs: scheme?.faqs || [],
    seo: scheme?.seo || { title: '', metaDescription: '', keywords: [] },
    status: scheme?.status || 'Active'
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...((prev as any)[parent]), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDocumentAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const val = e.currentTarget.value;
      setFormData(prev => ({ ...prev, documentsRequired: [...prev.documentsRequired, val] }));
      e.currentTarget.value = '';
    }
  };

  const removeDoc = (doc: string) => {
    setFormData(prev => ({ ...prev, documentsRequired: prev.documentsRequired.filter(d => d !== doc) }));
  };

  // Visual Rule Builder Methods
  const addDynamicRule = () => {
    setFormData(prev => ({
      ...prev,
      dynamicRules: [...prev.dynamicRules, { field: 'income', operator: '<', value: '', logic: 'AND' }]
    }));
  };

  const updateDynamicRule = (index: number, key: string, value: string) => {
    setFormData(prev => {
      const newRules = [...prev.dynamicRules];
      newRules[index] = { ...newRules[index], [key]: value };
      return { ...prev, dynamicRules: newRules };
    });
  };

  const removeDynamicRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dynamicRules: prev.dynamicRules.filter((_, i) => i !== index)
    }));
  };

  // FAQ Methods
  const addFaq = () => setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }));
  const updateFaq = (index: number, key: string, value: string) => {
    setFormData(prev => {
      const newFaqs = [...prev.faqs];
      newFaqs[index] = { ...newFaqs[index], [key]: value };
      return { ...prev, faqs: newFaqs };
    });
  };
  const removeFaq = (index: number) => setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (isEdit) {
        await apiClient.put(`/schemes/${scheme._id}`, formData);
      } else {
        await apiClient.post('/schemes', formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save scheme:', error);
      alert('Error saving scheme. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Eligibility' },
    { num: 3, title: 'Documents & Links' },
    { num: 4, title: 'Advanced (SEO/FAQ)' },
    { num: 5, title: 'Publish' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            {isEdit ? 'Edit Government Scheme' : 'Create New Government Scheme'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between shrink-0 overflow-x-auto">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none min-w-[120px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                step >= s.num ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'
              }`}>
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span className={`ml-3 text-xs md:text-sm font-medium whitespace-nowrap ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>
                {s.title}
              </span>
              {idx < steps.length - 1 && (
                <div className={`flex-1 mx-2 md:mx-4 h-0.5 transition-colors ${step > s.num ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative bg-slate-50/30">
          <AnimatePresence mode="wait">
            
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Scheme Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. PM Kisan Samman Nidhi" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Agriculture">Agriculture</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Department</label>
                    <input name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Ministry</label>
                    <input name="ministry" value={formData.ministry} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">State / Level</label>
                    <select name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Central">Central Government</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Short Description</label>
                  <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Detailed Description</label>
                  <textarea name="detailedDescription" value={formData.detailedDescription} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </motion.div>
            )}

            {/* STEP 2 - Visual Rule Builder */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <IndianRupee size={18} /> Financial Benefits
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-blue-800">Benefit Amount (₹)</label>
                    <input type="number" name="financialBenefitAmount" value={formData.financialBenefitAmount} onChange={handleChange} className="w-full max-w-xs px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-bold text-slate-800">Visual Eligibility Rule Builder</h3>
                    <button onClick={addDynamicRule} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-semibold">
                      <Plus size={16} /> Add Rule
                    </button>
                  </div>
                  
                  {formData.dynamicRules.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                      No custom rules added. Scheme is open to everyone.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.dynamicRules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
                          {idx > 0 && (
                            <select 
                              value={rule.logic}
                              onChange={(e) => updateDynamicRule(idx, 'logic', e.target.value)}
                              className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none"
                            >
                              <option value="AND">AND</option>
                              <option value="OR">OR</option>
                            </select>
                          )}
                          
                          <select 
                            value={rule.field}
                            onChange={(e) => updateDynamicRule(idx, 'field', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                          >
                            <option value="income">Annual Income</option>
                            <option value="age">Age</option>
                            <option value="state">State</option>
                            <option value="category">Caste Category</option>
                            <option value="occupation">Occupation</option>
                            <option value="landOwnership">Land Ownership (Acres)</option>
                          </select>

                          <select 
                            value={rule.operator}
                            onChange={(e) => updateDynamicRule(idx, 'operator', e.target.value)}
                            className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-mono text-center"
                          >
                            <option value="=">=</option>
                            <option value="!=">!=</option>
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value=">=">&gt;=</option>
                            <option value="<=">&lt;=</option>
                          </select>

                          <input 
                            type="text"
                            value={rule.value}
                            onChange={(e) => updateDynamicRule(idx, 'value', e.target.value)}
                            placeholder="Value..."
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                          />

                          <button onClick={() => removeDynamicRule(idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3 - Documents & Links */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Required Documents (Press Enter to add)</label>
                  <input type="text" onKeyDown={handleDocumentAdd} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Aadhaar Card" />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.documentsRequired.map(doc => (
                      <span key={doc} className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                        {doc}
                        <button onClick={() => removeDoc(doc)} className="hover:text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Official Website URL</label>
                    <input name="officialWebsite" value={formData.officialWebsite} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Direct Apply URL</label>
                    <input name="applyURL" value={formData.applyURL} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4 - Advanced (SEO & FAQ) */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                
                {/* SEO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">SEO Optimization</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">SEO Meta Title</label>
                      <input name="seo.title" value={formData.seo.title} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">SEO Meta Description</label>
                      <textarea name="seo.metaDescription" value={formData.seo.metaDescription} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-bold text-slate-800">Frequently Asked Questions</h3>
                    <button onClick={addFaq} className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors font-semibold">
                      <Plus size={16} /> Add FAQ
                    </button>
                  </div>
                  
                  {formData.faqs.length === 0 ? (
                     <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                     No FAQs added.
                   </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex gap-3 relative group">
                           <div className="flex-1 space-y-3">
                              <input 
                                type="text"
                                value={faq.question}
                                onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                                placeholder="Question..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none font-medium text-slate-800 focus:border-indigo-500"
                              />
                              <textarea 
                                value={faq.answer}
                                onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                                placeholder="Answer..."
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none text-slate-600 focus:border-indigo-500"
                              />
                           </div>
                           <button onClick={() => removeFaq(idx)} className="text-slate-400 hover:text-red-500 self-start p-1 bg-slate-50 hover:bg-red-50 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* STEP 5 - Preview */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-200 text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Upload className="text-emerald-600" size={32} />
                  </div>
                  <h3 className="font-bold text-xl">Ready to Publish</h3>
                  <p className="text-sm opacity-80 max-w-md mx-auto">
                    This scheme will be instantly saved to the MongoDB Atlas database and broadcasted to the Citizen Portal via Socket.IO.
                  </p>
                </div>
                
                <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-white shadow-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Scheme Name</span>
                    <span className="font-medium text-slate-800">{formData.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Department</span>
                    <span className="font-medium text-slate-800">{formData.department || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Category</span>
                    <span className="font-medium text-slate-800">{formData.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Rules Added</span>
                    <span className="font-medium text-slate-800">{formData.dynamicRules.length} rule(s)</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500 text-sm">Status</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded text-xs font-bold">Active</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between shrink-0">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 5 ? (
            <button 
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? 'Publishing...' : 'Publish Scheme'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
