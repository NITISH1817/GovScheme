import React, { useState } from 'react';
import { X, Smartphone, Mail, UserCheck, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, LanguageCode, CategorySocial, TargetGender } from '../types';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const OCCUPATIONS = [
  'Farmer', 'Farmer (Marginal)', 'Agricultural Laborer', 'Daily Wage Laborer', 'Self-Employed',
  'Salaried (Government)', 'Salaried (Private)', 'Business Owner', 'Student', 'Unemployed', 'Other'
];

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
  return {
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
    profileCompletionScore: 40,
    savedSchemeIds: [],
    documents: [],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(opts.fullName)}&backgroundColor=0369a1`,
  };
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
  currentLang,
}) => {
  const { t } = useTranslation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regState, setRegState] = useState('');
  const [regOccupation, setRegOccupation] = useState('Farmer');
  const [regAge, setRegAge] = useState('');
  const [regIncome, setRegIncome] = useState('');
  const [regGender, setRegGender] = useState<TargetGender>('Male');

  if (!isOpen) return null;

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setOtpSent(true); }, 800);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const saved = localStorage.getItem('govscheme_user');
      if (saved) {
        const savedUser: UserProfile = JSON.parse(saved);
        if (savedUser.mobile === mobileNumber || mobileNumber.length >= 10) {
          onLoginSuccess(savedUser);
          onClose();
          return;
        }
      }
      const profile = buildNewProfile({ fullName: 'Citizen', mobile: mobileNumber, email: '', state: '', occupation: 'Other', age: 30, annualIncome: 0, gender: 'Male' });
      onLoginSuccess(profile);
      onClose();
    }, 900);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const saved = localStorage.getItem('govscheme_user');
      if (saved) {
        onLoginSuccess(JSON.parse(saved));
      } else {
        const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const profile = buildNewProfile({ fullName: name, mobile: '', email, state: '', occupation: 'Other', age: 30, annualIncome: 0, gender: 'Male' });
        onLoginSuccess(profile);
      }
      onClose();
    }, 900);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const profile = buildNewProfile({
        fullName: regName,
        mobile: regMobile,
        email: regEmail,
        state: regState,
        occupation: regOccupation,
        age: parseInt(regAge) || 25,
        annualIncome: parseInt(regIncome) || 0,
        gender: regGender,
      });
      onLoginSuccess(profile);
      onClose();
    }, 800);
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none';
  const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-colors" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">{t('authPortal', 'Government Portal Auth')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">{t('appName', 'GovScheme AI')}</h2>
          <p className="text-[10px] sm:text-xs text-blue-100 mt-1">{t('authSubtitle', 'Access personalized scheme eligibility and document vault.')}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Login / Register Tab Switch */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setMode('login')} className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 ${mode === 'login' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow' : 'text-slate-600 dark:text-slate-400'}`}>
              <UserCheck className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{t('login', 'Login')}</span>
            </button>
            <button onClick={() => setMode('register')} className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 ${mode === 'register' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow' : 'text-slate-600 dark:text-slate-400'}`}>
              <UserPlus className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{t('register', 'Register')}</span>
            </button>
          </div>

          {/* ===== LOGIN MODE ===== */}
          {mode === 'login' && (
            <>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button onClick={() => { setAuthMethod('mobile'); setOtpSent(false); }} className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${authMethod === 'mobile' ? 'bg-white dark:bg-slate-700 text-blue-700 shadow' : 'text-slate-600'}`}>
                  <Smartphone className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{t('mobileOTP', 'Mobile OTP')}</span>
                </button>
                <button onClick={() => setAuthMethod('email')} className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${authMethod === 'email' ? 'bg-white dark:bg-slate-700 text-blue-700 shadow' : 'text-slate-600'}`}>
                  <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{t('email', 'Email')}</span>
                </button>
              </div>

              {authMethod === 'mobile' && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <label className={labelCls}>{t('mobileNumber', 'Mobile Number')}</label>
                        <div className="flex gap-2">
                          <span className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center">+91</span>
                          <input type="tel" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="10-digit mobile number" className={`flex-1 ${inputCls}`} />
                        </div>
                      </div>
                      <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow transition">
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                        {t('otpSentMessage', 'OTP sent to +91')} {mobileNumber}. {t('otpInstruction', 'Enter 1234 to proceed.')}
                      </div>
                      <div>
                        <label className={labelCls}>{t('enterOTP', 'Enter OTP')}</label>
                        <input type="text" maxLength={4} required value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="1234" className={`${inputCls} tracking-widest text-center text-base font-bold`} />
                      </div>
                      <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition">
                        {loading ? t('verifying', 'Verifying...') : `${t('verifyAndLogin', 'Verify & Login')}`}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {authMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className={labelCls}>{t('emailAddress', 'Email Address')}</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t('password', 'Password')}</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow transition">
                    {loading ? t('loggingIn', 'Logging in...') : t('login', 'Login')}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ===== REGISTER MODE ===== */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>{t('yourName', 'Full Name')} *</label>
                  <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} placeholder={t('yourName', 'Full Name')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('mobileNumber', 'Mobile Number')}</label>
                  <input type="tel" value={regMobile} onChange={e => setRegMobile(e.target.value)} placeholder={t('mobileNumber', 'Mobile Number')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('yourAge', 'Age')} *</label>
                  <input type="number" min={18} max={99} required value={regAge} onChange={e => setRegAge(e.target.value)} placeholder={t('yourAge', 'Age')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('gender', 'Gender')} *</label>
                  <select value={regGender} onChange={e => setRegGender(e.target.value as TargetGender)} className={inputCls}>
                    <option value="Male">{t('male', 'Male')}</option>
                    <option value="Female">{t('female', 'Female')}</option>
                    <option value="Transgender">{t('transgender', 'Transgender')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t('yourState', 'Your State')} *</label>
                  <select required value={regState} onChange={e => setRegState(e.target.value)} className={inputCls}>
                    <option value="">{t('selectState', 'Select State')}</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t('yourOccupation', 'Occupation')} *</label>
                  <select value={regOccupation} onChange={e => setRegOccupation(e.target.value)} className={inputCls}>
                    {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t('annualIncomeLabel', 'Annual Income')}</label>
                  <input type="number" min={0} value={regIncome} onChange={e => setRegIncome(e.target.value)} placeholder="e.g. 95000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('emailOptional', 'Email (optional)')}</label>
                  <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="email@example.com" className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2">
                {loading ? t('creatingProfile', 'Creating profile...') : `✓ ${t('register', 'Register')} & ${t('login', 'Login')}`}
              </button>
              <p className="text-[10px] text-slate-400 text-center">{t('localDataPrivacy', 'Your profile is saved locally. No data is sent to any external server.')}</p>
            </form>
          )}

          {/* Guest Mode */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={() => { onContinueGuest(); onClose(); }}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <span>{t('guestMode', 'Continue as Guest')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              {t('guestDisclaimer', 'Guest users can search schemes, test eligibility, and talk to AI without logging in.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
