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

      <div className="min-h-screen bg-[var(--color-linen)] flex flex-col justify-center py-10 px-4">
        <div className="max-w-md w-full mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-navy)] hover:text-[var(--color-text-secondary)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Website</span>
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-amber)] bg-[var(--color-navy)] border border-[var(--color-amber)]/40 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC Protected
            </span>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3.5 pb-5 border-b border-[var(--color-border)]">
              <NavDurgaLogo size="md" withCard priority />
              <div>
                <h1 className="font-display text-xl font-extrabold text-[var(--color-navy)]">
                  Nav Durga ERP Login
                </h1>
                <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                  Rate Management, CRM, Website CMS &amp; WhatsApp System
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[var(--color-amber-soft)] border border-[var(--color-amber)] text-xs font-bold text-[var(--color-navy)]">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-xl bg-[var(--color-navy)] border border-[var(--color-amber)]/45 text-xs font-bold text-[var(--color-linen)] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-amber)] shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-navy)] mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. superadmin or email@navdurgasteel.com"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-linen)]/45 focus:bg-white text-sm text-[var(--color-navy)] outline-none focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-navy)] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-linen)]/45 focus:bg-white text-sm text-[var(--color-navy)] outline-none focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-navy)] cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 font-medium text-[var(--color-text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[var(--color-border)] accent-[#14213D]"
                    />
                    <span>Remember session (30 days)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('forgot');
                    }}
                    className="font-bold text-[var(--color-navy)] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="nd-btn-primary w-full py-3 rounded-xl disabled:opacity-60 text-sm font-bold shadow-sm cursor-pointer"
                >
                  {loading ? 'Signing In...' : 'Sign In to Nav Durga ERP'}
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="text-xs text-[var(--color-text-secondary)]">
                  Enter your ERP username or registered email to generate a 6-digit password reset verification code.
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-navy)] mb-1.5">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. rajesh.sales"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] outline-none focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="nd-btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="nd-btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {loading ? 'Generating Code...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-navy)] mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm font-mono text-[var(--color-navy)] outline-none focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-navy)] mb-1.5">
                    New Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-navy)] outline-none focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-navy)]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="nd-btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="nd-btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Collapsible Role Quick-Access Helper for Demo/Testing */}
            <div className="pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setShowRoleRef((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-navy)] cursor-pointer"
              >
                <span>Authorized Role Accounts (Quick Fill)</span>
                {showRoleRef ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRoleRef && (
                <div className="mt-3 space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[var(--color-navy)] border border-[var(--color-amber)]/40 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-[var(--color-amber)]">SUPER ADMIN — Virendra Patel</div>
                      <div className="text-[var(--color-linen)] font-mono">superadmin / NavDurga@2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickFillAccount('superadmin', 'NavDurga@2026')}
                      className="nd-btn-amber px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                    >
                      Use
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--color-linen)] border border-[var(--color-border)] flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-[var(--color-navy)]">ADMIN — Operations Admin</div>
                      <div className="text-[var(--color-text-secondary)] font-mono">admin / Admin@2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickFillAccount('admin', 'Admin@2026')}
                      className="nd-btn-primary px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                    >
                      Use
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--color-linen)]/70 border border-[var(--color-border)] flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-[var(--color-navy)]">SALES TEAM (4 Accounts)</div>
                      <div className="text-[var(--color-text-secondary)] font-mono">rajesh.sales / priya.sales / manish.sales / anil.sales • Sales@2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickFillAccount('rajesh.sales', 'Sales@2026')}
                      className="nd-btn-primary px-2.5 py-1 rounded-lg font-bold cursor-pointer shrink-0"
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
