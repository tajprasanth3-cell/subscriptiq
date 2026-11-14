import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import type { AlertRules, AlertNotification } from '../types';
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
  Eye,
  X,
  Download,
  Building2,
} from 'lucide-react';
import clsx from 'clsx';
import { formatCurrency } from '../utils/formatters';

export const AlertsPage = () => {
  const {
    role,
    alertRules,
    updateAlertRules,
    notifications,
    triggerTestAlert,
    markNotificationsAsRead,
    markSingleNotificationAsRead,
    unreadCount,
    downloadInvoicePDF,
    setCurrentTab,
  } = useApp();

  const canManageAlerts = role !== 'Customer';

  const [formRules, setFormRules] = useState<AlertRules>(alertRules);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedNotificationForReader, setSelectedNotificationForReader] =
    useState<AlertNotification | null>(null);

  const handleSave = () => {
    updateAlertRules(formRules);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleOpenNotification = (n: AlertNotification) => {
    setSelectedNotificationForReader(n);
    if (n.unread) {
      markSingleNotificationAsRead(n.id);
    }
  };

  const getNotificationIcon = (msg: string, type: string) => {
    if (msg.includes('limit') || msg.includes('threshold') || type === 'Threshold') {
      return (
        <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (msg.includes('Invoice') || type === 'System') {
      return (
        <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }
    if (msg.includes('upgrade') || msg.includes('plan')) {
      return (
        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
          <Star className="w-4 h-4 fill-indigo-500" />
        </div>
      );
    }
    if (msg.includes('payment') || msg.includes('received') || type === 'Billing') {
      return (
        <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
          <CreditCard className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
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
          canManageAlerts ? (
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
          ) : undefined
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        <div
          className={clsx(
            'grid grid-cols-1 gap-8',
            canManageAlerts && 'lg:grid-cols-2'
          )}
        >
          {/* Left Column: Threshold Alerts Form */}
          {canManageAlerts && (
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
          )}

          {/* Right Column: Notifications Feed (Slide 13) */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">Notifications</h3>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    All read
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
            <p className="text-xs text-slate-400">
              Click any notification to read full customer, ID, and transaction details
            </p>

            <div className="space-y-3 pt-1 max-h-[520px] overflow-y-auto">
              {notifications.map((n) => {
                const effectiveCustId =
                  n.customerId ||
                  (n.message.includes('TechCorp')
                    ? 'cust_4'
                    : n.message.includes('Acme Corp')
                    ? 'cust_1'
                    : n.message.includes('Innovate Ltd')
                    ? 'cust_5'
                    : n.message.includes('Global Solutions')
                    ? 'cust_6'
                    : undefined);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleOpenNotification(n)}
                    className={clsx(
                      'p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5 transition-all cursor-pointer group',
                      n.unread
                        ? 'bg-indigo-50/50 border-indigo-200/90 hover:bg-indigo-50/80 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    )}
                    title="Click to read full notification details"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      {getNotificationIcon(n.message, n.type)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs md:text-sm font-semibold text-slate-800 leading-snug break-words">
                            {n.message}
                          </p>
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ring-2 ring-indigo-200 animate-pulse" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]">
                          <span className="font-semibold text-slate-500">{n.type}</span>
                          {effectiveCustId && (
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                              ID: {effectiveCustId}
                            </span>
                          )}
                          <span className="text-slate-400">• {n.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                      <Button
                        variant={n.unread ? 'primary' : 'outline'}
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenNotification(n);
                        }}
                      >
                        Read
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ----------------- READ NOTIFICATION DETAILS MODAL ----------------- */}
      {selectedNotificationForReader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {getNotificationIcon(
                  selectedNotificationForReader.message,
                  selectedNotificationForReader.type
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {selectedNotificationForReader.type} Alert
                    </span>
                    <Badge variant="active">Read</Badge>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mt-0.5">
                    Notification Details
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotificationForReader(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Identification Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Customer & Account Identification</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Customer Name:</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedNotificationForReader.customerName ||
                      (selectedNotificationForReader.message.includes('TechCorp')
                        ? 'TechCorp'
                        : selectedNotificationForReader.message.includes('Acme Corp')
                        ? 'Acme Corp'
                        : selectedNotificationForReader.message.includes('Innovate Ltd')
                        ? 'Innovate Ltd'
                        : 'Global Solutions')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Customer ID:</span>
                  <p className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 inline-block">
                    {selectedNotificationForReader.customerId ||
                      (selectedNotificationForReader.message.includes('TechCorp')
                        ? 'cust_4'
                        : selectedNotificationForReader.message.includes('Acme Corp')
                        ? 'cust_1'
                        : selectedNotificationForReader.message.includes('Innovate Ltd')
                        ? 'cust_5'
                        : 'cust_6')}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Description & Context */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Message Content
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {selectedNotificationForReader.details || selectedNotificationForReader.message}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400">Timestamp:</span>
                <p className="font-semibold text-slate-800">
                  {selectedNotificationForReader.timestamp}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Category:</span>
                <p className="font-semibold text-slate-800">
                  {selectedNotificationForReader.type} Notification
                </p>
              </div>
              {selectedNotificationForReader.amount && (
                <div>
                  <span className="text-slate-400">Amount Paid:</span>
                  <p className="font-bold text-emerald-600 font-mono text-sm">
                    {formatCurrency(selectedNotificationForReader.amount, '₹')}
                  </p>
                </div>
              )}
              {selectedNotificationForReader.invoiceId && (
                <div>
                  <span className="text-slate-400">Invoice Ref:</span>
                  <p className="font-mono font-bold text-slate-900">
                    {selectedNotificationForReader.invoiceId}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-slate-100">
              {selectedNotificationForReader.invoiceId && (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
                  onClick={() => {
                    downloadInvoicePDF(selectedNotificationForReader.invoiceId || 'inv_current');
                    setSelectedNotificationForReader(null);
                  }}
                >
                  View Tax Invoice PDF
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Building2 className="w-3.5 h-3.5 text-indigo-600" />}
                onClick={() => {
                  setSelectedNotificationForReader(null);
                  setCurrentTab('customers');
                }}
              >
                View Customers
              </Button>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setSelectedNotificationForReader(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
