import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  FileSpreadsheet, 
  Bell, 
  Trash2, 
  UploadCloud,
  FileText,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Link2Off,
  RefreshCcw,
  Terminal
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'schemes' | 'import' | 'data_quality' | 'broadcast'>('dashboard');
  const [importJsonText, setImportJsonText] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [selectedSchemes, setSelectedSchemes] = useState<string[]>([]);

  // Handle Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedSchemes.length} schemes?`)) {
      selectedSchemes.forEach(id => onDeleteScheme(id));
      setSelectedSchemes([]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedSchemes.length === schemes.length) {
      setSelectedSchemes([]);
    } else {
      setSelectedSchemes(schemes.map(s => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedSchemes.includes(id)) {
      setSelectedSchemes(selectedSchemes.filter(s => s !== id));
    } else {
      setSelectedSchemes([...selectedSchemes, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F] pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-8">
        
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutDashboard className="w-3 h-3" /> {t('govtOperations', 'Government Operations')}
            </div>
            <h1 className="text-3xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight">
              {t('adminDashboard', 'Admin Dashboard')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {t('adminDashboardDesc', 'Manage welfare schemes, track analytics, and maintain data quality.')}
            </p>
          </div>
          <button 
            onClick={() => setShowCommandPalette(true)}
            className="px-4 py-2 bg-[#123C69] hover:bg-[#0A2645] text-white rounded font-semibold text-sm flex items-center gap-2 transition-colors"
          >
            <Terminal className="w-4 h-4" /> AI Command Center <span className="opacity-50 text-xs ml-1">(Ctrl+K)</span>
          </button>
        </div>

        {/* Admin Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[
            { id: 'dashboard', label: t('overview', 'Overview') },
            { id: 'schemes', label: t('manageSchemes', 'Manage Schemes') },
            { id: 'data_quality', label: t('dataQuality', 'Data Quality') },
            { id: 'import', label: t('importData', 'Import Data') },
            { id: 'broadcast', label: t('broadcasts', 'Broadcasts') },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeAdminTab === tab.id
                  ? 'border-[#1769FF] text-[#1769FF]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeAdminTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('totalSchemes', 'Total Schemes')}</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{schemes.length}</span>
              </div>
              <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('active', 'Active')}</span>
                <span className="text-3xl font-bold text-[#15803D] mt-2">{schemes.length}</span>
              </div>
              <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('centralGovt', 'Central')}</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{schemes.filter(s => s.state === 'Central').length}</span>
              </div>
              <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('stateGovt', 'State')}</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{schemes.filter(s => s.state !== 'Central').length}</span>
              </div>
              <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Activity className="w-3 h-3" /> {t('updated30d', 'Updated (30d)')}</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white mt-2">12</span>
              </div>
              <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#B91C1C] uppercase tracking-wide flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {t('dataIssues', 'Data Issues')}</span>
                <span className="text-3xl font-bold text-[#B91C1C] mt-2">3</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mock Charts */}
              <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wide">{t('schemesByCategory', 'Schemes by Category')}</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Agriculture', count: 45, width: '60%' },
                    { label: 'Education', count: 32, width: '45%' },
                    { label: 'Healthcare', count: 28, width: '40%' },
                    { label: 'Housing', count: 15, width: '25%' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{stat.label}</span>
                        <span className="text-gray-500">{stat.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-sm h-2">
                        <div className="bg-[#123C69] h-2 rounded-sm" style={{ width: stat.width }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wide">{t('recActivity', 'Recommendation Activity (30d)')}</h3>
                <div className="h-40 flex items-end justify-between gap-2 px-2">
                  {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                    <div key={i} className="w-full bg-[#1769FF]/20 hover:bg-[#1769FF]/40 rounded-t-sm transition-colors relative group" style={{ height: `${h}%` }}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap">
                        {h * 120} matches
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-500 mt-2">
                  <span>Mon</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manage Schemes */}
        {activeAdminTab === 'schemes' && (
          <div className="bg-white dark:bg-[#0F1B2D] rounded border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('schemeDatabase', 'Scheme Database')}</h3>
              <div className="flex items-center gap-3">
                {selectedSchemes.length > 0 && (
                  <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Bulk Delete ({selectedSchemes.length})
                  </button>
                )}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#1769FF] text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" /> {t('addScheme', 'Add Scheme')}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white dark:bg-[#0F1B2D] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={schemes.length > 0 && selectedSchemes.length === schemes.length}
                        onChange={handleToggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-xs">{t('schemeName', 'Scheme Name')}</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-xs">{t('level', 'Level')}</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-xs">{t('category', 'Category')}</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-xs">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#07111F]">
                  {schemes.map(sch => (
                    <tr key={sch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedSchemes.includes(sch.id)}
                          onChange={() => handleToggleSelect(sch.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sch.name}</td>
                      <td className="px-6 py-4 text-gray-500">{sch.state === 'Central' ? 'Central' : 'State'}</td>
                      <td className="px-6 py-4 text-gray-500">{sch.category.split('&')[0]}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onDeleteScheme(sch.id)}
                          className="text-[#B91C1C] hover:text-red-900 transition-colors p-1"
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

        {/* Import */}
        {activeAdminTab === 'import' && (
          <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded border border-gray-200 dark:border-gray-800 shadow-sm max-w-3xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <UploadCloud className="w-5 h-5 text-[#1769FF]" /> {t('ingestFeeds', 'Ingest Government Data Feeds (JSON)')}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('ingestFeedsDesc', 'Paste raw scheme JSON data fetched from official government APIs to dynamically expand the platform database.')}
            </p>

            {importSuccessMsg && (
              <div className="p-4 rounded bg-[#15803D]/10 text-[#15803D] text-sm font-bold border border-[#15803D]/20 mb-6">
                {importSuccessMsg}
              </div>
            )}

            <form onSubmit={handleImportSchemes} className="space-y-4">
              <textarea
                rows={10}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[{"id": "scheme-1", "name": "...", "category": "...", ...}]'
                className="w-full p-4 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769FF] outline-none"
              />
              <button
                type="submit"
                disabled={!importJsonText.trim()}
                className="px-6 py-3 rounded bg-[#1769FF] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" /> {t('runIngestion', 'Run Scheme Ingestion Script')}
              </button>
            </form>
          </div>
        )}

        {/* Data Quality Center */}
        {activeAdminTab === 'data_quality' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#B91C1C]" /> {t('dataQualityCenter', 'Data Quality Center')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{t('dataQualityDesc', 'Detect duplicates, missing data, and broken links across the scheme database.')}</p>
                </div>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded flex items-center gap-2 transition-colors">
                  <RefreshCcw className="w-4 h-4" /> {t('runScan', 'Run Scan')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Missing Data Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                  <div className="flex items-center gap-2 text-[#D97706] mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-bold text-sm">{t('missingData', 'Missing Data')} (3)</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white">PM Kisan Samman Nidhi</div>
                      <div className="text-xs text-gray-500">{t('missing', 'Missing:')} officialApplyUrl</div>
                    </li>
                    <li className="text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white">Stand Up India Scheme</div>
                      <div className="text-xs text-gray-500">{t('missing', 'Missing:')} financialBenefitAmount</div>
                    </li>
                  </ul>
                </div>

                {/* Duplicates Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                  <div className="flex items-center gap-2 text-[#123C69] dark:text-[#1769FF] mb-3">
                    <Activity className="w-4 h-4" />
                    <span className="font-bold text-sm">{t('possibleDupes', 'Possible Duplicates')} (1)</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 mb-2">94% {t('semanticMatch', 'Semantic Match')}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">1. PMAY-G (Rural)</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">2. Pradhan Mantri Awas Yojana</div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-1 text-xs font-bold bg-[#1769FF] text-white rounded">{t('merge', 'Merge')}</button>
                      <button className="flex-1 py-1 text-xs font-bold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded">{t('ignore', 'Ignore')}</button>
                    </div>
                  </div>
                </div>

                {/* Broken Links Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                  <div className="flex items-center gap-2 text-[#B91C1C] mb-3">
                    <Link2Off className="w-4 h-4" />
                    <span className="font-bold text-sm">{t('brokenLinks', 'Broken Links')} (1)</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white">National Scholarship Portal</div>
                      <div className="text-xs text-gray-500 truncate">{t('error404', '404 Error:')} scholarships.gov.in/apply</div>
                      <button className="mt-2 text-xs font-bold text-[#1769FF] hover:underline">{t('updateUrl', 'Update URL')}</button>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* AI Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={() => setShowCommandPalette(false)}>
          <div 
            className="w-full max-w-2xl bg-white dark:bg-[#0F1B2D] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <Terminal className="w-5 h-5 text-[#1769FF] mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Ask Admin AI or type a command... (e.g., 'Find broken links')"
                value={commandInput}
                onChange={e => setCommandInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg font-sans"
              />
              <div className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ESC to close</div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Suggested Commands</div>
              {['Audit schemes for missing documents', 'Generate monthly impact report', 'Identify low-performing schemes', 'Sync with central database (Mock)'].map((cmd, i) => (
                <button 
                  key={i}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#16243A] text-sm text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Activity className="w-4 h-4 text-gray-400" />
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
