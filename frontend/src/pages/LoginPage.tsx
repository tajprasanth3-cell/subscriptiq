import { useState, type FormEvent } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Building,
  User,
  X,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertTriangle,
  KeyRound,
  Mail,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import type { Role } from '../types';
import clsx from 'clsx';

const PORTALS: { role: Role; label: string; icon: typeof Building; email: string; pass: string; badge: string }[] = [
  {
    role: 'Business Owner',
    label: 'Business Owner',
    icon: Building,
    email: 'owner@acme.com',
    pass: 'password123',
    badge: 'Acme Corp',
  },
  {
    role: 'Customer',
    label: 'Customer Portal',
    icon: User,
    email: 'customer@techcorp.io',
    pass: 'custpass',
    badge: 'TechCorp',
  },
  {
    role: 'Super Admin',
    label: 'Super Admin',
    icon: ShieldCheck,
    email: 'admin@subscriptiq.platform',
    pass: 'adminpass',
    badge: 'Platform Admin',
  },
];

export const LoginPage = () => {
  const { login, register, resetPassword } = useApp();

  // Portal selection
  const [selectedPortal, setSelectedPortal] = useState<Role>('Business Owner');

  // Form credentials initialized with valid preset
  const [email, setEmail] = useState('owner@acme.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const selectPortal = (portalRole: Role) => {
    setSelectedPortal(portalRole);
    const target = PORTALS.find((p) => p.role === portalRole);
    if (target) {
      setEmail(target.email);
      setPassword(target.pass);
      setFormError('');
    }
  };

  // Password Reset / Create Password Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regRole, setRegRole] = useState<'Business Owner' | 'Customer'>('Business Owner');
  const [regOrgName, setRegOrgName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email/username and password.');
      return;
    }
    setIsSubmitting(true);
    const ok = await login(email.trim(), password.trim(), selectedPortal);
    setIsSubmitting(false);
    if (!ok) {
      setFormError(
        'Invalid email or password. Please check your credentials or click "Create / Reset password".'
      );
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address or username.');
      return;
    }
    if (newPassword.length < 4) {
      setResetError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsResetting(true);
    const ok = await resetPassword(resetEmail.trim(), newPassword);
    setIsResetting(false);
    if (ok) {
      setShowResetModal(false);
      setResetEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setResetError('Failed to update password. Please check backend connection.');
    }
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regOrgName.trim()) {
      setRegError(
        regRole === 'Customer'
          ? 'Please enter your customer or business name.'
          : 'Please provide your organization or company name.'
      );
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter a valid email address.');
      return;
    }
    if (!regMobile.trim()) {
      setRegError('Please enter your mobile number.');
      return;
    }
    if (!/^\d{10}$/.test(regMobile.replace(/\D/g, ''))) {
      setRegError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setShowRegisterModal(false);
    register(regOrgName.trim(), regEmail.trim(), regPassword, regRole, regMobile.trim());
    setRegOrgName('');
    setRegEmail('');
    setRegMobile('');
    setRegPassword('');
  };

  return (
    <div className="h-dvh w-full flex flex-col md:flex-row bg-white select-none overflow-hidden">
      {/* Left Column: Sign-in Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-between h-full min-h-0 overflow-y-auto px-5 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 lg:px-16 lg:py-5 xl:px-20 xl:py-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 18h16" />
                <path d="M7 14V6" />
                <path d="M12 14v-4" />
                <path d="M17 14v-2" />
              </svg>
            </div>
            <span className="font-bold text-2xl text-slate-900 tracking-tight">SubscriptIQ</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="max-w-md w-full my-auto py-2 sm:py-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-4">
            Sign in to access your workspace dashboard.
          </p>

          {/* Portal Switcher Tabs */}
          <div className="mb-5 p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/60">
            {PORTALS.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPortal === p.role;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => selectPortal(p.role)}
                  className={clsx(
                    'flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                    isSelected
                      ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  <Icon className={clsx('w-3.5 h-3.5', isSelected ? 'text-indigo-600' : 'text-slate-400')} />
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Inline Error Alert with Recovery Actions */}
          {formError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-2xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900 leading-snug">{formError}</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setNewPassword('');
                        setConfirmPassword('');
                        setResetError('');
                        setShowResetModal(true);
                      }}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Create / Reset Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email / username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setNewPassword('');
                    setConfirmPassword('');
                    setResetError('');
                    setShowResetModal(true);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>
            </div>

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              )}
            </Button>

            {/* Social logins matching PDF slide 2 */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => login('owner@acme.com', 'password123', selectedPortal)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => login('customer@techcorp.io', 'custpass', selectedPortal)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </form>

          {/* Registration footer */}
          <div className="mt-4 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setRegRole('Customer');
                  setShowRegisterModal(true);
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 flex items-center justify-between pt-2">
          <span>&copy; 2026 SubscriptIQ Inc. All rights reserved.</span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Resilient System Online</span>
          </span>
        </div>
      </div>

      {/* Right Column: Hero Banner */}
      <div className="hidden md:flex md:w-1/2 bg-[#1A183C] text-white p-6 sm:p-10 md:p-12 lg:p-16 xl:p-20 flex-col justify-center relative overflow-hidden">
        {/* Background ambient gradient glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-lg z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 border border-indigo-500/30">
            <span>Multi-Role Cloud Architecture</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
            Every event counted once.
            <br />
            <span className="text-indigo-300">Every charge explained.</span>
          </h1>

          <p className="mt-6 text-sm lg:text-base text-slate-300 leading-relaxed">
            Metered usage, enforced limits and traceable invoices, isolated per business and client.
          </p>

          <div className="mt-8 space-y-3.5">
            {[
              'Super Admin: Platform fleet statistics & global plan catalog',
              'Business Owner: Acme Corp customer limits & metered billing',
              'Customer Portal: Self-service personal usage & receipts',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider mb-1">
              Unified Access
            </p>
            <p className="text-sm font-bold text-white">
              One sign-in for admins, business owners and customers
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your role is detected automatically from your account.
            </p>
          </div>
        </div>
      </div>

      {/* Reset / Create Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Create / Reset Password</h3>
                  <p className="text-xs text-slate-500">Set a new password and sign in immediately</p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 4 characters"
                    className="w-full px-3.5 py-2.5 pr-11 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                <p className="font-semibold mb-0.5">Instant Activation:</p>
                <p className="text-slate-600">
                  Submitting will update your password and log you in to your dashboard immediately.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowResetModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isResetting}>
                  {isResetting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </span>
                  ) : (
                    <span>Save & Sign In</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Organization or Customer Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">
                {regRole === 'Customer' ? 'Create Customer Account' : 'Register Organization'}
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Type Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRegRole('Business Owner')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  regRole === 'Business Owner'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Business Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setRegRole('Customer')}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  regRole === 'Customer'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer Client</span>
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  {regRole === 'Customer' ? 'Your Name or Company' : 'Company / Organization Name'}
                </label>
                <input
                  type="text"
                  required
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  placeholder={
                    regRole === 'Customer' ? 'e.g. Alex Johnson or TechCorp' : 'e.g. Stark Enterprises'
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  {regRole === 'Customer' ? 'Personal or Work Email' : 'Work Email'}
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder={
                    regRole === 'Customer' ? 'alex@techcorp.io' : 'founder@stark.com'
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowRegisterModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {regRole === 'Customer' ? 'Create Customer Account' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
