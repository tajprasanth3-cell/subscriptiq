import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import type { AlertRules } from '../types';
import {
  Check,
  BellRing,
  Zap,
  CheckCheck,
  AlertTriangle,
  CheckCircle2,
  Star,
  CreditCard,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';

export const AlertsPage = () => {
  const {
    alertRules,
    updateAlertRules,
    notifications,
    triggerTestAlert,
    markNotificationsAsRead,
    unreadCount,
  } = useApp();

  const [formRules, setFormRules] = useState<AlertRules>(alertRules);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateAlertRules(formRules);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getNotificationIcon = (msg: string, type: string) => {
    if (msg.includes('limit') || msg.includes('threshold') || type === 'Threshold') {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (msg.includes('Invoice') || type === 'System') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }
    if (msg.includes('upgrade') || msg.includes('plan')) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 fill-amber-500" />
        </div>
      );
    }
    if (msg.includes('payment') || msg.includes('received') || type === 'Billing') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
        <Clock className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Limits and alerts"
        subtitle="Rules for thresholds and exceeded limits & live activity stream"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Zap className="w-3.5 h-3.5" />}
              onClick={() => triggerTestAlert()}
            >
              Test Trigger
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={isSaved ? <Check className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
              onClick={handleSave}
            >
              {isSaved ? 'Rules Saved!' : 'Save rules'}
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Threshold Alerts Form */}
          <Card className="space-y-6">
            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Threshold alerts
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  First alert at (% of limit)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formRules.firstAlertPercentage}
                    onChange={(e) =>
                      setFormRules({ ...formRules, firstAlertPercentage: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Second alert at (% of limit)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={formRules.secondAlertPercentage}
                    onChange={(e) =>
                      setFormRules({ ...formRules, secondAlertPercentage: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    %
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-900 mb-3">
                  When a limit is exceeded
                </label>
                <div className="space-y-3">
                  {[
                    {
                      id: 'notify_only',
                      label: 'Notify only',
                      desc: 'Allow usage, alert the customer',
                    },
                    {
                      id: 'charge_overage',
                      label: 'Charge overage',
                      desc: 'Allow usage, bill at overage rate',
                    },
                    {
                      id: 'block_usage',
                      label: 'Block usage',
                      desc: 'Reject new events until upgrade',
                    },
                  ].map((option) => {
                    const isChecked = formRules.actionOnExceed === option.id;

                    return (
                      <label
                        key={option.id}
                        className={clsx(
                          'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
                          isChecked
                            ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/20'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <input
                          type="radio"
                          name="actionOnExceed"
                          checked={isChecked}
                          onChange={() =>
                            setFormRules({
                              ...formRules,
                              actionOnExceed: option.id as AlertRules['actionOnExceed'],
                            })
                          }
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{option.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Right Column: Notifications Feed (Slide 13) */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markNotificationsAsRead}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">Stay updated with the latest activities</p>

            <div className="space-y-3 pt-1 max-h-[480px] overflow-y-auto">
              {notifications.map((n) => {
                return (
                  <div
                    key={n.id}
                    className={clsx(
                      'p-3 sm:p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3.5 transition-colors',
                      n.unread ? 'bg-indigo-50/30 border-indigo-200' : 'bg-slate-50/80 border-slate-100'
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {getNotificationIcon(n.message, n.type)}
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-slate-800 leading-snug">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{n.type}</p>
                      </div>
                    </div>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-medium shrink-0 pl-11 sm:pl-0 sm:ml-2">
                      {n.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
