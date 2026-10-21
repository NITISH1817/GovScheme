import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X, Loader2, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import { UserProfile, LanguageCode, CategorySocial, TargetGender } from '../types';
import { calculateProfileCompletion, normalizeUserProfile } from '../utils/profileUtils';
import './Auth/AuthModal.css';

function buildNewProfile(opts: {
  fullName: string;
  email: string;
  state?: string;
  occupation?: string;
  age?: number;
  annualIncome?: number;
  gender?: TargetGender;
}): UserProfile {
  const profile: UserProfile = {
    id: `user-${Date.now()}`,
    fullName: opts.fullName,
    mobile: '',
    email: opts.email,
    age: opts.age !== undefined ? opts.age : (undefined as any),
    gender: (opts.gender || '') as TargetGender,
    state: opts.state || '',
    district: '',
    category: '' as CategorySocial,
    occupation: opts.occupation || '',
    annualIncome: opts.annualIncome !== undefined ? opts.annualIncome : (undefined as any),
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

// ---------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------

const PasswordField = ({ value, onChange, placeholder, name }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-input-group">
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="auth-input"
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        className="auth-password-eye"
        onClick={() => setShow(prev => !prev)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

const Socials = ({ onSocialLogin, onGoogleLogin }: { onSocialLogin: () => void, onGoogleLogin?: () => void }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="auth-socials-divider">{t('orSignInWith', 'Or sign in with')}</div>
      <div className="auth-socials">
        <button type="button" onClick={onSocialLogin} className="auth-social-btn" aria-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
          </svg>
        </button>
        <button type="button" onClick={onGoogleLogin || onSocialLogin} className="auth-social-btn" aria-label="Google">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.61 20.08H42V20H24v8h11.3C34.04 31.72 29.5 35 24 35c-6.07 0-11-4.93-11-11s4.93-11 11-11c2.61 0 5.01.91 6.9 2.43l5.65-5.65C33.2 6.55 28.87 4 24 4 12.96 4 4 12.96 4 24s8.96 20 20 20c10.45 0 19.12-8.03 19.86-18.25L43.61 20.08z" />
            <path fill="#FF3D00" d="M6.31 14.65l6.57 4.84C14.61 15.65 18.96 12 24 12c2.61 0 5.01.91 6.9 2.43l5.65-5.65C33.2 6.55 28.87 4 24 4 16.32 4 9.66 8.35 6.31 14.65z" />
            <path fill="#4CAF50" d="M24 44c5.17 0 9.77-1.96 13.16-5.18l-6.22-5.27C29.08 35.1 26.68 36 24 36c-5.28 0-9.81-3.35-11.41-8.1l-6.86 5.16C9.07 39.81 15.93 44 24 44z" />
            <path fill="#1976D2" d="M43.61 20.08H42V20H24v8h11.3c-.76 3.19-2.73 5.86-5.36 7.46l6.22 5.27C40.06 37.14 44 31.06 44 24c0-1.34-.14-2.65-.39-3.92z" />
          </svg>
        </button>
        <button type="button" onClick={onSocialLogin} className="auth-social-btn" aria-label="Apple">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000">
            <path d="M17.05 13.9c0-3.32 2.72-4.92 2.85-5-1.55-2.27-3.95-2.58-4.81-2.63-2.02-.2-3.95 1.18-4.98 1.18-1.02 0-2.64-1.15-4.33-1.12-2.2.04-4.22 1.28-5.35 3.25-2.3 4-1.36 10.98.67 13.9 1.2 1.73 2.58 3.53 4.41 3.47 1.76-.07 2.44-1.14 4.57-1.14 2.1 0 2.74 1.14 4.57 1.1 1.9-.04 3.09-1.66 4.28-3.4 1.37-1.99 1.93-3.93 1.96-4.03-.04-.02-3.84-1.47-3.84-5.58z" />
            <path d="M14.93 4.14c.98-1.18 1.63-2.82 1.45-4.46-1.42.06-3.13.95-4.14 2.14-.9.1-1.63 2.65-1.41 4.22 1.58.12 3.13-.72 4.1-1.9z" />
          </svg>
        </button>
      </div>
    </>
  );
};

const Hero = ({ variant, title, text, buttonLabel, onSwitch }: any) => (
  <div className={`auth-hero ${variant}`}>
    <h2 className="auth-hero-title">{title}</h2>
    <p className="auth-hero-text">{text}</p>
    <button type="button" className="auth-hero-switch" onClick={onSwitch}>
      {buttonLabel}
    </button>
  </div>
);

// ---------------------------------------------------------
// Main Component
// ---------------------------------------------------------

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, isNewRegistration?: boolean) => void;
  onContinueGuest: () => void;
  currentLang: LanguageCode;
  initialMode?: 'login' | 'register';
  authNotice?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  authNotice,
  onClose,
  onLoginSuccess,
}) => {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setError(null);
    }
  }, [isOpen, initialMode]);

  const createProfileFromAuthData = (data: any, fallbackName = '', fallbackEmail = ''): UserProfile => {
    return normalizeUserProfile(data, fallbackName, fallbackEmail);
  };

  const getCleanApiUrl = () => {
    return (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = loginEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setError(t('validEmailRequired', 'Please enter a valid email address'));
      return;
    }
    if (!loginPassword) {
      setError(t('passwordRequired', 'Please enter your password'));
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const API_URL = getCleanApiUrl();
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, password: loginPassword }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success) {
        const profile = createProfileFromAuthData(data, 'User', emailTrimmed);
        if (data.token) {
          localStorage.setItem('govscheme_token', data.token);
          if (profile.role === 'admin' || profile.role === 'superadmin') {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('admin_token', data.token);
          }
          localStorage.setItem('govscheme_user', JSON.stringify(profile));
        }
        onLoginSuccess(profile, false);
        onClose();
      } else {
        const msg = data?.message || (response.status === 401 ? t('invalidEmailOrPassword', 'Invalid email or password') : t('loginFailed', 'Login failed. Please try again.'));
        setError(msg);
      }
    } catch (networkErr: any) {
      clearTimeout(timeoutId);
      console.error('Auth login network error:', networkErr);
      if (networkErr.name === 'AbortError') {
        setError(t('serverTimeout', 'The server took too long to respond. The cloud service may be waking up, please try again in a few moments.'));
      } else {
        setError(t('networkError', 'Unable to reach the authentication service. Please check your connection or wait a moment while the cloud service starts.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = registerName.trim();
    const emailTrimmed = registerEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameTrimmed) {
      setError(t('nameRequired', 'Full Name is required'));
      return;
    }
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setError(t('validEmailRequired', 'Please enter a valid email address'));
      return;
    }
    if (registerPassword.length < 8) {
      setError(t('passwordLength', 'Password must be at least 8 characters long'));
      return;
    }
    if (registerPassword !== registerConfirm) {
      setError(t('passwordsDontMatch', 'Passwords do not match'));
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    
    try {
      const API_URL = getCleanApiUrl();
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: nameTrimmed, email: emailTrimmed, password: registerPassword }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success) {
        const profile = createProfileFromAuthData(data, nameTrimmed, emailTrimmed);
        if (data.token) {
          localStorage.setItem('govscheme_token', data.token);
          localStorage.setItem('govscheme_user', JSON.stringify(profile));
        }
        onLoginSuccess(profile, true);
        onClose();
      } else {
        const rawMessage = data?.message || '';
        let userFriendlyMessage = rawMessage;
        if (
          response.status === 409 ||
          rawMessage.includes('E11000') ||
          rawMessage.toLowerCase().includes('duplicate key') ||
          rawMessage.toLowerCase().includes('already exists')
        ) {
          userFriendlyMessage = t('accountAlreadyExists', 'An account with this email already exists. Please sign in.');
        } else if (
          rawMessage.includes('buffering timed out') ||
          rawMessage.includes('MongoServerError') ||
          rawMessage.includes('timed out after')
        ) {
          userFriendlyMessage = t('serviceUnavailable', 'Database service is temporarily busy. Please try again shortly.');
        }
        setError(userFriendlyMessage || t('registrationFailed', 'Registration failed. Please try again.'));
      }
    } catch (networkErr: any) {
      clearTimeout(timeoutId);
      console.error('Auth register network error:', networkErr);
      if (networkErr.name === 'AbortError') {
        setError(t('serverTimeout', 'The server took too long to respond. The cloud service may be waking up, please try again in a few moments.'));
      } else {
        setError(t('networkError', 'Unable to reach the authentication service. Please check your connection or wait a moment while the cloud service starts.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = () => {
    setError(null);
    const profile = buildNewProfile({
      fullName: 'Citizen User',
      email: 'citizen@example.com'
    });
    onLoginSuccess(profile, true);
    onClose();
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const API_URL = getCleanApiUrl();
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: tokenResponse.access_token
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const isNew = Boolean(data.isNewUser || !data.user?.profile?.state || !data.user?.profile?.age);
          const profile = createProfileFromAuthData(data, data.fullName || data.user?.fullName, data.email || data.user?.email);
          if (data.token) {
            localStorage.setItem('govscheme_token', data.token);
            localStorage.setItem('govscheme_user', JSON.stringify(profile));
          }
          onLoginSuccess(profile, isNew);
          onClose();
        } else {
          setError(data?.message || t('authFailed', 'Failed to authenticate with backend.'));
        }
      } catch (err: any) {
        console.error('Google auth error:', err);
        setError(t('googleLoginFailed', 'Failed to login with Google. Please try again.'));
      }
    },
    onError: errorResponse => {
      console.error(errorResponse);
      setError(t('googleAuthFailed', 'Google Authentication Failed.'));
    },
  });

  const handleGoogleLoginClick = () => {
    const configuredClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!configuredClientId || configuredClientId.includes('xxxxxx')) {
      setError(null);
      const demoProfile = buildNewProfile({
        fullName: 'Nitish Priyan',
        email: 'nitishpriyanrs.cs24@bitsathy.ac.in'
      });
      demoProfile.avatarUrl = 'https://api.dicebear.com/7.x/initials/svg?seed=Nitish&backgroundColor=0369a1';
      localStorage.setItem('govscheme_user', JSON.stringify(demoProfile));
      onLoginSuccess(demoProfile, true);
      onClose();
      return;
    }
    googleLogin();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button 
        type="button"
        onClick={onClose} 
        className="absolute top-5 right-5 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[1001]"
        aria-label="Close"
      >
        <X size={26} />
      </button>

      <div className={`auth-card ${isRegister ? 'register' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="auth-card-bg"></div>

        {/* Hero Section (Left when Registering, switches back to Login) */}
        <Hero
          variant="register"
          title={t('welcomeBack', 'Welcome Back')}
          text={t('loginToContinue', 'Already have an account? Login to access your applications and schemes.')}
          buttonLabel={t('login', 'Login')}
          onSwitch={() => { setIsRegister(false); setError(null); }}
        />

        {/* Register Form */}
        <div className="auth-form-wrapper register">
          <form className="auth-form-container" onSubmit={handleRegisterSubmit}>
            <h2>{t('createAccount', 'Create Account')}</h2>
            {authNotice && (
              <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
                <Monitor size={16} className="text-amber-600 shrink-0" />
                <span>{authNotice}</span>
              </div>
            )}
            
            <div className="auth-input-group">
              <input 
                type="text" 
                placeholder={t('fullName', 'Full Name')} 
                className="auth-input" 
                value={registerName} 
                onChange={e => setRegisterName(e.target.value)} 
                required 
              />
            </div>
            <div className="auth-input-group">
              <input 
                type="email" 
                placeholder={t('emailAddress', 'Email Address')} 
                className="auth-input" 
                value={registerEmail} 
                onChange={e => setRegisterEmail(e.target.value)} 
                required 
              />
            </div>
            
            <PasswordField 
              placeholder={t('passwordPlaceholder', 'Password (min 8 chars)')} 
              value={registerPassword} 
              onChange={(e: any) => setRegisterPassword(e.target.value)} 
            />
            <PasswordField 
              placeholder={t('confirmPassword', 'Confirm Password')} 
              value={registerConfirm} 
              onChange={(e: any) => setRegisterConfirm(e.target.value)} 
            />
            
            {error && <div className="text-red-500 text-xs mb-2 text-center font-medium bg-red-50 py-1.5 px-3 rounded-lg border border-red-200">{t(error, error)}</div>}
            
            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('signingUp', 'Creating Account...')}</span>
                </>
              ) : (
                t('signUp', 'Sign Up')
              )}
            </button>
            
            {/* Inline switch for mobile screens and easy toggle */}
            <div className="auth-inline-switch">
              {t('alreadyHaveAccount', 'Already have an account?')}{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
              >
                {t('login', 'Login')}
              </button>
            </div>
            
            <Socials onSocialLogin={handleSocialLogin} onGoogleLogin={handleGoogleLoginClick} />
          </form>
        </div>

        {/* Hero Section (Right when Logging In, switches to Register) */}
        <Hero
          variant="login"
          title={t('helloThere', 'Hello Citizen')}
          text={t('beginJourney', 'Discover government welfare schemes customized to your eligibility profile.')}
          buttonLabel={t('signUp', 'Sign Up')}
          onSwitch={() => { setIsRegister(true); setError(null); }}
        />

        {/* Login Form */}
        <div className="auth-form-wrapper login">
          <form className="auth-form-container" onSubmit={handleLoginSubmit}>
            <h2>{t('welcomeBack', 'Welcome Back')}</h2>
            {authNotice && (
              <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
                <Monitor size={16} className="text-amber-600 shrink-0" />
                <span>{authNotice}</span>
              </div>
            )}
            
            <div className="auth-input-group">
              <input 
                type="email" 
                placeholder={t('emailAddress', 'Email Address')} 
                className="auth-input" 
                value={loginEmail} 
                onChange={e => setLoginEmail(e.target.value)} 
                required 
              />
            </div>
            
            <PasswordField 
              placeholder={t('password', 'Password')} 
              value={loginPassword} 
              onChange={(e: any) => setLoginPassword(e.target.value)} 
            />
            
            <div className="flex justify-between items-center mb-3 text-xs px-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                <input type="checkbox" className="rounded text-[#0f172a] focus:ring-[#0f172a]" defaultChecked />
                {t('rememberMe', 'Remember me')}
              </label>
              <button 
                type="button" 
                onClick={() => setError(t('forgotPasswordNote', 'Please contact support or register a new account.'))}
                className="text-slate-500 hover:text-slate-800 hover:underline bg-transparent border-0 p-0 cursor-pointer"
              >
                {t('forgotPassword', 'Forgot password?')}
              </button>
            </div>

            {error && <div className="text-red-500 text-xs mb-2 text-center font-medium bg-red-50 py-1.5 px-3 rounded-lg border border-red-200">{t(error, error)}</div>}

            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('loggingIn', 'Signing In...')}</span>
                </>
              ) : (
                t('login', 'Login')
              )}
            </button>
            
            {/* Inline switch for mobile screens and easy toggle */}
            <div className="auth-inline-switch">
              {t('dontHaveAccount', "Don't have an account?")}{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
              >
                {t('signUp', 'Sign Up')}
              </button>
            </div>

            <Socials onSocialLogin={handleSocialLogin} onGoogleLogin={handleGoogleLoginClick} />
          </form>
        </div>
      </div>
    </div>
  );
};
