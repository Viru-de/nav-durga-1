import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppUser } from '../types';
import { PlatformApi } from '../services/platformApi';
import { NavDurgaLogo } from './NavDurgaLogo';
import { SeoHead } from './SeoHead';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
  onBackToWebsite: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToWebsite }) => {
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showRoleRef, setShowRoleRef] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError('Please enter your username or email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await PlatformApi.login(identifier.trim(), password, rememberMe);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      const res = await PlatformApi.forgotPassword(identifier.trim());
      setInfoMessage(
        res.verificationCodeHint
          ? `${res.message} Verification Code: ${res.verificationCodeHint}`
          : res.message
      );
      setMode('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await PlatformApi.resetPassword(resetCode.trim(), newPassword);
      setInfoMessage(res.message);
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const quickFillAccount = (userIdent: string, userPass: string) => {
    setMode('login');
    setIdentifier(userIdent);
    setPassword(userPass);
    setError(null);
  };

  return (
    <>
      <SeoHead
        title="ERP Login | Nav Durga Ispat Pvt. Ltd."
        description="Authorized staff login portal for Nav Durga Ispat ERP, Daily Rate Management, and WhatsApp System."
        canonicalPath="/login"
        noIndex
      />

      <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] via-white to-[#EAF2F8] flex flex-col justify-center py-10 px-4">
        <div className="max-w-md w-full mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737D88] hover:text-[#105186] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Website</span>
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#105186] bg-[#EAF2F8] border border-[#105186]/25 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC Protected
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#C7CED6] shadow-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
              <NavDurgaLogo size="md" withCard priority />
              <div>
                <h1 className="font-display text-xl font-extrabold text-[#263442]">
                  Nav Durga ERP Login
                </h1>
                <p className="text-xs text-[#737D88] font-medium">
                  Rate Management, CRM, Website CMS &amp; WhatsApp System
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. superadmin or email@navdurgasteel.com"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span>Remember session (30 days)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('forgot');
                    }}
                    className="font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#105186] hover:bg-[#0B3A60] disabled:opacity-60 text-white text-sm font-bold shadow-sm cursor-pointer transition-colors"
                >
                  {loading ? 'Signing In...' : 'Sign In to Nav Durga ERP'}
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="text-xs text-slate-600">
                  Enter your ERP username or registered email to generate a 6-digit password reset verification code.
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. rajesh.sales"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
                  >
                    {loading ? 'Generating Code...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Collapsible Role Quick-Access Helper for Demo/Testing */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRoleRef((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span>Authorized Role Accounts (Quick Fill)</span>
                {showRoleRef ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRoleRef && (
                <div className="mt-3 space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#EAF2F8] border border-[#105186]/25 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-[#0B3A60]">SUPER ADMIN — Virendra Patel</div>
                      <div className="text-[#263442] font-mono">superadmin / NavDurga@2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickFillAccount('superadmin', 'NavDurga@2026')}
                      className="px-2.5 py-1 rounded-lg bg-[#105186] hover:bg-[#0B3A60] text-white font-bold cursor-pointer"
                    >
                      Use
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-blue-900">ADMIN — Operations Admin</div>
                      <div className="text-slate-600 font-mono">admin / Admin@2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickFillAccount('admin', 'Admin@2026')}
                      className="px-2.5 py-1 rounded-lg bg-blue-700 text-white font-bold cursor-pointer"
                    >
                      Use
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-emerald-900">SALES TEAM (4 Accounts)</div>
                      <div className="text-slate-600 font-mono">rajesh.sales / priya.sales / manish.sales / anil.sales • Sales@2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickFillAccount('rajesh.sales', 'Sales@2026')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold cursor-pointer shrink-0"
                    >
                      Use Sales
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
