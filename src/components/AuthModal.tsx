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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] animate-in fade-in duration-300">
      <div className="relative bg-white rounded-[24px] md:rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-4xl max-h-[95vh] flex overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500">
        
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-6 md:p-10 relative flex flex-col bg-white overflow-y-auto custom-scrollbar">
          {/* Close Button on mobile */}
          <button 
            onClick={onClose} 
            className="lg:hidden absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-[400px] w-full mx-auto my-auto py-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#2563EB] text-white flex items-center justify-center rounded-[12px] shadow-sm">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#0F172A] leading-tight">GovScheme AI</h1>
                <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Discover Government Schemes</p>
              </div>
            </div>

            {/* Titles */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-2 font-sans tracking-tight">
              Welcome Back
            </h2>
            <p className="text-[14px] text-[#64748B] mb-6 font-medium">
              Login to discover government schemes available for you
            </p>

            {/* Email Login Form */}
            {authStep === 'input' && authMethod === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5 ml-1">Email Address / Mobile Number</label>
                  <input 
                    type="text" 
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null); }}
                    className="w-full px-4 py-3.5 text-[15px] rounded-2xl border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all shadow-sm font-medium"
                    placeholder="citizen@example.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <label className="block text-[13px] font-bold text-[#0F172A]">Password</label>
                    <button type="button" className="text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">Forgot Password?</button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(null); }}
                      className="w-full px-4 py-3.5 text-[15px] rounded-2xl border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all shadow-sm font-medium pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {hasError && <p className="text-red-600 text-[13px] font-bold pl-1 animate-in slide-in-from-top-1">{error}</p>}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-[16px] shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Login</span>}
                </button>
                
                <div className="mt-4 text-center text-[14px]">
                  <span className="text-[#64748B] font-medium">Don't have an account? </span>
                  <button type="button" className="text-[#2563EB] font-bold hover:underline transition-all">Create Account</button>
                </div>

                <div className="mt-4 flex items-center px-2">
                  <div className="flex-1 border-t border-slate-200"></div>
                  <span className="px-4 text-[12px] text-slate-400 font-bold tracking-wider">OR</span>
                  <div className="flex-1 border-t border-slate-200"></div>
                </div>

                <button 
                  type="button" 
                  onClick={() => { setAuthMethod('phone'); setError(null); }}
                  className="w-full py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-[#0F172A] font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Continue with Mobile OTP
                </button>
              </form>
            )}

            {/* Mobile OTP Login Form */}
            {authStep === 'input' && authMethod === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5 ml-1">Mobile Number</label>
                  <div 
                    className={`flex items-center rounded-2xl border-[1.5px] overflow-hidden transition-all duration-200 bg-white shadow-sm ${
                      hasError 
                        ? 'border-red-400 bg-red-50/30 ring-4 ring-red-400/10' 
                        : isValidNumber
                          ? 'border-[#16A34A] focus-within:ring-4 focus-within:ring-[#16A34A]/10'
                          : 'border-slate-200 focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/10'
                    }`}
                  >
                    <div className="bg-slate-50/80 px-4 py-3.5 border-r border-inherit text-[15px] font-bold text-slate-600">
                      +91
                    </div>
                    <input 
                      type="tel" 
                      value={mobileNumber}
                      onChange={e => {
                        setMobileNumber(e.target.value.replace(/\D/g, ''));
                        setError(null);
                      }}
                      className="flex-1 px-4 py-3.5 text-[15px] text-[#0F172A] placeholder:text-slate-400 outline-none bg-transparent font-medium"
                      placeholder="Enter 10 digit number"
                      maxLength={10}
                    />
                    {isValidNumber && !hasError && (
                      <div className="pr-4 flex items-center justify-center">
                        <div className="bg-[#16A34A] rounded-full w-5 h-5 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {hasError && <p className="text-red-600 text-[13px] font-bold pl-1 animate-in slide-in-from-top-1">{error}</p>}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-[16px] shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Send OTP</span>}
                </button>

                <div className="mt-5 text-center">
                  <button type="button" onClick={() => { setAuthMethod('email'); setError(null); }} className="text-[#64748B] text-[14px] font-semibold hover:text-[#0F172A] transition-colors">
                    Back to Email Login
                  </button>
                </div>
              </form>
            )}

            {/* OTP Verification Step */}
            {authStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5 text-center">
                <div className="mb-4">
                  <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">
                    We've sent a 6-digit code to<br/>
                    <strong className="text-[#0F172A]">+91 {mobileNumber}</strong>
                  </p>
                  <button type="button" onClick={() => { setAuthStep('input'); setOtp(''); }} className="text-[#2563EB] text-[13px] font-bold hover:underline mt-2">
                    Change Number
                  </button>
                </div>
                
                <div>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(null); }}
                    className="w-full px-4 py-4 text-center tracking-[0.5em] text-2xl rounded-2xl border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all shadow-sm font-bold"
                    placeholder="••••••"
                    maxLength={6}
                    required
                  />
                  {hasError && <p className="text-red-600 text-[13px] font-bold mt-2 animate-in slide-in-from-top-1">{error}</p>}
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-[16px] shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Verify & Login</span>}
                </button>
                <div className="mt-4">
                  <button type="button" className="text-[#64748B] text-[13px] font-semibold hover:text-[#0F172A] transition-colors">
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* Trust Section */}
            <div className="mt-6 flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0">
                <Lock className="w-3 h-3" />
              </div>
              <p className="text-[11.5px] font-medium text-[#64748B] leading-relaxed">
                Your information is secure and used exclusively to find relevant government schemes and determine eligibility.
              </p>
            </div>

            {/* Guest Mode fallback */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { onContinueGuest(); onClose(); }}
                className="text-[13px] text-slate-400 font-semibold hover:text-slate-700 transition-colors"
              >
                Continue as Guest instead
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Visual/Branding */}
        <div className="hidden lg:block w-1/2 relative bg-slate-900 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Landscape" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-10 text-left text-white bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent">
            <h3 className="text-3xl font-bold mb-3 tracking-tight leading-tight">
              Hello there.
            </h3>
            <p className="text-slate-300 text-[15px] mb-6 max-w-sm leading-relaxed">
              Begin your journey to discover government schemes, grants, and scholarships available for you.
            </p>
            <button type="button" className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold transition-all flex items-center gap-2 text-sm">
              Sign Up <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
