import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Plus, 
  FileSpreadsheet, 
  Users, 
  FileText, 
  Bell, 
  BarChart3, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Download, 
  UploadCloud,
  ShieldCheck
} from 'lucide-react';
import { Scheme } from '../types';

interface AdminPanelProps {
  schemes: Scheme[];
  onAddScheme: (newScheme: Scheme) => void;
  onDeleteScheme: (schemeId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  schemes,
  onAddScheme,
  onDeleteScheme
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'schemes' | 'import' | 'users' | 'broadcast'>('dashboard');
  const [importJsonText, setImportJsonText] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // New Scheme Form State
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newMinistry, setNewMinistry] = useState('');
  const [newCategory, setNewCategory] = useState<Scheme['category']>('Agriculture & Farmers');
  const [newState, setNewState] = useState('Central');
  const [newFinancialBenefit, setNewFinancialBenefit] = useState(5000);
  const [newApplyUrl, setNewApplyUrl] = useState('https://india.gov.in');

  const handleImportSchemes = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed)) {
        parsed.forEach(s => onAddScheme(s));
        setImportSuccessMsg(`Successfully imported ${parsed.length} official government schemes into the system!`);
      } else {
        onAddScheme(parsed);
        setImportSuccessMsg(`Successfully imported 1 scheme into the database!`);
      }
      setImportJsonText('');
    } catch (err) {
      alert("Invalid JSON format. Please ensure valid Scheme JSON syntax.");
    }
  };

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeName) return;

    const created: Scheme = {
      id: `scheme-${Date.now()}`,
      name: newSchemeName,
      shortDescription: `Official welfare scheme managed by ${newMinistry}.`,
      department: `${newCategory} Department`,
      ministry: newMinistry || 'Ministry of Social Welfare',
      category: newCategory,
      state: newState,
      benefitsSummary: `Financial benefit of ₹${newFinancialBenefit.toLocaleString('en-IN')}/year`,
      financialBenefitAmount: newFinancialBenefit,
      eligibilityRules: {
        requiredDocuments: ["Aadhaar Card", "Income Certificate"]
      },
      requiredDocuments: ["Aadhaar Card", "Income Certificate"],
      applicationSteps: ["Visit official portal", "Submit Aadhaar e-KYC"],
      officialApplyUrl: newApplyUrl,
      officialWebsite: newApplyUrl,
      helplineNumber: "1800-11-0000",
      deadline: "Open All Year",
      tags: ["Government", "Welfare"],
      faqs: [],
      lastUpdated: new Date().toISOString().split('T')[0],
      popularityScore: 85
    };

    onAddScheme(created);
    alert("New Government Scheme added successfully!");
    setNewSchemeName('');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastTitle('');
      setBroadcastDesc('');
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900 border border-indigo-700 text-amber-400 text-xs font-bold">
            <LayoutDashboard className="w-4 h-4" /> Government Portal Administrator Control Panel
          </div>
          <h1 className="text-3xl font-black font-heading tracking-tight">Admin & Nodal Officer Portal</h1>
          <p className="text-xs text-slate-300">
            Manage welfare schemes, ingest official data feeds, track citizen analytics, and broadcast notifications.
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'dashboard', label: '📊 System Dashboard' },
          { id: 'schemes', label: '📁 Manage Schemes' },
          { id: 'import', label: '📥 Import Scheme Data' },
          { id: 'broadcast', label: '📢 Send Broadcast' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeAdminTab === tab.id
                ? 'bg-indigo-700 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Admin Tab Content */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="gov-card p-5 border-l-4 border-l-blue-600">
              <span className="text-xs text-slate-500 font-semibold">Total Schemes in DB</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-heading block mt-1">{schemes.length}</span>
            </div>
            <div className="gov-card p-5 border-l-4 border-l-emerald-600">
              <span className="text-xs text-slate-500 font-semibold">Registered Citizens</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-heading block mt-1">12,480</span>
            </div>
            <div className="gov-card p-5 border-l-4 border-l-amber-600">
              <span className="text-xs text-slate-500 font-semibold">OCR Scans Processed</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-heading block mt-1">34,910</span>
            </div>
            <div className="gov-card p-5 border-l-4 border-l-purple-600">
              <span className="text-xs text-slate-500 font-semibold">DBT Grants Approved</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-heading block mt-1">₹4.8 Cr</span>
            </div>
          </div>
        </div>
      )}

      {/* Manage Schemes View */}
      {activeAdminTab === 'schemes' && (
        <div className="space-y-6">
          {/* Add Scheme Form */}
          <div className="gov-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Add New Government Welfare Scheme</h3>
            <form onSubmit={handleCreateScheme} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Scheme Name</label>
                <input
                  type="text"
                  required
                  value={newSchemeName}
                  onChange={(e) => setNewSchemeName(e.target.value)}
                  placeholder="e.g. PM Kisan Maandhan Yojana"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Ministry / Nodal Body</label>
                <input
                  type="text"
                  required
                  value={newMinistry}
                  onChange={(e) => setNewMinistry(e.target.value)}
                  placeholder="Ministry of Agriculture"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Agriculture & Farmers">Agriculture & Farmers</option>
                  <option value="Health & Healthcare">Health & Healthcare</option>
                  <option value="Housing & Shelter">Housing & Shelter</option>
                  <option value="Education & Skill">Education & Skill</option>
                  <option value="Financial Inclusion & Credit">Financial Inclusion & Credit</option>
                  <option value="Pensions & Senior Care">Pensions & Senior Care</option>
                  <option value="Women & Child Welfare">Women & Child Welfare</option>
                  <option value="Employment & Micro Enterprises">Employment & Micro Enterprises</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">State / Central</label>
                <input
                  type="text"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  placeholder="Central or Tamil Nadu / UP"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Financial Benefit (₹/yr)</label>
                <input
                  type="number"
                  value={newFinancialBenefit}
                  onChange={(e) => setNewFinancialBenefit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Official Apply URL</label>
                <input
                  type="url"
                  value={newApplyUrl}
                  onChange={(e) => setNewApplyUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Scheme to Database
                </button>
              </div>
            </form>
          </div>

          {/* Scheme Table */}
          <div className="gov-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Scheme Name</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Benefit</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {schemes.map(sch => (
                  <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{sch.name}</td>
                    <td className="p-3">{sch.state}</td>
                    <td className="p-3">{sch.category}</td>
                    <td className="p-3 text-emerald-600 font-bold">₹{(sch.financialBenefitAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onDeleteScheme(sch.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Scheme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scheme Import Tool */}
      {activeAdminTab === 'import' && (
        <div className="gov-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" /> Ingest Government Data Feeds (JSON/CSV)
          </h3>
          <p className="text-xs text-slate-500">
            Paste raw scheme JSON data fetched from official government APIs (data.gov.in / myscheme.gov.in) to dynamically expand the platform database.
          </p>

          {importSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
              {importSuccessMsg}
            </div>
          )}

          <form onSubmit={handleImportSchemes} className="space-y-4">
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[{"id": "custom-scheme-1", "name": "PM Krishi Sinchayee Yojana", "category": "Agriculture & Farmers", ...}]'
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!importJsonText.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Run Scheme Ingestion Script
            </button>
          </form>
        </div>
      )}

      {/* Broadcast Notifications */}
      {activeAdminTab === 'broadcast' && (
        <div className="gov-card p-6 space-y-4 max-w-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Send Push Broadcast Notification to Citizens
          </h3>
          {broadcastSuccess && (
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
              ✓ Broadcast Notification sent to 12,480 active citizen profiles!
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Notification Title</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Last Date Reminder for Crop Subsidy"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Message Body</label>
              <textarea
                rows={3}
                required
                value={broadcastDesc}
                onChange={(e) => setBroadcastDesc(e.target.value)}
                placeholder="Details of the announcement..."
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow flex items-center gap-2"
            >
              <Bell className="w-4 h-4" /> Broadcast Notification
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
