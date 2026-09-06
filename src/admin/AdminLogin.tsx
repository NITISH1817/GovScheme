import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Globe } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

const ROLE_INFO = [
  { role: 'Super Admin', color: 'bg-blue-900/40 text-blue-300 border-blue-800' },
  { role: 'State Admin', color: 'bg-purple-900/40 text-purple-300 border-purple-800' },
  { role: 'Ministry Admin', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800' },
  { role: 'District Officer', color: 'bg-amber-900/40 text-amber-300 border-amber-800' },
];

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data));
        onLogin(data.token);
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Unable to connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex font-sans overflow-hidden">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#0d1f4d] via-[#0f2a6e] to-[#0d1f4d] p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 60}px`,
                height: `${(i + 1) * 60}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-xl shadow-blue-900/60">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">GovScheme AI</p>
              <p className="text-blue-300 text-xs mt-0.5">Administration Portal</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Government Scheme<br />
              <span className="text-blue-400">Management System</span>
            </h1>
            <p className="text-blue-200/70 text-base leading-relaxed">
              Centralized administration platform for managing government welfare schemes, citizen applications, and AI-powered verification workflows.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 space-y-3"
          >
            {[
              '✓ Real-time scheme synchronization',
              '✓ AI-powered eligibility engine',
              '✓ OCR document verification',
              '✓ Multilingual citizen support',
              '✓ End-to-end audit trail',
            ].map((f, i) => (
              <p key={i} className="text-blue-200/80 text-sm flex items-center gap-2">{f}</p>
            ))}
          </motion.div>
        </div>

        <div className="relative">
          <div className="flex flex-wrap gap-2">
            {ROLE_INFO.map(r => (
              <span key={r.role} className={`text-xs px-3 py-1.5 rounded-full border ${r.color}`}>
                {r.role}
              </span>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-4 flex items-center gap-1.5">
            <Globe size={12} />
            Government of India — Ministry of Electronics & IT
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <p className="text-white font-bold text-xl">GovScheme Admin</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to your administrator account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@govscheme.in"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500/30"
              />
              <label htmlFor="remember" className="text-sm text-slate-400">Keep me signed in</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-xl shadow-blue-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>

          {/* Quick fill hint */}
          <div className="mt-8 p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
            <p className="text-xs font-semibold text-slate-400 mb-2">Demo Credentials</p>
            <button
              onClick={() => { setEmail('admin@govscheme.in'); setPassword('password123'); }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck size={12} />
              admin@govscheme.in / password123
            </button>
          </div>

          <p className="text-center text-slate-600 text-xs mt-8">
            © 2024 Government of India. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
