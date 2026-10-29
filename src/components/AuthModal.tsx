import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { NavDurgaLogo } from './NavDurgaLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  currentUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  onSignOut?: () => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  currentUser,
  onSignOut,
}) => {
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onGoogleSignIn();
      onClose();
    } catch {
      // Ignored
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setResetSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header with Official Master Logo */}
        <div className="bg-gradient-to-b from-slate-50 to-white px-6 pt-8 pb-5 text-center border-b border-slate-100">
          <div className="flex justify-center mb-3">
            <NavDurgaLogo size="xl" withCard className="shadow-xs" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {currentUser
              ? 'Authorized Session'
              : mode === 'signin'
              ? 'Sign In to Nav Durga ERP'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {currentUser
              ? 'Authenticated via Firebase Cloud Security'
              : 'Urla Mill Commercial & Steel Operations Portal'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {currentUser ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authenticated as Active User</span>
                </div>
                <div className="mt-2 text-xs text-slate-700 font-medium">
                  <strong>{currentUser.displayName || 'Authorized Staff'}</strong>
                  <div className="text-slate-500 font-mono text-[11px]">{currentUser.email}</div>
                </div>
              </div>

              {onSignOut && (
                <button
                  type="button"
                  onClick={async () => {
                    await onSignOut();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  Sign Out from ERP
                </button>
              )}
            </div>
          ) : mode === 'signin' ? (
            <>
              {/* Primary Google Firebase Sign-In */}
              <button
                type="button"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await onGoogleSignIn();
                    onClose();
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all hover:border-blue-400 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Or Staff Credentials
                </span>
              </div>

              {/* Email/Password Fields */}
              <form onSubmit={handleDemoSignIn} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Work Email / User ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@navdurgaspat.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-blue-600 hover:underline font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <span>Sign In as Mill Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password Screen */
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {resetSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-emerald-900">Reset Link Dispatched</h3>
                  <p className="text-xs text-emerald-700">
                    If an authorized user exists for <strong>{email}</strong>, password reset instructions have been dispatched.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setResetSent(false);
                    }}
                    className="mt-2 text-xs font-bold text-blue-700 hover:underline block mx-auto"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Enter your authorized corporate email to receive a password recovery link.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="virendra@navdurgaspat.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Send Reset Instructions
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Nav Durga Ispat Pvt. Ltd. • Official Enterprise Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
