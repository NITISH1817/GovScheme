import React, { useState } from 'react';
import { Save, Shield, Globe, Database, Key } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[calc(100vh-8rem)]">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0">
        <h2 className="font-bold text-slate-800 mb-4 px-2">Settings</h2>
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'general' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe size={18} /> General
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Shield size={18} /> Security
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'api' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Key size={18} /> API Keys
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'database' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Database size={18} /> Backup & Data
          </button>
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
                  <input type="text" defaultValue="GovScheme Portal" className="w-full md:w-2/3 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                  <input type="email" defaultValue="support@govscheme.gov.in" className="w-full md:w-2/3 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Mode</label>
                  <div className="flex items-center gap-3">
                     <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                      <span className="text-sm text-slate-600">Enable to show maintenance page to all non-admin users.</span>
                  </div>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Default Language</label>
                  <select className="w-full md:w-1/3 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Session Timeout (minutes)</label>
                  <input type="number" defaultValue="30" className="w-full md:w-1/3 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Require Two-Factor Authentication (2FA) for Admins</label>
                  <div className="flex items-center gap-3 mt-1">
                     <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                      <span className="text-sm text-slate-600">Currently enabled.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">API Configuration</h3>
              <p className="text-sm text-slate-500">Manage API keys for third-party integrations (e.g., SMS gateways, OCR engines).</p>
              
               <div className="space-y-4">
                 <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-800">OCR Engine API Key</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Regenerate</button>
                    </div>
                    <div className="flex gap-2">
                      <input type="password" value="************************" readOnly className="flex-1 p-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 font-mono text-sm" />
                    </div>
                 </div>
                 <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-800">SMS Gateway API Key</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Regenerate</button>
                    </div>
                    <div className="flex gap-2">
                      <input type="password" value="************************" readOnly className="flex-1 p-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 font-mono text-sm" />
                    </div>
                 </div>
               </div>
            </div>
          )}

           {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Backup & Data Management</h3>
              
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-800">Automated Daily Backups</div>
                      <div className="text-sm text-slate-500">Backup database every night at 2:00 AM</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>

                  <div className="mt-6">
                    <button className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors flex items-center gap-2">
                      <Database size={18} /> Initiate Manual Backup Now
                    </button>
                  </div>
               </div>
            </div>
           )}

          <div className="mt-10 pt-6 border-t border-slate-200 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
