import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import { UserProfile, LanguageCode, CategorySocial, TargetGender } from '../types';
import { calculateProfileCompletion } from '../utils/profileUtils';
import './Auth/AuthModal.css';

function buildNewProfile(opts: {
  fullName: string;
  email: string;
  state: string;
  occupation: string;
  age: number;
  annualIncome: number;
  gender: TargetGender;
}): UserProfile {
  const profile: UserProfile = {
    id: `user-${Date.now()}`,
    fullName: opts.fullName,
    mobile: '',
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

const Socials = ({ onSocialLogin, onGoogleLogin }: { onSocialLogin: () => void, onGoogleLogin?: () => void }) => (
  <>
    <div className="auth-socials-divider">Or Sign in with</div>
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
  onLoginSuccess: (user: UserProfile) => void;
  onContinueGuest: () => void;
  currentLang: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.includes('@') || loginPassword.length < 6) {
      setError('Invalid email or password');
      return;
    }
    setError(null);
    const profile = buildNewProfile({
      fullName: 'Citizen',
      email: loginEmail,
      state: 'Tamil Nadu',
      occupation: 'Student',
      age: 21,
      annualIncome: 200000,
      gender: 'Male'
    });
    onLoginSuccess(profile);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName) {
      setError('Name is required');
      return;
    }
    if (!registerEmail.includes('@')) {
      setError('Valid email is required');
      return;
    }
    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (registerPassword !== registerConfirm) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    const profile = buildNewProfile({
      fullName: registerName,
      email: registerEmail,
      state: 'Tamil Nadu',
      occupation: 'Student',
      age: 21,
      annualIncome: 200000,
      gender: 'Male'
    });
    onLoginSuccess(profile);
    onClose();
  };

  const handleSocialLogin = () => {
    setError(null);
    const profile = buildNewProfile({
      fullName: 'Citizen',
      email: 'citizen@example.com',
      state: 'Tamil Nadu',
      occupation: 'Student',
      age: 21,
      annualIncome: 200000,
      gender: 'Male'
    });
    onLoginSuccess(profile);
    onClose();
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const profile = buildNewProfile({
          fullName: userInfo.name || 'Citizen',
          email: userInfo.email || 'googleuser@example.com',
          state: 'Tamil Nadu',
          occupation: 'Student',
          age: 21,
          annualIncome: 200000,
          gender: 'Male'
        });
        profile.avatarUrl = userInfo.picture || profile.avatarUrl;
        
        onLoginSuccess(profile);
        onClose();
      } catch (err) {
        console.error('Failed to fetch user info from Google', err);
        setError('Failed to login with Google.');
      }
    },
    onError: errorResponse => console.error(errorResponse),
  });

  return (
    <div className="auth-overlay">
      <button 
        onClick={onClose} 
        className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[100]"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div className={`auth-card ${isRegister ? 'register' : ''}`}>
        <div className="auth-card-bg"></div>

        <Hero
          variant="register"
          title="Welcome back"
          text="Login to continue your journey..."
          buttonLabel="Login"
          onSwitch={() => { setIsRegister(false); setError(null); }}
        />

        <div className="auth-form-wrapper register">
          <form className="auth-form-container" onSubmit={handleRegisterSubmit}>
            <h2>Create Account</h2>
            
            <div className="auth-input-group">
              <input type="text" placeholder="Full Name" className="auth-input" value={registerName} onChange={e => setRegisterName(e.target.value)} required />
            </div>
            <div className="auth-input-group">
              <input type="email" placeholder="Email Address" className="auth-input" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
            </div>
            
            <PasswordField placeholder="Password" value={registerPassword} onChange={(e: any) => setRegisterPassword(e.target.value)} />
            <PasswordField placeholder="Confirm Password" value={registerConfirm} onChange={(e: any) => setRegisterConfirm(e.target.value)} />
            
            {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
            
            <button type="submit" className="auth-submit-btn">Sign Up</button>
            
            <div className="mt-4">
              <Socials onSocialLogin={handleSocialLogin} onGoogleLogin={() => googleLogin()} />
            </div>
          </form>
        </div>

        <Hero
          variant="login"
          title="Hello there"
          text="Begin your journey with us..."
          buttonLabel="Sign Up"
          onSwitch={() => { setIsRegister(true); setError(null); }}
        />

        <div className="auth-form-wrapper login">
          <form className="auth-form-container" onSubmit={handleLoginSubmit}>
            <h2>Welcome Back</h2>
            
            <div className="auth-input-group">
              <input type="email" placeholder="Email Address" className="auth-input" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            
            <PasswordField placeholder="Password" value={loginPassword} onChange={(e: any) => setLoginPassword(e.target.value)} />
            
            <div className="flex justify-between items-center mb-4 text-sm px-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="rounded text-[#212625] focus:ring-[#212625]" />
                Remember me
              </label>
              <a href="#" className="text-slate-600 hover:text-[#212625] hover:underline">Forgot password?</a>
            </div>

            {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}

            <button type="submit" className="auth-submit-btn">Login</button>
            
            <Socials onSocialLogin={handleSocialLogin} onGoogleLogin={() => googleLogin()} />
          </form>
        </div>
      </div>
    </div>
  );
};
