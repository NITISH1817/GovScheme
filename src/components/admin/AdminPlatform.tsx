import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, CheckSquare, BarChart3, Database, ShieldAlert,
  Users, Settings, Search, Bell, Sun, Moon, LogOut, Menu, X, Plus, Clock, AlertTriangle, Play,
  Filter, Download, MoreVertical, Edit, Copy, Eye, Trash2, GitMerge, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, Scheme } from '../../types';

interface AdminPlatformProps {
  user: UserProfile;
  schemes: Scheme[];
  onExit: () => void;
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
}

type AdminView = 'overview' | 'schemes' | 'scheme-editor' | 'rule-builder' | 'data-quality' | 'analytics' | 'users' | 'audit' | 'settings';

export const AdminPlatform: React.FC<AdminPlatformProps> = ({ user, schemes, onExit, theme, setTheme }) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editorStep, setEditorStep] = useState(1);

  const stats = {
    total: schemes.length,
    published: schemes.filter(s => s.popularityScore > 0).length,
    pending: 12,
    dataQuality: 92,
  };

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard Overview', section: 'OVERVIEW' },
    { id: 'schemes', icon: FileText, label: 'Scheme Management', section: 'SCHEMES' },
    { id: 'rule-builder', icon: CheckSquare, label: 'Eligibility Builder', section: 'ELIGIBILITY' },
    { id: 'data-quality', icon: Database, label: 'Data Quality Center', section: 'DATA' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics & Reports', section: 'ANALYTICS' },
    { id: 'users', icon: Users, label: 'User & Roles', section: 'SYSTEM' },
    { id: 'audit', icon: ShieldAlert, label: 'Audit Logs', section: 'SYSTEM' },
    { id: 'settings', icon: Settings, label: 'Settings', section: 'SYSTEM' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#07111F] text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="bg-white dark:bg-[#0F1B2D] border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          {sidebarOpen && <span className="font-bold text-xl text-primary tracking-tight">Admin<span className="text-slate-900 dark:text-white">Portal</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {sidebarOpen ? <X className="w-5 h-5 text-slate-500" /> : <Menu className="w-5 h-5 text-slate-500" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {navItems.map((item, idx) => {
            const isNewSection = idx === 0 || navItems[idx - 1].section !== item.section;
            return (
              <div key={item.id} className="px-3 mb-1">
                {isNewSection && sidebarOpen && (
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mt-4 px-3">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => setActiveView(item.id as AdminView)}
                  className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center'} py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === item.id ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button onClick={onExit} className="w-full flex items-center justify-center p-2 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> {sidebarOpen && "Exit Admin"}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#0F1B2D] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 flex items-center max-w-2xl">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schemes, users, audits (Ctrl+K)..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#16243A] border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0F1B2D]" />
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{user.fullName}</div>
                <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">{user.role || 'Super Admin'}</div>
              </div>
              <img src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=0ea5e9`} alt="Admin" className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto space-y-6"
            >
              
              {activeView === 'overview' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Real-time statistics and system health.</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-600 transition-colors whitespace-nowrap">
                      <Plus className="w-4 h-4 mr-2" /> New Scheme
                    </button>
                  </div>

                  {/* KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg"><FileText className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">+12%</span>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.total}</div>
                        <div className="text-sm font-medium text-slate-500">Total Schemes</div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg"><CheckSquare className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">+5%</span>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.published}</div>
                        <div className="text-sm font-medium text-slate-500">Published Schemes</div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">Requires Action</span>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.pending}</div>
                        <div className="text-sm font-medium text-slate-500">Pending Verification</div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><Database className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Healthy</span>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.dataQuality}%</div>
                        <div className="text-sm font-medium text-slate-500">Data Quality Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Charts & Activity Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Placeholder for Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recommendation Activity</h3>
                      <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-[#16243A]">
                        <span className="text-slate-400 font-medium">[Chart Component Placeholder]</span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Verification Workflow</h3>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#16243A] transition-colors">
                            <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">Kisan Samman Nidhi Update</div>
                              <div className="text-xs text-slate-500 mt-1">Pending review by Data Team</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-4 py-2 text-sm font-bold text-primary hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                        View All Pending
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Schemes Management View */}
              {activeView === 'schemes' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scheme Management</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Manage, verify, and publish government schemes.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center px-3 py-2 bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-[#16243A] transition-colors">
                        <Filter className="w-4 h-4 mr-2" /> Filters
                      </button>
                      <button className="inline-flex items-center px-3 py-2 bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-[#16243A] transition-colors">
                        <Download className="w-4 h-4 mr-2" /> Export
                      </button>
                      <button onClick={() => { setActiveView('scheme-editor'); setEditorStep(1); }} className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
                        <Plus className="w-4 h-4 mr-2" /> Add Scheme
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-[#16243A] border-b border-slate-200 dark:border-slate-800">
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-10">
                              <input type="checkbox" className="rounded border-slate-300" />
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Scheme Name</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">State</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {schemes.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10).map(scheme => (
                            <tr key={scheme.id} className="hover:bg-slate-50 dark:hover:bg-[#16243A]/50 transition-colors group">
                              <td className="px-4 py-4">
                                <input type="checkbox" className="rounded border-slate-300" />
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{scheme.name}</div>
                                <div className="text-xs text-slate-500 line-clamp-1">{scheme.department}</div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-md">
                                  {scheme.category}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                {scheme.state}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                  scheme.popularityScore > 0 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                  {scheme.popularityScore > 0 ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                                  <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                                  <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" title="Duplicate"><Copy className="w-4 h-4" /></button>
                                  <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-colors" title="Archive"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
                      <div className="text-slate-500">Showing 1 to {Math.min(schemes.length, 10)} of {schemes.length} results</div>
                      <div className="flex gap-1">
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800" disabled>Previous</button>
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">Next</button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Visual Eligibility Rule Builder */}
              {activeView === 'rule-builder' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Eligibility Rule Builder</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Visually design and test conditional eligibility logic.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Play className="w-4 h-4 mr-2" /> Test Rule
                      </button>
                      <button className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
                        Save Logic
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      {/* IF Statement Block */}
                      <div className="bg-white dark:bg-[#0F1B2D] border border-blue-200 dark:border-blue-900 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-200 dark:border-blue-900 flex items-center justify-between">
                          <span className="font-bold text-blue-700 dark:text-blue-400">IF (Conditions)</span>
                          <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">+ Add Condition Group</button>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[#16243A] rounded-lg border border-slate-200 dark:border-slate-800">
                            <select className="bg-white dark:bg-[#0F1B2D] border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium">
                              <option>Age</option>
                              <option>Income</option>
                              <option>State</option>
                            </select>
                            <select className="bg-white dark:bg-[#0F1B2D] border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium text-slate-500">
                              <option>&gt;= (Greater or Equal)</option>
                              <option>&lt;= (Less or Equal)</option>
                              <option>== (Exact Match)</option>
                            </select>
                            <input type="text" value="18" className="bg-white dark:bg-[#0F1B2D] border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium w-20" readOnly />
                            <div className="flex-1"></div>
                            <button className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                          </div>
                          
                          <div className="flex items-center justify-center">
                            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">AND</span>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[#16243A] rounded-lg border border-slate-200 dark:border-slate-800">
                            <select className="bg-white dark:bg-[#0F1B2D] border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium">
                              <option>Income</option>
                            </select>
                            <select className="bg-white dark:bg-[#0F1B2D] border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium text-slate-500">
                              <option>&lt; (Less Than)</option>
                            </select>
                            <input type="text" value="₹3,00,000" className="bg-white dark:bg-[#0F1B2D] border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium w-32" readOnly />
                            <div className="flex-1"></div>
                            <button className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                          </div>
                          
                          <button className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#16243A] transition-colors">
                            + Add Condition
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-center text-slate-400">
                        <MoreVertical className="w-6 h-6" />
                      </div>

                      {/* THEN Statement Block */}
                      <div className="bg-white dark:bg-[#0F1B2D] border border-emerald-200 dark:border-emerald-900 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 border-b border-emerald-200 dark:border-emerald-900">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">THEN (Outcome)</span>
                        </div>
                        <div className="p-4">
                           <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                             <span className="font-bold text-slate-900 dark:text-white">Mark as Eligible</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Rule Tester Sidebar */}
                    <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm h-fit">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Play className="w-4 h-4 text-primary" /> Test Rule Live
                      </h3>
                      <div className="space-y-4 mb-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Mock User Age</label>
                          <input type="number" defaultValue={22} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#16243A] border border-slate-200 dark:border-slate-800 rounded" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Mock User Income (₹)</label>
                          <input type="number" defaultValue={150000} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#16243A] border border-slate-200 dark:border-slate-800 rounded" />
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg text-center">
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-1">Condition Passed!</div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-500">User is evaluated as Eligible.</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Data Quality Center */}
              {activeView === 'data-quality' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Quality Center</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Detect anomalies, broken links, and incomplete records.</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                      <RefreshCw className="w-4 h-4 mr-2" /> Run Diagnostics
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-red-900 dark:text-red-400">Critical Issues</h3>
                      </div>
                      <div className="text-3xl font-bold text-red-700 dark:text-red-500">3</div>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">Schemes missing primary URLs</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h3 className="font-bold text-amber-900 dark:text-amber-400">Needs Review</h3>
                      </div>
                      <div className="text-3xl font-bold text-amber-700 dark:text-amber-500">12</div>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Outdated schemes ({'>'} 6 months)</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <GitMerge className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-blue-900 dark:text-blue-400">Duplicates</h3>
                      </div>
                      <div className="text-3xl font-bold text-blue-700 dark:text-blue-500">2</div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Potential duplicate records</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16243A]">
                      <h3 className="font-bold text-slate-900 dark:text-white">Detected Anomalies</h3>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {[
                        { scheme: 'PM Awas Yojana', issue: 'Missing official application URL', type: 'Critical' },
                        { scheme: 'Kisan Credit Card', issue: 'Possible duplicate detected with "KCC Scheme 2024"', type: 'Duplicate' },
                        { scheme: 'Mudra Yojana', issue: 'Eligibility rules incomplete (no age specified)', type: 'Warning' },
                      ].map((issue, idx) => (
                        <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#16243A]/50 transition-colors">
                          <div className="flex items-start gap-4">
                            {issue.type === 'Critical' && <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                            {issue.type === 'Duplicate' && <GitMerge className="w-5 h-5 text-blue-500 mt-0.5" />}
                            {issue.type === 'Warning' && <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />}
                            
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white mb-1">{issue.scheme}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">{issue.issue}</div>
                            </div>
                          </div>
                          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Resolve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Advanced Scheme Editor */}
              {activeView === 'scheme-editor' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scheme Editor</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Create or modify government schemes.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setActiveView('schemes')} className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                      </button>
                      <button className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Save Draft
                      </button>
                      <button className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors">
                        Submit for Verification
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    {/* Stepper Sidebar */}
                    <div className="w-full md:w-64 bg-slate-50 dark:bg-[#16243A] border-r border-slate-200 dark:border-slate-800 p-6 shrink-0">
                      <div className="space-y-6">
                        {[
                          { step: 1, label: 'Basic Information' },
                          { step: 2, label: 'Benefits' },
                          { step: 3, label: 'Eligibility Rules' },
                          { step: 4, label: 'Documents' },
                          { step: 5, label: 'Application Process' },
                          { step: 6, label: 'Verification' }
                        ].map((s) => (
                          <button
                            key={s.step}
                            onClick={() => setEditorStep(s.step)}
                            className={`flex items-center gap-3 w-full text-left transition-colors ${editorStep === s.step ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${editorStep === s.step ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                              {s.step}
                            </div>
                            <span className={`text-sm font-bold ${editorStep === s.step ? 'text-primary dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                              {s.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Editor Form Area */}
                    <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                      {editorStep === 1 && (
                        <div className="space-y-6 max-w-2xl">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Basic Information</h2>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Scheme Name <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full px-4 py-2 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Short Description</label>
                            <textarea rows={3} className="w-full px-4 py-2 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" placeholder="A brief summary..."></textarea>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                              <input type="text" className="w-full px-4 py-2 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" placeholder="e.g. Dept of Agriculture" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                              <select className="w-full px-4 py-2 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white">
                                <option>Agriculture & Farmers</option>
                                <option>Health & Healthcare</option>
                                <option>Education & Skill</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {editorStep === 3 && (
                        <div className="space-y-6 max-w-2xl">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Eligibility Hard Rules</h2>
                          <p className="text-sm text-slate-500 mb-6">Define the strict filtering parameters for this scheme.</p>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Min Age</label>
                              <input type="number" className="w-full px-4 py-2 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" placeholder="18" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Max Annual Income (₹)</label>
                              <input type="number" className="w-full px-4 py-2 bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" placeholder="300000" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target States</label>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full">All India</span>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">+ Add State</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl">
                            <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-2"><Settings className="w-4 h-4"/> Visual Rule Builder</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-500 mb-4">Need complex conditional logic?</p>
                            <button onClick={() => setActiveView('rule-builder')} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                              Open Rule Builder
                            </button>
                          </div>
                        </div>
                      )}

                      {editorStep !== 1 && editorStep !== 3 && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#16243A] flex items-center justify-center mb-4 text-slate-400">
                            <Settings className="w-8 h-8" />
                          </div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 capitalize">Step {editorStep} Configuration</h2>
                          <p className="text-slate-500 max-w-sm">This editor pane is wired up to the state machine but the inputs are pending implementation.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Analytics */}
              {activeView === 'analytics' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Analytics</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Deep dive into search trends and recommendation performance.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="px-3 py-2 bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                        <option>This Year</option>
                      </select>
                      <button className="inline-flex items-center px-3 py-2 bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-[#16243A] transition-colors">
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-72 flex flex-col items-center justify-center">
                        <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Search Analytics</h3>
                        <p className="text-sm text-slate-500 mt-2">Successful vs No-result searches over time</p>
                     </div>
                     <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-72 flex flex-col items-center justify-center">
                        <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Eligibility Funnel</h3>
                        <p className="text-sm text-slate-500 mt-2">Profile Started &rarr; Applied</p>
                     </div>
                  </div>
                </>
              )}

              {/* Users */}
              {activeView === 'users' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User & Role Management</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Manage internal admins, reviewers, and staff permissions.</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
                      <Plus className="w-4 h-4 mr-2" /> Invite User
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#16243A] border-b border-slate-200 dark:border-slate-800">
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Role</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr className="hover:bg-slate-50 dark:hover:bg-[#16243A]/50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img src={user.avatarUrl} className="w-8 h-8 rounded-full" />
                              <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName} (You)</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded">Super Admin</span>
                          </td>
                          <td className="px-4 py-4"><span className="text-emerald-500 text-sm font-bold">Active</span></td>
                          <td className="px-4 py-4 text-right"><MoreVertical className="w-5 h-5 inline-block text-slate-400" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Audit */}
              {activeView === 'audit' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Track all administrative actions across the platform.</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-[#16243A]">
                       <input type="date" className="px-3 py-1.5 bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-300" />
                       <select className="px-3 py-1.5 bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-300">
                         <option>All Actions</option>
                         <option>Scheme Updated</option>
                         <option>Scheme Published</option>
                       </select>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {[
                        { time: '10 mins ago', user: user.fullName, action: 'Scheme Updated', target: 'PM-KISAN' },
                        { time: '2 hours ago', user: 'System', action: 'Data Import', target: '150 Schemes' },
                        { time: '1 day ago', user: user.fullName, action: 'Eligibility Rule Changed', target: 'PMAY-G' },
                      ].map((log, i) => (
                        <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-[#16243A]/30">
                           <div className="flex items-center gap-3">
                              <ShieldAlert className="w-4 h-4 text-slate-400" />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white mr-1">{log.user}</span>
                                <span className="text-slate-600 dark:text-slate-400 mr-1">{log.action}:</span>
                                <span className="font-medium text-slate-900 dark:text-white">{log.target}</span>
                              </div>
                           </div>
                           <div className="text-sm font-bold text-slate-400">{log.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Settings */}
              {activeView === 'settings' && (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Global configuration and integrations.</p>
                  </div>
                  <div className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
                    <div className="max-w-xl space-y-6">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Platform Name</h3>
                        <input type="text" defaultValue="GovScheme AI" className="w-full px-4 py-2 bg-slate-50 dark:bg-[#16243A] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Maintenance Mode</h3>
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-red-600"></div>
                          <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">Disable citizen access temporarily</span>
                        </label>
                      </div>
                      <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </>
              )}



            </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
};
