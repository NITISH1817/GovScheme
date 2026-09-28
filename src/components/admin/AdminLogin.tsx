import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Activity, Database, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../types';

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

  useEffect(() => {
    if (loginState === 'authenticating') {
      const timer1 = setTimeout(() => setLoginState('verifying'), 800);
      return () => clearTimeout(timer1);
    }
    if (loginState === 'verifying') {
      const timer2 = setTimeout(() => setLoginState('loading'), 800);
      return () => clearTimeout(timer2);
    }
    if (loginState === 'loading') {
      const timer3 = setTimeout(() => {
        if (email === 'admin' || email.includes('admin')) {
          const adminUser: UserProfile = {
            id: 'admin_1',
            fullName: 'Administrator',
            email: 'admin@govscheme.gov',
            mobile: '9999999999',
            age: 40,
            gender: 'Male',
            state: 'Central',
            district: 'New Delhi',
            category: 'General',
            occupation: 'Government Official',
            annualIncome: 1200000,
            landHoldingAcres: 0,
            educationLevel: 'Post Graduate',
            familyMembersCount: 4,
            hasDisability: false,
            verificationBadge: true,
            profileCompletionScore: 100,
            savedSchemeIds: [],
            documents: [],
            role: 'admin'
          };
          onLoginSuccess(adminUser);
        } else {
          setLoginState('error');
        }
      }, 800);
      return () => clearTimeout(timer3);
    }
  }, [loginState, email, onLoginSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoginState('authenticating');
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
        <div className="w-full md:w-5/12 bg-[#123C69] dark:bg-[#101D31] p-10 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Animated 2D Background */}
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
              <motion.path 
                d="M-100,350 Q300,200 600,400 T1100,350" 
                fill="none" 
                stroke="#60A5FA" 
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4, x: [-20, 20, -20] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
            </svg>
            
            {/* Grid */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={onExit}>
              <div className="w-10 h-10 bg-[#1769FF] rounded-lg flex items-center justify-center shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">GOVSCHEME</span>
            </div>

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Government Scheme<br/>Intelligence Platform
            </h1>
            <p className="text-blue-200 text-sm mb-12 max-w-sm">
              Advanced administrative control center for managing national scheme infrastructure and demographic intelligence.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /></div>
                Secure Platform
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /></div>
                Verified Data
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-[#4ADE80]" /></div>
                Role-Based Access
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-6 border-t border-blue-800/50">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-300 tracking-wider">
              <Shield className="w-4 h-4" /> SECURE ADMIN ACCESS
            </div>
            <div className="text-xs text-blue-400/80 space-y-1">
              <div>✓ Encrypted authentication</div>
              <div>✓ Role-based authorization</div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-800/30">
                <div className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></div>
                System status operational
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-[#FFFFFF] dark:bg-[#0B1424]">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-2">Welcome back</h2>
              <p className="text-[#64748B] dark:text-[#94A3B8]">Administrator</p>
            </div>

            {loginState === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-[#B91C1C]/10 border border-[#B91C1C]/20 flex flex-col gap-1"
              >
                <div className="text-[#B91C1C] dark:text-[#F87171] font-bold text-sm">Unable to sign in</div>
                <div className="text-[#B91C1C]/80 dark:text-[#F87171]/80 text-xs">Check your credentials and try again.</div>
                <button 
                  onClick={() => setLoginState('idle')}
                  className="mt-2 text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] w-fit hover:underline"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] mb-2 transition-colors">
                  Admin ID / Email
                </label>
                <div className={`relative rounded-lg border transition-all duration-300 ${isFocused === 'email' ? 'border-[#1769FF] dark:border-[#60A5FA] shadow-[0_0_0_3px_rgba(23,105,255,0.1)]' : 'border-[#E2E8F0] dark:border-[#243449]'} bg-[#F8FAFC] dark:bg-[#101D31]`}>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused('email')}
                    onBlur={() => setIsFocused(null)}
                    disabled={loginState !== 'idle' && loginState !== 'error'}
                    className="w-full px-4 py-3 bg-transparent border-none outline-none text-[#07111F] dark:text-[#F8FAFC] placeholder-[#94A3B8]"
                    placeholder="admin@gov.in"
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
                    disabled={loginState !== 'idle' && loginState !== 'error'}
                    className="w-full pl-11 pr-12 py-3 bg-transparent border-none outline-none text-[#07111F] dark:text-[#F8FAFC] placeholder-[#94A3B8] tracking-wide"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC] transition-colors focus:outline-none"
                    disabled={loginState !== 'idle' && loginState !== 'error'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-[#E2E8F0] dark:border-[#243449] text-[#1769FF] focus:ring-[#1769FF] dark:bg-[#101D31]" />
                  <label htmlFor="remember" className="text-xs text-[#64748B] dark:text-[#94A3B8] cursor-pointer">Remember me</label>
                </div>
                <button type="button" className="text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] hover:underline">
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit"
                disabled={loginState !== 'idle' && loginState !== 'error'}
                className="w-full py-3.5 px-4 bg-[#1769FF] hover:bg-[#123C69] disabled:bg-[#1769FF]/70 text-white rounded-lg font-bold transition-all duration-300 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {loginState === 'idle' || loginState === 'error' ? (
                  <>Secure Sign In <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>
                      {loginState === 'authenticating' && 'Authenticating...'}
                      {loginState === 'verifying' && 'Verifying credentials...'}
                      {loginState === 'loading' && 'Loading workspace...'}
                    </span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
