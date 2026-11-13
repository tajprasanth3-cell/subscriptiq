import { useState, type FormEvent } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Building,
  ShieldCheck,
  User,
  X,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import type { Role } from '../types';
import clsx from 'clsx';

export const LoginPage = () => {
  const { login, register, setRole } = useApp();

  // Active portal tab: 'Business Owner' | 'Super Admin' | 'Customer'
  const [selectedPortal, setSelectedPortal] = useState<Role>('Business Owner');

  // Form credentials
  const [email, setEmail] = useState('owner@acme.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regOrgName, setRegOrgName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Handle portal switch
  const handleSelectPortal = (portal: Role) => {
    setSelectedPortal(portal);
    setRole(portal);

    if (portal === 'Super Admin') {
      setEmail('admin@subscriptiq.platform');
      setPassword('adminpass');
    } else if (portal === 'Customer') {
      setEmail('customer@techcorp.io');
      setPassword('custpass');
    } else {
      setEmail('owner@acme.com');
      setPassword('password123');
    }
  };

  // Direct 1-click Quick Login
  const handleQuickLogin = (portal: Role) => {
    setSelectedPortal(portal);
    setRole(portal);
    setIsSubmitting(true);
    let targetEmail = 'owner@acme.com';
    let targetPass = 'password123';

    if (portal === 'Super Admin') {
      targetEmail = 'admin@subscriptiq.platform';
      targetPass = 'adminpass';
    } else if (portal === 'Customer') {
      targetEmail = 'customer@techcorp.io';
      targetPass = 'custpass';
    }

    setEmail(targetEmail);
    setPassword(targetPass);
    login(targetEmail, targetPass);
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsSubmitting(true);
    login(email.trim(), password);
    setTimeout(() => setIsSubmitting(false), 600);
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regOrgName.trim()) {
      setRegError('Please provide your organization or company name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter a valid work email.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setShowRegisterModal(false);
    register(regOrgName.trim(), regEmail.trim(), regPassword);
    setRegOrgName('');
    setRegEmail('');
    setRegPassword('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white select-none">
      {/* Left Column: Sign-in Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-5 sm:p-8 md:p-12 lg:p-16 xl:p-20">
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

          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{selectedPortal}</span>
          </span>
        </div>

        {/* Form Body */}
        <div className="max-w-md w-full my-auto py-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
            Select your dedicated role portal to sign in to your dashboard.
          </p>

          {/* 3 Dedicated Role Portals Switcher Tabs */}
          <div className="mb-4 p-1 sm:p-1.5 bg-slate-100 rounded-2xl flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSelectPortal('Business Owner')}
              className={clsx(
                'flex-1 py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 text-[11px] sm:text-xs',
                selectedPortal === 'Business Owner'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Owner</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPortal('Super Admin')}
              className={clsx(
                'flex-1 py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 text-[11px] sm:text-xs',
                selectedPortal === 'Super Admin'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPortal('Customer')}
              className={clsx(
                'flex-1 py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer min-w-0 text-[11px] sm:text-xs',
                selectedPortal === 'Customer'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Customer</span>
            </button>
          </div>

          {/* Portal Description Card */}
          <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            {selectedPortal === 'Business Owner' && (
              <p className="text-slate-600">
                <strong>Business Owner Portal (Acme Corp)</strong>: Full control over plans, customer quotas, idempotent event ingestion, and billing statements.
              </p>
            )}
            {selectedPortal === 'Super Admin' && (
              <p className="text-slate-600">
                <strong>Platform Admin Console</strong>: Oversee all 248 organizations, platform MRR (₹92,400), global plan catalog, and system audit trail.
              </p>
            )}
            {selectedPortal === 'Customer' && (
              <p className="text-slate-600">
                <strong>Customer Self-Service Portal</strong>: Track personal API and storage usage gauges, current period bill (₹1,499), and download invoices.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Work email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions sent to ' + email);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
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
                  <span>Sign in to {selectedPortal} Portal</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              )}
            </Button>
          </form>

          {/* 1-Click Quick Demo Login Row */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              1-Click Instant Demo Launch
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('Business Owner')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                title="Sign in immediately as Business Owner (John Smith / Acme Corp)"
              >
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">Owner (Acme)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Super Admin')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                title="Sign in immediately as Super Admin (Platform fleet)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">Admin (Platform)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Customer')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                title="Sign in immediately as End Customer (Alex Johnson / TechCorp)"
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">Customer (TechCorp)</span>
              </button>
            </div>
          </div>

          {/* Registration footer */}
          <div className="mt-5 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              New business?{' '}
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                Register your organization
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
      <div className="w-full md:w-1/2 bg-[#1A183C] text-white p-6 sm:p-10 md:p-12 lg:p-16 xl:p-20 flex flex-col justify-center relative overflow-hidden">
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
              Active Portal Selection
            </p>
            <p className="text-sm font-bold text-white">
              {selectedPortal === 'Super Admin'
                ? 'Platform Infrastructure Fleet (All 248 Orgs)'
                : selectedPortal === 'Customer'
                ? 'TechCorp End Consumer View (Self-Service)'
                : 'Acme Corp Production Tenant (Professional Tier)'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Auto-reconciles usage events against customer quotas in under 12ms.
            </p>
          </div>
        </div>
      </div>

      {/* Register Organization Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Register Organization</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  placeholder="e.g. Stark Enterprises"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="founder@stark.com"
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
                  Complete Registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
