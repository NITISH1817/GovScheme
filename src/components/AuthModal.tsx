import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, LanguageCode, CategorySocial, TargetGender } from '../types';
import { calculateProfileCompletion } from '../utils/profileUtils';

function buildNewProfile(opts: {
  fullName: string;
  mobile: string;
  email: string;
  state: string;
  occupation: string;
  age: number;
  annualIncome: number;
  gender: TargetGender;
}): UserProfile {
  const profile = {
    id: `user-${Date.now()}`,
    fullName: opts.fullName,
    mobile: opts.mobile,
    email: opts.email,
    age: opts.age,
    gender: opts.gender,
    state: opts.state,
    district: '',
    category: 'General' as CategorySocial,
    occupation: opts.occupation,
    annualIncome: opts.annualIncome,
    landHoldingAcres: 0,
    educationLevel: '',
    familyMembersCount: 1,
    hasDisability: false,
    verificationBadge: false,
    profileCompletionScore: 0,
    savedSchemeIds: [],
    documents: [],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(opts.fullName)}&backgroundColor=0369a1`,
  };
  profile.profileCompletionScore = calculateProfileCompletion(profile);
  return profile;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onContinueGuest: () => void;
  currentLang: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onContinueGuest,
}) => {
  const { t } = useTranslation();

  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('email');
  const [authStep, setAuthStep] = useState<'input' | 'otp'>('input');
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mobileNumber.length < 10) {
        setError('Invalid mobile number');
        return;
      }
      setAuthStep('otp');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otp.length < 6) {
        setError('Invalid OTP code');
        return;
      }
      completeLogin(mobileNumber, '');
    }, 800);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (!email.includes('@') || password.length < 6) {
        setError('Invalid email or password');
        return;
      }
      completeLogin('', email);
    }, 800);
  };

  const completeLogin = (loginMobile: string, loginEmail: string) => {
    const saved = localStorage.getItem('govscheme_user');
    if (saved) {
      const savedUser: UserProfile = JSON.parse(saved);
      if ((loginMobile && savedUser.mobile === loginMobile) || (loginEmail && savedUser.email === loginEmail) || (!savedUser.mobile && !savedUser.email)) {
        onLoginSuccess(savedUser);
        onClose();
        return;
      }
    }
    
    const profile = buildNewProfile({ 
      fullName: 'Citizen', 
      mobile: loginMobile || '9999999999', 
      email: loginEmail || 'citizen@example.com', 
      state: 'Tamil Nadu', 
      occupation: 'Student', 
      age: 21, 
      annualIncome: 200000, 
      gender: 'Male' 
    });
    onLoginSuccess(profile);
    onClose();
  };

  const isValidNumber = mobileNumber.length >= 10;
  const hasError = error !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* 
        Container matching the provided Clerk-like design.
        White background, rounded corners, subtle shadow, max-width.
      */}
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-[420px] p-8 md:p-10 text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 bg-[#EEF2FF] text-[#2563EB] flex items-center justify-center rounded-[18px] mb-6">
          <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
        </div>

        {/* Titles */}
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {t('appName', 'GovScheme AI')}
        </h2>
        <p className="text-[15px] text-slate-600 font-medium mb-8">
          {t('login')} - {t('appName', 'GovScheme AI')}
        </p>

        {/* Tabs */}
        {authStep === 'input' && (
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => { setAuthMethod('email'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authMethod === 'email' ? 'bg-white shadow text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Email
            </button>
            <button
              onClick={() => { setAuthMethod('phone'); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${authMethod === 'phone' ? 'bg-white shadow text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Phone
            </button>
          </div>
        )}

        {/* Form */}
        {authStep === 'input' && authMethod === 'email' && (
          <form onSubmit={handleEmailLogin} className="text-left space-y-5">
            <div>
              <label className="block text-[14px] font-bold text-slate-900 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                className="w-full px-4 py-3 text-[15px] rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                placeholder="citizen@india.gov.in"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[14px] font-bold text-slate-900">Password</label>
                <a href="#" className="text-xs font-bold text-[#2563EB] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  className="w-full px-4 py-3 text-[15px] rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium pr-12"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {hasError && <p className="text-red-600 text-[13px] font-bold animate-in slide-in-from-top-1">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-[15px] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Login securely</span>}
            </button>
          </form>
        )}

        {authStep === 'input' && authMethod === 'phone' && (
          <form onSubmit={handleSendOtp} className="text-left space-y-6">
            <div>
              <label className="block text-[14px] font-bold text-slate-900 mb-2">
                {t('mobileNumber', 'Phone Number')}
              </label>
              
              <div 
                className={`flex items-center rounded-xl border-[1.5px] overflow-hidden transition-all duration-200 ${
                  hasError 
                    ? 'border-red-400 bg-red-50/30 shadow-[0_0_0_4px_rgba(248,113,113,0.1)]' 
                    : isValidNumber
                      ? 'border-emerald-400 bg-white'
                      : 'border-slate-200 bg-white focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]'
                }`}
              >
                {/* Prefix */}
                <div className="bg-slate-50/80 px-4 py-3 border-r border-inherit text-[15px] font-bold text-slate-900">
                  +91
                </div>
                
                {/* Input */}
                <input 
                  type="tel" 
                  value={mobileNumber}
                  onChange={e => {
                    setMobileNumber(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none bg-transparent font-medium"
                  placeholder="Enter 10 digit number"
                  maxLength={10}
                />

                {/* Success Indicator */}
                {isValidNumber && !hasError && (
                  <div className="pr-4 flex items-center justify-center">
                    <div className="bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {hasError && (
                <p className="text-red-600 text-[13px] font-bold mt-2 animate-in slide-in-from-top-1">
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-[15px] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {authStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="text-left space-y-6">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-600">Enter the verification code sent to <br/><strong className="text-slate-900">+91 {mobileNumber}</strong></p>
              <button type="button" onClick={() => { setAuthStep('input'); setOtp(''); }} className="text-[#2563EB] text-xs font-bold hover:underline mt-1">Change Number</button>
            </div>
            <div>
              <input 
                type="text" 
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(null); }}
                className="w-full px-4 py-4 text-center tracking-[0.5em] text-2xl rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
                placeholder="••••••"
                maxLength={6}
                required
              />
              {hasError && <p className="text-red-600 text-[13px] font-bold mt-2 text-center animate-in slide-in-from-top-1">{error}</p>}
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-[15px] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Verify and Login</span>}
            </button>
            <div className="text-center">
              <button type="button" className="text-slate-500 text-sm font-medium hover:text-slate-900">Resend OTP</button>
            </div>
          </form>
        )}

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[#10B981]">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-[12px] font-bold">{t('encryptedData', 'Your data is encrypted end-to-end')}</span>
        </div>

        {/* Guest Mode fallback */}
        <button
          type="button"
          onClick={() => { onContinueGuest(); onClose(); }}
          className="mt-6 text-[13px] text-slate-500 font-medium hover:text-slate-800 transition-colors"
        >
          {t('guestMode', 'Continue as Guest instead')}
        </button>

      </div>
    </div>
  );
};
