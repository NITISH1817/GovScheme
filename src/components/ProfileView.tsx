import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, Clock, Bookmark, FileText, AlertCircle, ChevronRight,
  User as UserIcon, Settings, Edit3, MapPin, Briefcase, IndianRupee,
  Activity, GraduationCap, LayoutDashboard
} from 'lucide-react';
import { UserProfile } from '../types';
import { motion } from 'framer-motion';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateTab: (tab: string) => void;
  eligibleSchemesCount: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateProfile,
  onNavigateTab,
  eligibleSchemesCount
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07111F] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight">
              {t('myProfile', 'My Profile')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Manage your information to improve your government scheme recommendations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigateTab('settings')} className="flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Settings className="w-4 h-4" /> {t('settings', 'Settings')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Overview Card */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1769FF]/5 to-transparent rounded-bl-full -z-10 pointer-events-none"></div>
              
              <div className="flex items-center gap-6 z-10">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 border-4 border-white dark:border-[#0F1B2D] shadow-md relative group">
                  <img src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=0369a1`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.email || 'No email provided'} • +91 {user.mobile}</p>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Profile Completeness: {user.profileCompletionScore}%</span>
                    </div>
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-[#15803D] h-1.5 rounded-full" style={{ width: `${user.profileCompletionScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="z-10 w-full md:w-auto">
                <button onClick={() => onNavigateTab('wizard')} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1769FF] text-white font-bold hover:bg-blue-700 transition-colors">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </motion.div>

            {/* Eligibility Snapshot */}
            <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-4">
                <LayoutDashboard className="w-5 h-5 text-[#1769FF]" />
                <h2 className="text-lg font-bold text-[#123C69] dark:text-white">Your Eligibility Snapshot</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">{user.state || 'Not specified'}{user.district ? ` • ${user.district}` : ''}</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Occupation</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">{user.occupation || 'Not specified'}</p>
                    {user.educationLevel && <p className="text-sm text-gray-600 dark:text-gray-400">{user.educationLevel}</p>}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Financial</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {user.annualIncome !== undefined ? `₹${user.annualIncome.toLocaleString()}/year` : 'Income not specified'}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <Bookmark className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preferences</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(user.interests || []).length > 0 ? (
                        user.interests?.map((interest, i) => (
                          <span key={i} className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">{interest}</span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No specific needs selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Personalized Profile Insights */}
            {user.profileCompletionScore < 100 && (
              <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="bg-[#123C69] rounded-xl p-6 shadow-sm text-white flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg">Profile Insight</h3>
                      <p className="text-blue-100 text-sm mt-1 max-w-md">
                        {user.educationLevel === undefined && user.occupation === 'Student' 
                          ? "Adding your education level could help identify additional scholarship schemes."
                          : "Adding your missing information could help identify additional schemes."}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => onNavigateTab('wizard')} className="w-full md:w-auto px-6 py-2 bg-white text-[#123C69] text-sm font-bold rounded-lg shadow hover:bg-gray-50 transition-colors whitespace-nowrap">
                    Complete Profile
                  </button>
                </div>
              </motion.section>
            )}
            
            {/* Recent Activity */}
            <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[#1769FF]" />
                <h2 className="text-lg font-bold text-[#123C69] dark:text-white">Recent Activity</h2>
              </div>
              <div className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-2">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#1769FF]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Logged into GovScheme platform</p>
                      <p className="text-xs text-gray-500 mt-0.5">Just now</p>
                    </div>
                  </div>
                  {user.savedSchemeIds.length > 0 && (
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#15803D]" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Saved a new scheme to profile</p>
                        <p className="text-xs text-gray-500 mt-0.5">Recently</p>
                      </div>
                    </div>
                  )}
                  {user.documents.length > 0 && (
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Added {user.documents[0].type} to Document Vault</p>
                        <p className="text-xs text-gray-500 mt-0.5">Recently</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-6 h-6 text-[#15803D] mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{eligibleSchemesCount}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Eligible</div>
              </div>
              <div onClick={() => onNavigateTab('schemes')} className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors">
                <Bookmark className="w-6 h-6 text-[#1769FF] mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.savedSchemeIds.length}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Saved</div>
              </div>
              <div onClick={() => onNavigateTab('tracker')} className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors">
                <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Applications</div>
              </div>
              <div onClick={() => onNavigateTab('vault')} className="bg-white dark:bg-[#0F1B2D] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors">
                <AlertCircle className="w-6 h-6 text-[#D97706] mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.documents.length}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Documents</div>
              </div>
            </div>

            {/* Empty Applications State */}
            <section>
              <h2 className="text-lg font-bold text-[#123C69] dark:text-white mb-4">My Applications</h2>
              <div className="bg-white dark:bg-[#0F1B2D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">No applications yet</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">Once you start an application, you'll be able to track it here.</p>
                <button onClick={() => onNavigateTab('schemes')} className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded hover:bg-gray-200 transition-colors">
                  Explore Schemes
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
