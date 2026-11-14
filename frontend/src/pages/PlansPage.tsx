import { useState, Fragment, type FormEvent } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import type { SubscriptionStatus, PlanTier, Plan } from '../types';
import {
  Check,
  ChevronRight,
  AlertOctagon,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Layers,
  Table,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  Download,
  Bell,
  ArrowRight,
  Lock,
  Receipt,
  Zap,
  Activity,
} from 'lucide-react';
import clsx from 'clsx';
import { formatCurrency } from '../utils/formatters';

export const PlansPage = () => {
  const {
    role,
    plansList,
    currentPlan,
    subscriptionStatus,
    billingCycle,
    setBillingCycle,
    upgradePlan,
    createPlan,
    deletePlan,
    cancelSubscription,
    reactivateSubscription,
    setSubscriptionStatus,
    currentInvoice,
    downloadInvoicePDF,
    payInvoice,
    setCurrentTab,
    unreadCount,
  } = useApp();

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Checkout and payment modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'processing' | 'success'>('review');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('acme.corp@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8921 7741 9012');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [cardHolder, setCardHolder] = useState('John Smith');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [receiptInfo, setReceiptInfo] = useState<{
    txnId: string;
    invoiceNumber: string;
    planName: string;
    amount: number;
    billingCycle: string;
    date: string;
  } | null>(null);

  // Create plan form state
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState(999);
  const [newPlanApiLimit, setNewPlanApiLimit] = useState('50,000');
  const [newPlanStorage, setNewPlanStorage] = useState('25 GB');

  const isAdmin = role === 'Super Admin';
  const canManageSubscription = role !== 'Customer';

  const lifecycleSteps = [
    { id: 'plan_selected', label: 'Plan selected', color: 'indigo' },
    { id: 'active', label: 'Active', color: 'emerald' },
    { id: 'renewal_due', label: 'Renewal due', color: 'amber' },
    { id: 'past_due', label: 'Past due / Suspended', color: 'rose' },
    { id: 'cancelled', label: 'Cancelled / Expired', color: 'slate' },
  ];

  const handleOpenCheckout = (plan: Plan) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutStep('review');
    setPaymentMethod('upi');
    setIsCheckoutModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedPlanForCheckout) return;
    setCheckoutStep('processing');

    // Simulate realistic bank verification & payment gateway roundtrip
    await new Promise((res) => setTimeout(res, 1200));

    try {
      // 1. Upgrade subscription and wait for confirmation before accepting payment.
      const planAccepted = await upgradePlan(selectedPlanForCheckout.name);
      if (!planAccepted) {
        setCheckoutStep('review');
        return;
      }

      // 2. Settle the current invoice for the newly selected plan.
      const paidInvoice = await payInvoice(currentInvoice.id);
      if (!paidInvoice) {
        setCheckoutStep('review');
        return;
      }

      setReceiptInfo({
        txnId: `TXN_${Math.floor(10000000 + Math.random() * 90000000)}`,
        invoiceNumber: paidInvoice.invoiceNumber,
        planName: selectedPlanForCheckout.name,
        amount: paidInvoice.total,
        billingCycle,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      setCheckoutStep('success');
    } catch {
      setCheckoutStep('review');
    }
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    createPlan({
      name: newPlanName as PlanTier,
      price: Number(newPlanPrice),
      currency: '₹',
      billingInterval: 'month',
      description: 'Custom tailored enterprise quota plan',
      apiLimit: `${newPlanApiLimit} API requests`,
      storageLimit: newPlanStorage,
      features: [
        `${newPlanApiLimit} API requests`,
        newPlanStorage,
        'Custom webhooks & analytics',
        'Priority business support',
      ],
      isCurrent: false,
    });

    setNewPlanName('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Plans and subscription"
        subtitle="Choose, change, create or cancel subscription plans"
        actions={
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* View Switcher (Cards vs Table matching Slide 10) */}
            <div className="hidden sm:flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('cards')}
                className={clsx(
                  'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Tier Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={clsx(
                  'px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Plans Catalog</span>
              </button>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center p-0.5 sm:p-1 bg-slate-200/70 rounded-xl text-[11px] sm:text-xs font-semibold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={clsx(
                  'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer',
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={clsx(
                  'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer',
                  billingCycle === 'annual'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>Annual</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-sm">
                  -20%
                </span>
              </button>
            </div>

            {/* Create Plan Button — platform catalog is maintained by Super Admin */}
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowCreateModal(true)}
              >
                <span className="hidden sm:inline">Create Plan</span>
                <span className="sm:hidden">Plan</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        {/* Active Plan & In-Page Notification Status Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-700/50 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">
                  Active Subscription
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentPlan} Tier
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/90">
                  {billingCycle === 'annual' ? 'Annual Billing (-20%)' : 'Monthly Billing'}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                Your subscription is active and verified. Auto-renewal scheduled for{' '}
                <strong className="text-white">Apr 30, 2026</strong>. Invoices and quota updates are automatically reconciled.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 relative z-10 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={<Receipt className="w-3.5 h-3.5 text-indigo-300" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => downloadInvoicePDF(currentInvoice.id)}
            >
              View Paid Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Bell className="w-3.5 h-3.5 text-amber-300" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => setCurrentTab('notifications')}
            >
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Button>
          </div>
        </div>

        {/* Mobile View Toggle Bar */}
        <div className="sm:hidden flex items-center justify-between p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('cards')}
            className={clsx(
              'flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5',
              viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tier Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={clsx(
              'flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5',
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            )}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Plans Catalog</span>
          </button>
        </div>

        {/* View Mode 1: Tier Pricing Cards (Mockup 3 & Slide 4) */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansList.map((plan) => {
              const isSelected = plan.name === currentPlan;
              const price =
                billingCycle === 'annual'
                  ? Math.round(plan.price * 0.8 * 12)
                  : plan.price;

              return (
                <Card
                  key={plan.id}
                  highlight={isSelected}
                  className={clsx(
                    'flex flex-col justify-between relative transition-all',
                    isSelected && 'border-indigo-600 ring-2 ring-indigo-600/15 shadow-md'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      {isSelected && <Badge variant="active">Current Plan</Badge>}
                    </div>

                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                    <div className="mt-5 pb-5 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {formatCurrency(price, plan.currency)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          / {billingCycle === 'annual' ? 'year' : 'month'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Included limits
                      </div>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                          <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4">
                    {isSelected ? (
                      <Button variant="outline" fullWidth disabled>
                        ✓ Current Active Plan
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenCheckout(plan)}
                      >
                        Select & Pay for {plan.name}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* View Mode 2: Subscription Plans Table (Slide 10) */}
        {viewMode === 'table' && (
          <Card padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Subscription Plans Catalog</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage tiers, pricing quotas, and API allowances across the platform
                </p>
              </div>
            </div>

            <div className="responsive-table-wrapper overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-4 px-6">Tier Name</th>
                    <th className="py-4 px-6">Base Rate</th>
                    <th className="py-4 px-6">API Limit</th>
                    <th className="py-4 px-6">Storage Limit</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plansList.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{plan.name}</div>
                        <div className="text-slate-400 text-xs font-normal">{plan.description}</div>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                        {formatCurrency(plan.price, plan.currency)} / mo
                      </td>
                      <td className="py-4 px-6">{plan.apiLimit}</td>
                      <td className="py-4 px-6">{plan.storageLimit}</td>
                      <td className="py-4 px-6">
                        {plan.name === currentPlan ? (
                          <Badge variant="active">Current</Badge>
                        ) : (
                          <Badge variant="info">Available</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={plan.name === currentPlan ? 'outline' : 'primary'}
                            size="sm"
                            disabled={plan.name === currentPlan}
                            onClick={() => handleOpenCheckout(plan)}
                          >
                            {plan.name === currentPlan ? 'Active' : 'Checkout & Pay'}
                          </Button>
                          {isAdmin && plansList.length > 1 && plan.name !== currentPlan && (
                            <button
                              onClick={() => deletePlan(plan.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Delete plan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Bottom Card: Subscription status lifecycle */}
        <Card className="space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Subscription status</h3>
            <p className="text-xs text-slate-500 mt-1">
              Every change is validated, billed correctly and written to audit history. Click any step below to simulate lifecycle transitions.
            </p>
          </div>

          {/* Stepper Pipeline */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 py-2">
            {lifecycleSteps.map((step, idx) => {
              const isActiveStep = subscriptionStatus === step.id;

              return (
                <Fragment key={step.id}>
                  <div
                    onClick={() =>
                      canManageSubscription &&
                      setSubscriptionStatus(step.id as SubscriptionStatus)
                    }
                    className={clsx(
                      'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
                      canManageSubscription ? 'cursor-pointer' : 'cursor-default',
                      isActiveStep
                        ? step.color === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-500/20'
                          : step.color === 'indigo'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 ring-2 ring-indigo-500/20'
                          : step.color === 'amber'
                          ? 'bg-amber-50 text-amber-700 border border-amber-300 ring-2 ring-amber-500/20'
                          : step.color === 'rose'
                          ? 'bg-rose-50 text-rose-700 border border-rose-300 ring-2 ring-rose-500/20'
                          : 'bg-slate-100 text-slate-700 border border-slate-300 ring-2 ring-slate-500/20'
                        : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200'
                    )}
                  >
                    {step.label}
                  </div>
                  {idx < lifecycleSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </Fragment>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            {subscriptionStatus === 'cancelled' ? (
              <div className="flex items-center gap-3">
                <span className="text-rose-600 font-semibold">
                  Subscription is currently cancelled.
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={reactivateSubscription}
                >
                  Reactivate Plan
                </Button>
              </div>
            ) : (
              <>
                <span className="text-slate-400">
                  Next renewal scheduled for{' '}
                  <strong className="text-slate-700">Apr 30, 2026</strong> via automatic invoicing
                </span>
                <button
                  onClick={() => setConfirmCancelOpen(true)}
                  className="text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
                >
                  Cancel subscription
                </button>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* ----------------- CHECKOUT & PAYMENT MODAL ----------------- */}
      {isCheckoutModalOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {checkoutStep === 'success'
                      ? 'Payment Confirmed & Plan Active!'
                      : 'Subscription Checkout & Payment'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {checkoutStep === 'success'
                      ? 'Transaction authorized and receipt generated'
                      : 'Secure 256-bit SSL encrypted billing gateway'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: REVIEW & PAY */}
            {checkoutStep === 'review' && (
              <div className="space-y-6">
                {/* Order Summary Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Selected Subscription
                      </span>
                      <h4 className="text-xl font-black text-slate-900 mt-0.5">
                        {selectedPlanForCheckout.name} Tier
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedPlanForCheckout.description}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-black text-slate-900">
                        {formatCurrency(
                          billingCycle === 'annual'
                            ? Math.round(selectedPlanForCheckout.price * 0.8 * 12)
                            : selectedPlanForCheckout.price,
                          selectedPlanForCheckout.currency
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        / {billingCycle === 'annual' ? 'year (20% saved)' : 'month'}
                      </span>
                    </div>
                  </div>

                  {/* Quota Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-200/70 text-xs text-slate-700">
                    <div className="p-2 rounded-xl bg-white border border-slate-100 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{selectedPlanForCheckout.apiLimit}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-100 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{selectedPlanForCheckout.storageLimit}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-100 font-medium col-span-2 sm:col-span-1 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>24/7 Priority SLA</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={clsx(
                        'p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5',
                        paymentMethod === 'upi'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      <QrCode className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs">UPI / QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={clsx(
                        'p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5',
                        paymentMethod === 'card'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs">Credit / Debit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={clsx(
                        'p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5',
                        paymentMethod === 'netbanking'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs">Net Banking</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Form for UPI */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/30 via-white to-slate-50 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Stylized QR Code */}
                      <div className="w-32 h-32 bg-white p-2 rounded-2xl border-2 border-indigo-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                        <div className="w-full h-full bg-slate-900 p-1.5 rounded-xl flex items-center justify-center text-white text-[10px] text-center font-mono relative overflow-hidden">
                          <div className="absolute inset-2 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center">
                            <QrCode className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 flex-1 text-center sm:text-left">
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                          Instant Scan & Pay
                        </span>
                        <h5 className="font-bold text-sm text-slate-900">
                          Scan with any UPI App
                        </h5>
                        <p className="text-xs text-slate-500">
                          Google Pay, PhonePe, Paytm, BHIM, or CRED supported.
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="Enter your UPI ID (e.g. name@okhdfcbank)"
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl"
                          />
                          <span className="text-[11px] font-semibold text-emerald-600 shrink-0 bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-200">
                            Verified ✓
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Form for Card */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Form for Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Select Popular Bank
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={clsx(
                            'p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center',
                            selectedBank === bank
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs ring-1 ring-indigo-500'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          )}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant activation • 100% money-back guarantee within 14 days</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-initial"
                      onClick={() => setIsCheckoutModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 sm:flex-initial"
                      icon={<ShieldCheck className="w-4 h-4" />}
                      onClick={handleProcessPayment}
                    >
                      Pay & Activate {selectedPlanForCheckout.name}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PROCESSING ANIMATION */}
            {checkoutStep === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin flex items-center justify-center" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Authorizing Secure Payment...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Contacting banking gateway and updating your subscription quota in real time...
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT SUCCESS & CONFIRMATION SCREEN */}
            {checkoutStep === 'success' && receiptInfo && (
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">
                      Payment Received Successfully!
                    </h4>
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      Your subscription has been switched to {receiptInfo.planName} Tier
                    </p>
                  </div>
                </div>

                {/* Digital Receipt Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 font-semibold text-slate-600">
                    <span>Payment Receipt</span>
                    <Badge variant="active">PAID</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400">Transaction Ref:</span>
                      <p className="font-mono font-bold text-slate-900">{receiptInfo.txnId}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Invoice Number:</span>
                      <p className="font-mono font-bold text-slate-900">{receiptInfo.invoiceNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Amount Paid:</span>
                      <p className="font-bold text-slate-900 text-sm">
                        {formatCurrency(receiptInfo.amount, '₹')}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Payment Mode:</span>
                      <p className="font-bold text-slate-900">{paymentMethod.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Real-time System Lifecycle State */}
                <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    System State Reconciled:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Quotas:</strong> Upgraded & active</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Invoice:</strong> Marked as PAID</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Ledger:</strong> Tamper-evident audit logged</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Notifications:</strong> Feed updated</span>
                    </div>
                  </div>
                </div>

                {/* Notification Feed Confirmation Alert */}
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-start gap-3 text-xs text-indigo-900">
                  <Bell className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">In-App Notification Sent:</strong>
                    <p className="text-indigo-700 mt-0.5">
                      "Subscription successfully switched to {receiptInfo.planName} ({receiptInfo.billingCycle} billing)" has been logged to your notification feed.
                    </p>
                  </div>
                </div>

                {/* Next Steps & Workflow Buttons */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Choose Your Next Flow:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Flow 1: Go to Dashboard */}
                    <button
                      onClick={() => {
                        setIsCheckoutModalOpen(false);
                        setCurrentTab('dashboard');
                      }}
                      className="p-3.5 rounded-2xl border-2 border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-between transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <Activity className="w-4 h-4 shrink-0 text-white" />
                        <div>
                          <div>Go to Overview Dashboard</div>
                          <span className="text-[10px] font-normal text-indigo-100">
                            See updated quotas and KPI metrics
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white shrink-0 ml-2" />
                    </button>

                    {/* Flow 2: Download Tax Invoice PDF */}
                    <button
                      onClick={() => {
                        downloadInvoicePDF(currentInvoice.id);
                        setIsCheckoutModalOpen(false);
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white text-slate-800 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <Download className="w-4 h-4 shrink-0 text-indigo-600" />
                        <div>
                          <div>Download Tax Invoice PDF</div>
                          <span className="text-[10px] font-normal text-slate-500">
                            Printable receipt with GSTIN breakdown
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {/* Flow 3: Test API Ingestion */}
                    <button
                      onClick={() => {
                        setIsCheckoutModalOpen(false);
                        setCurrentTab('usage');
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white text-slate-800 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <Zap className="w-4 h-4 shrink-0 text-amber-500" />
                        <div>
                          <div>Simulate API Events</div>
                          <span className="text-[10px] font-normal text-slate-500">
                            Send test requests on the new quota
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {/* Flow 4: Notification Center */}
                    <button
                      onClick={() => {
                        setIsCheckoutModalOpen(false);
                        setCurrentTab('notifications');
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white text-slate-800 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <Bell className="w-4 h-4 shrink-0 text-indigo-600" />
                        <div>
                          <div>Notification Center</div>
                          <span className="text-[10px] font-normal text-slate-500">
                            Review logged alert & audit history
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Create New Pricing Tier</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Plan Tier Name
                </label>
                <input
                  type="text"
                  required
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="e.g. Startup, Scale, Ultimate"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Monthly Base Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  API Requests Allowance
                </label>
                <input
                  type="text"
                  required
                  value={newPlanApiLimit}
                  onChange={(e) => setNewPlanApiLimit(e.target.value)}
                  placeholder="e.g. 250,000"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Storage Allowance
                </label>
                <input
                  type="text"
                  required
                  value={newPlanStorage}
                  onChange={(e) => setNewPlanStorage(e.target.value)}
                  placeholder="e.g. 100 GB"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save New Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-900">Cancel Subscription?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your service will remain active until the end of the billing period on <strong>Apr 30, 2026</strong>. After this date, your quota will downgrade to free tier and limits will be restricted.
            </p>
            <div className="pt-3 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmCancelOpen(false)}>
                Keep My Plan
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  cancelSubscription();
                  setConfirmCancelOpen(false);
                }}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
