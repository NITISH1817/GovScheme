import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  FileText,
  AlertCircle,
  ChevronRight,
  User as UserIcon,
  Settings
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateTab: (tab: string) => void;
  eligibleSchemesCount: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onNavigateTab,
  eligibleSchemesCount
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F] pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mt-8">
          <div>
            <h1 className="text-3xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight">
              Good morning, {user.fullName.split(' ')[0]}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Here is your civic-tech overview for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigateTab('vault')} className="flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <UserIcon className="w-4 h-4" /> Manage Profile
            </button>
            <button onClick={() => onNavigateTab('settings')} className="flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Metric Cards */}
            <section>
              <h2 className="text-lg font-bold text-[#123C69] dark:text-white mb-4">Your Scheme Discovery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Recommended', value: eligibleSchemesCount, icon: CheckCircle2, color: 'text-[#15803D]', bg: 'bg-[#15803D]/10' },
                  { label: 'Saved', value: user.savedSchemeIds.length, icon: Bookmark, color: 'text-[#1769FF]', bg: 'bg-[#1769FF]/10' },
                  { label: 'Applications', value: 2, icon: FileText, color: 'text-[#123C69] dark:text-white', bg: 'bg-gray-100 dark:bg-gray-800' },
                  { label: 'Action Required', value: 1, icon: AlertCircle, color: 'text-[#D97706]', bg: 'bg-[#D97706]/10' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#0F1B2D] p-5 rounded border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${stat.bg}`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended Schemes */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#123C69] dark:text-white">Recommended For You</h2>
                <button onClick={() => onNavigateTab('schemes')} className="text-sm font-semibold text-[#1769FF] hover:underline flex items-center">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded shadow-sm">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {/* Mock Scheme rows */}
                  {[
                    { title: 'PM Kisan Samman Nidhi', cat: 'Agriculture', amount: '₹6,000/year' },
                    { title: 'National Family Benefit Scheme', cat: 'Financial', amount: '₹20,000' }
                  ].map((s, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-[#1769FF]/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-[#1769FF]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">{s.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-gray-500">{s.cat}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="text-xs font-semibold text-[#15803D]">{s.amount}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => onNavigateTab('schemes')} className="px-4 py-1.5 rounded bg-gray-100 dark:bg-[#16243A] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-8">
            
            {/* Active Applications */}
            <section>
              <h2 className="text-lg font-bold text-[#123C69] dark:text-white mb-4">Active Applications</h2>
              <div className="bg-white dark:bg-[#0F1B2D] rounded border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Post Matric Scholarship</h4>
                    <p className="text-xs text-gray-500 mt-1">Under review by State Nodal Officer</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
                <button onClick={() => onNavigateTab('tracker')} className="w-full py-2 text-sm font-semibold text-[#1769FF] text-center hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                  Track all applications
                </button>
              </div>
            </section>

            {/* Profile Completion Widget */}
            <section>
              <div className="bg-gradient-to-br from-[#123C69] to-[#1769FF] rounded p-6 shadow-sm text-white">
                <h3 className="font-bold text-lg mb-2">Profile Completion</h3>
                <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                  Your profile is {user.profileCompletionScore}% complete. Add your banking details to instantly apply for DBT schemes.
                </p>
                <div className="w-full bg-black/20 rounded-full h-2 mb-4">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${user.profileCompletionScore}%` }}></div>
                </div>
                <button onClick={() => onNavigateTab('wizard')} className="w-full py-2 bg-white text-[#123C69] text-sm font-bold rounded shadow-sm hover:bg-gray-50 transition-colors">
                  Complete Profile
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
