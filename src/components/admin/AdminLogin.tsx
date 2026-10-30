import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Activity, Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { GovSchemeLogo3D } from '../brand';
import { DEFAULT_AUTHORIZED_ADMIN_EMAILS, isAuthorizedAdminRole } from '../../utils/adminAuth';

interface AdminLoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onExit: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onExit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<'idle' | 'authenticating' | 'verifying' | 'loading' | 'error'>('idle');
  const [isFocused, setIsFocused] = useState<'email' | 'password' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both administrator email and password.');
      setLoginState('error');
      return;
    }

    try {
      setLoginState('authenticating');
      setErrorMessage('');

      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

      let response: Response;
      try {
        // First try the dedicated administrative login endpoint
        response = await fetch(`${API_URL}/api/auth/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        });

        // Fallback to primary auth endpoint if admin-login is not yet routed on legacy server
        if (response.status === 404) {
          response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password })
          });
        }
      } catch (networkErr: any) {
        console.warn('[Admin Auth] Backend connection failure:', networkErr.message);
        // Fail closed on backend connection error. NEVER produce mock tokens.
        setErrorMessage('Administrator authentication service is temporarily unavailable. Please try again later.');
        setLoginState('error');
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.token) {
        const returnedUser = data.user || data;
        const role = (returnedUser.role || '').trim();

        // Enforce administrative role requirement from authoritative database response
        if (!isAuthorizedAdminRole(role) || role.toLowerCase() === 'citizen') {
          setErrorMessage('Access denied: Account does not have administrative privileges.');
          setLoginState('error');
          return;
        }

        const adminUser: UserProfile = {
          id: returnedUser._id || returnedUser.id || 'admin',
          fullName: returnedUser.fullName || 'Administrator',
          email: returnedUser.email || email.trim(),
          mobile: returnedUser.mobile || '',
          age: returnedUser.age || 40,
          gender: returnedUser.gender || 'Male',
          state: returnedUser.state || 'Central',
          district: returnedUser.district || 'New Delhi',
          category: returnedUser.category || 'General',
          occupation: returnedUser.occupation || 'Government Administrator',
          annualIncome: returnedUser.annualIncome || 1200000,
          landHoldingAcres: returnedUser.landHoldingAcres || 0,
          educationLevel: returnedUser.educationLevel || 'Post Graduate',
          familyMembersCount: returnedUser.familyMembersCount || 4,
          hasDisability: Boolean(returnedUser.hasDisability),
          verificationBadge: true,
          profileCompletionScore: 100,
          savedSchemeIds: returnedUser.savedSchemeIds || [],
          documents: returnedUser.documents || [],
          role: returnedUser.role,
          token: data.token
        };

        // Store authoritative backend token and profile
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('govscheme_token', data.token);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        localStorage.setItem('govscheme_user', JSON.stringify(adminUser));

        setLoginState('loading');
        setTimeout(() => onLoginSuccess(adminUser), 300);
        return;
      }

      // Handle specific backend HTTP status responses
      if (response.status === 403) {
        setErrorMessage(data.message || 'Access denied: Account does not have administrative privileges.');
      } else if (response.status === 401) {
        setErrorMessage(data.message || 'Invalid administrator email or password.');
      } else if (response.status === 423) {
        setErrorMessage(data.message || 'Account locked due to consecutive failed attempts. Please try again later.');
      } else {
        setErrorMessage(data.message || 'Administrator authentication failed. Please check your credentials.');
      }
      setLoginState('error');
    } catch (err: any) {
      console.error('[Admin Auth] Error executing login:', err);
      setErrorMessage(err.message || 'Administrator authentication service encountered an error.');
      setLoginState('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    executeLogin();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#060D18] flex items-center justify-center p-4 font-sans selection:bg-[#1769FF] selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl bg-[#FFFFFF] dark:bg-[#0B1424] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#E2E8F0] dark:border-[#243449]"
      >
        
        {/* Left Side - Brand & Security */}
        <div className="w-full md:w-5/12 bg-[#123C69] dark:bg-[#101D31] p-10 text-white flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <motion.path 
                d="M-100,50 Q150,150 400,50 T900,50" 
                fill="none" 
                stroke="#60A5FA" 
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5, x: [-50, 0, -50] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                d="M-100,200 Q200,300 500,150 T1000,200" 
                fill="none" 
                stroke="#22D3EE" 
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3, x: [0, -50, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={onExit}>
              <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 rotate-180" /> GOVSCHEME
              </span>
            </div>

            <div className="flex justify-center md:justify-start mb-6">
              <div className="-ml-12 md:ml-0">
                <GovSchemeLogo3D size={220} interactive={true} />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Government Scheme<br/>Intelligence Platform
            </h1>
            <p className="text-blue-200 text-sm mb-8 max-w-sm">
              Advanced administrative control center for managing national scheme infrastructure and demographic intelligence.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /></div>
                Authenticated Backend Security
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /></div>
                Strict Role-Based Authorization
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /></div>
                No Mock or Offline Escalation
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-6 border-t border-blue-800/50">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-300 tracking-wider">
              <Shield className="w-4 h-4" /> SECURE ADMIN ACCESS GATEWAY
            </div>
            <div className="text-xs text-blue-400/80 space-y-1">
              <div>✓ Verified MongoDB Authority</div>
              <div>✓ Cryptographic JWT Validation</div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-800/30">
                <div className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></div>
                Security Protocol Active
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-[#FFFFFF] dark:bg-[#0B1424]">
          <div className="max-w-md w-full mx-auto">
            {/* Top Return to Citizen Portal */}
            <div className="flex items-center justify-between mb-8">
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#1769FF] dark:text-[#94A3B8] dark:hover:text-[#60A5FA] transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Citizen Portal</span>
              </button>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Official Portal
              </span>
            </div>

            <div className="mb-6 text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-2">Administrator Sign In</h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-sm">
                Enter your official administrative credentials to access the GovScheme Command Center.
              </p>
            </div>

            {/* Authoritative Security Notice */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold mb-1.5">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Restricted Administrative Zone</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Authentication strictly requires an active, verified MongoDB administrative account. Citizens and guests are denied access.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Authorized Accounts:</span>
                {DEFAULT_AUTHORIZED_ADMIN_EMAILS.map((admEmail) => (
                  <button
                    key={admEmail}
                    type="button"
                    onClick={() => {
                      setEmail(admEmail);
                      setErrorMessage('');
                    }}
                    className="font-mono text-blue-600 dark:text-blue-400 hover:underline px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40"
                    title={`Fill ${admEmail}`}
                  >
                    {admEmail}
                  </button>
                ))}
              </div>
            </div>

            {loginState === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-rose-700 dark:text-rose-300 font-bold text-sm">Authentication Failed</div>
                  <div className="text-rose-600 dark:text-rose-400 text-xs mt-0.5 leading-relaxed">
                    {errorMessage || 'Authentication failed. Please verify your credentials and try again.'}
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] mb-2 transition-colors">
                  Administrator Email
                </label>
                <div className={`relative rounded-lg border transition-all duration-300 ${isFocused === 'email' ? 'border-[#1769FF] dark:border-[#60A5FA] shadow-[0_0_0_3px_rgba(23,105,255,0.1)]' : 'border-[#E2E8F0] dark:border-[#243449]'} bg-[#F8FAFC] dark:bg-[#101D31]`}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused('email')}
                    onBlur={() => setIsFocused(null)}
                    disabled={loginState === 'authenticating' || loginState === 'loading'}
                    required
                    className="w-full px-4 py-3 bg-transparent border-none outline-none text-[#07111F] dark:text-[#F8FAFC] placeholder-[#94A3B8]"
                    placeholder="admin@govscheme.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] mb-2 transition-colors">
                  Password
                </label>
                <div className={`relative rounded-lg border transition-all duration-300 ${isFocused === 'password' ? 'border-[#1769FF] dark:border-[#60A5FA] shadow-[0_0_0_3px_rgba(23,105,255,0.1)]' : 'border-[#E2E8F0] dark:border-[#243449]'} bg-[#F8FAFC] dark:bg-[#101D31] flex items-center`}>
                  <Lock className="w-5 h-5 text-[#94A3B8] ml-4 absolute pointer-events-none" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused(null)}
                    disabled={loginState === 'authenticating' || loginState === 'loading'}
                    required
                    className="w-full pl-11 pr-12 py-3 bg-transparent border-none outline-none text-[#07111F] dark:text-[#F8FAFC] placeholder-[#94A3B8] tracking-wide"
                    placeholder="••••••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC] transition-colors focus:outline-none"
                    disabled={loginState === 'authenticating' || loginState === 'loading'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loginState === 'authenticating' || loginState === 'loading'}
                className="w-full py-3.5 px-4 bg-[#1769FF] hover:bg-[#123C69] disabled:bg-[#1769FF]/60 text-white rounded-lg font-bold transition-all duration-300 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 mt-2"
              >
                {loginState === 'authenticating' || loginState === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Verifying with Database Authority...</span>
                  </div>
                ) : (
                  <>Secure Administrator Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
