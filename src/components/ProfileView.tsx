import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserCheck, 
  ShieldCheck, 
  Award, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  Edit3, 
  Save, 
  ScanLine, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  GraduationCap, 
  Users, 
  HeartHandshake, 
  TrendingUp,
  Sparkles,
  Zap,
  Plus
} from 'lucide-react';
import { UserProfile, CategorySocial, TargetGender } from '../types';

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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white border border-uswds-border rounded-md p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-uswds-primary" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Profile Avatar with Verification Badge */}
            <div className="relative">
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"}
                alt={user.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-400 shadow-lg"
              />
              {user.verificationBadge && (
                <span className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-md" title="Govt Aadhaar e-KYC Verified">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-uswds-primary">{user.fullName}</h1>
                <span className="bg-uswds-background text-uswds-primary font-bold text-[10px] px-2.5 py-0.5 rounded border border-uswds-border uppercase whitespace-nowrap">
                  {t('verifiedCitizen', 'Verified Citizen')}
                </span>
              </div>
              <p className="text-sm text-uswds-textMuted flex items-center justify-center sm:justify-start gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-uswds-secondary" />
                <span>{user.district}, {user.state} • {user.mobile}</span>
              </p>
              <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
                <span className="bg-uswds-background px-2.5 py-1 rounded-sm text-uswds-textMuted font-semibold border border-uswds-border">
                  {user.occupation}
                </span>
                <span className="bg-uswds-background px-2.5 py-1 rounded-sm text-uswds-textMuted font-semibold border border-uswds-border whitespace-nowrap">
                  {t('category', 'Category')}: {user.category}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action & Profile Completion Score */}
          <div className="flex flex-col items-center sm:items-end gap-3">
            <div className="bg-white border border-uswds-border p-4 rounded-md flex items-center gap-4 text-center sm:text-right shadow-sm">
              <div>
                <span className="text-xs uppercase tracking-wider text-uswds-textMuted font-bold block">{t('profileCompletion', 'Profile Completion')}</span>
                <span className="text-2xl font-black text-uswds-primary font-sans">{user.profileCompletionScore}%</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-uswds-border border-t-uswds-success flex items-center justify-center font-bold text-xs text-uswds-primary">
                {user.profileCompletionScore}%
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-md bg-white border border-uswds-border hover:bg-slate-50 text-uswds-primary font-bold text-sm shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Edit3 className="w-4 h-4 shrink-0" />
                <span>{isEditing ? t('cancelEdit', 'Cancel Edit') : t('editProfile', 'Edit Profile')}</span>
              </button>
              <button
                onClick={() => onNavigateTab('vault')}
                className="px-4 py-2 rounded-md bg-uswds-primary hover:bg-uswds-secondary text-white font-bold text-sm transition flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <ScanLine className="w-4 h-4 shrink-0" />
                <span>{t('scanOCR', 'Scan OCR Document')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md flex flex-col justify-between space-y-2 border border-uswds-border shadow-sm border-l-4 border-l-uswds-primary">
          <span className="text-xs text-uswds-textMuted font-semibold">{t('eligibleSchemes', 'Eligible Schemes')}</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-uswds-primary font-sans">{eligibleSchemesCount}</span>
            <CheckCircle2 className="w-5 h-5 text-uswds-primary shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md flex flex-col justify-between space-y-2 border border-uswds-border shadow-sm border-l-4 border-l-uswds-secondary">
          <span className="text-xs text-uswds-textMuted font-semibold">{t('appliedSchemes', 'Applied Schemes')}</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-uswds-primary font-sans">2</span>
            <FileText className="w-5 h-5 text-uswds-secondary shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md flex flex-col justify-between space-y-2 border border-uswds-border shadow-sm border-l-4 border-l-uswds-warning">
          <span className="text-xs text-uswds-textMuted font-semibold">{t('underReview', 'Under Review')}</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-uswds-primary font-sans">1</span>
            <Clock className="w-5 h-5 text-uswds-warning shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md flex flex-col justify-between space-y-2 border border-uswds-border shadow-sm border-l-4 border-l-uswds-success">
          <span className="text-xs text-uswds-textMuted font-semibold">{t('savedSchemes', 'Saved Schemes')}</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-uswds-primary font-sans">{user.savedSchemeIds.length}</span>
            <Bookmark className="w-5 h-5 text-uswds-success shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md flex flex-col justify-between space-y-2 border border-uswds-border shadow-sm border-l-4 border-l-uswds-primary col-span-2 md:col-span-1">
          <span className="text-xs text-uswds-textMuted font-semibold">{t('vaultDocuments', 'Vault Documents')}</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-uswds-primary font-sans">{user.documents.length}</span>
            <ShieldCheck className="w-5 h-5 text-uswds-primary shrink-0" />
          </div>
        </div>
      </div>

      {/* Main Form & Detail View */}
      <div className="bg-white border border-uswds-border shadow-sm rounded-md p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-uswds-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-uswds-primary font-sans">
              {t('citizenProfileDetails', 'Citizen Eligibility Profile Details')}
            </h2>
            <p className="text-xs text-uswds-textMuted">
              {t('citizenProfileDesc', 'Information used by the Rule Engine to determine legal welfare eligibility.')}
            </p>
          </div>
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-md bg-uswds-success hover:bg-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Save className="w-4 h-4 shrink-0" /> {t('saveProfile', 'Save Profile')}
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('yourName', 'Full Name')}</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('yourAge', 'Age (Years)')}</label>
            <input
              type="number"
              disabled={!isEditing}
              value={formData.age}
              onChange={(e) => handleInputChange('age', Number(e.target.value))}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('gender', 'Gender')}</label>
            <select
              disabled={!isEditing}
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value as TargetGender)}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            >
              <option value="Male">{t('male', 'Male')}</option>
              <option value="Female">{t('female', 'Female')}</option>
              <option value="Transgender">{t('transgender', 'Transgender')}</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('yourOccupation', 'Primary Occupation')}</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              placeholder="e.g. Farmer, Artisan, Daily Wager"
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* Annual Income */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('annualIncomeLabel', 'Annual Household Income (₹)')}</label>
            <input
              type="number"
              disabled={!isEditing}
              value={formData.annualIncome}
              onChange={(e) => handleInputChange('annualIncome', Number(e.target.value))}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* State */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('yourState', 'State of Residence')}</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* District */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('district', 'District')}</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* Social Category */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('socialCategory', 'Social Category')}</label>
            <select
              disabled={!isEditing}
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as CategorySocial)}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          {/* Land Holding */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('landHolding', 'Land Holding (Acres)')}</label>
            <input
              type="number"
              step="0.1"
              disabled={!isEditing}
              value={formData.landHoldingAcres}
              onChange={(e) => handleInputChange('landHoldingAcres', Number(e.target.value))}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* Education Level */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('educationQual', 'Education Qualification')}</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.educationLevel}
              onChange={(e) => handleInputChange('educationLevel', e.target.value)}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* Family Count */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('familyMembers', 'Family Members Count')}</label>
            <input
              type="number"
              disabled={!isEditing}
              value={formData.familyMembersCount}
              onChange={(e) => handleInputChange('familyMembersCount', Number(e.target.value))}
              className="w-full px-3 py-2 rounded border border-uswds-border bg-white text-uswds-text font-medium focus:ring-2 focus:ring-uswds-primary disabled:bg-uswds-background"
            />
          </div>

          {/* Disability Switch */}
          <div>
            <label className="block font-bold text-uswds-primary mb-1">{t('pwd', 'Person with Disability (Divyangjan)')}</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  disabled={!isEditing}
                  name="disability"
                  checked={formData.hasDisability === true}
                  onChange={() => handleInputChange('hasDisability', true)}
                />
                <span className="text-uswds-text">{t('yes', 'Yes')}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  disabled={!isEditing}
                  name="disability"
                  checked={formData.hasDisability === false}
                  onChange={() => handleInputChange('hasDisability', false)}
                />
                <span className="text-uswds-text">{t('no', 'No')}</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Uploaded Documents Vault Quick Access */}
      <div className="bg-white border border-uswds-border shadow-sm rounded-md p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-uswds-primary font-sans">
            {t('verifiedVaultStatus', 'Verified Document Vault Status')}
          </h3>
          <button
            onClick={() => onNavigateTab('vault')}
            className="text-sm font-bold text-uswds-primary hover:underline whitespace-nowrap"
          >
            {t('manageAllDocs', 'Manage All Documents')} ({user.documents.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {user.documents.map(doc => (
            <div key={doc.id} className="p-4 rounded border border-uswds-border bg-uswds-background flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-uswds-primary block">{doc.type}</span>
                <span className="text-uswds-textMuted font-mono">{doc.docNumber}</span>
              </div>
              <span className="bg-green-100 text-uswds-success font-bold px-2 py-0.5 rounded text-[10px]">
                ✓ {doc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
