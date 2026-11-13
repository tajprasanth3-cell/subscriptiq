import { useState, Fragment, type FormEvent } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import type { SubscriptionStatus, PlanTier } from '../types';
import { Check, ChevronRight, AlertOctagon, RotateCcw, Plus, Trash2, Edit3, X, Layers, Table } from 'lucide-react';
import clsx from 'clsx';
import { formatCurrency } from '../utils/formatters';

export const PlansPage = () => {
  const {
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
  } = useApp();

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Create plan form state
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState(999);
  const [newPlanApiLimit, setNewPlanApiLimit] = useState('50,000');
  const [newPlanStorage, setNewPlanStorage] = useState('25 GB');

  const lifecycleSteps = [
    { id: 'plan_selected', label: 'Plan selected', color: 'indigo' },
    { id: 'active', label: 'Active', color: 'emerald' },
    { id: 'renewal_due', label: 'Renewal due', color: 'amber' },
    { id: 'past_due', label: 'Past due / Suspended', color: 'rose' },
    { id: 'cancelled', label: 'Cancelled / Expired', color: 'slate' },
  ];

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

            {/* Create Plan Button */}
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowCreateModal(true)}
            >
              <span className="hidden sm:inline">+ Create Plan</span>
              <span className="sm:hidden">+ Plan</span>
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
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
                    isSelected && 'border-indigo-600 ring-2 ring-indigo-600/15'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      {isSelected && <Badge variant="active">Current</Badge>}
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
                        Current plan
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => upgradePlan(plan.name)}
                      >
                        Select {plan.name}
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
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowCreateModal(true)}
              >
                + Create Plan
              </Button>
            </div>

            <div className="responsive-table-wrapper overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-xs md:text-sm">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Plan Name</th>
                    <th className="py-3 px-6">Price</th>
                    <th className="py-3 px-6">API Requests</th>
                    <th className="py-3 px-6">Storage</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {plansList.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
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
                        <Badge variant="active">Active</Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => upgradePlan(plan.name)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Apply plan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {plansList.length > 1 && (
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
                    onClick={() => setSubscriptionStatus(step.id as SubscriptionStatus)}
                    className={clsx(
                      'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer',
                      isActiveStep
                        ? step.color === 'emerald'
                          ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500'
                          : step.color === 'amber'
                          ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500'
                          : step.color === 'rose'
                          ? 'bg-rose-100 text-rose-800 ring-2 ring-rose-500'
                          : 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-500'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {step.label}
                  </div>

                  {idx < lifecycleSteps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </Fragment>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span
                className={clsx(
                  'w-2.5 h-2.5 rounded-full',
                  subscriptionStatus === 'active'
                    ? 'bg-emerald-500'
                    : subscriptionStatus === 'cancelled'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                )}
              />
              <span>
                Current status: <strong className="text-slate-800 uppercase">{subscriptionStatus}</strong>
              </span>
            </div>

            {subscriptionStatus === 'cancelled' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={reactivateSubscription}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reactivate subscription
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmCancelOpen(true)}
                icon={<AlertOctagon className="w-3.5 h-3.5" />}
              >
                Cancel subscription
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Create Subscription Plan</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="e.g. Growth, Custom VIP"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Monthly Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  API Requests Quota
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
