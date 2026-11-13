import { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/layout/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ApiUsageTrendChart } from '../../components/dashboard/ApiUsageTrendChart';
import { useApp } from '../../context/AppContext';
import {
  ArrowUpRight,
  Receipt,
  Users,
  Bell,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  HardDrive,
  CreditCard,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BusinessDashboard = () => {
  const { currentPlan, currentInvoice, setCurrentTab, downloadInvoicePDF } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter alerts if search is entered
  const alertsList = [
    {
      id: 'alert_1',
      type: 'Threshold',
      message: 'Transactions passed 90% of plan limit',
      time: '10m ago',
      variant: 'amber',
    },
    {
      id: 'alert_2',
      type: 'Renewal',
      message: 'Subscription renews soon',
      time: '2h ago',
      variant: 'purple',
    },
  ].filter(
    (a) =>
      !searchQuery ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Responsive Header with Zero-Overflow Mobile Search */}
      <Header
        title="Overview"
        subtitle="Current billing period & usage monitoring"
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search metrics, alerts..."
        actions={
          <button
            onClick={() => setCurrentTab('plans')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Upgrade plan</span>
            <span className="sm:hidden">Upgrade</span>
          </button>
        }
      />

      {/* Main Container with Mobile/Tablet/Desktop Responsive Paddings */}
      <div className="p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        {/* Row 1: Top Overview KPI Cards (Mockup 2 & Slide 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-6">
          {/* Card 1: Plan */}
          <Card className="flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-2 min-h-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Plan
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                Active
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight mt-2">
              {currentPlan}
            </h3>
            <p className="text-xs text-slate-400 mt-auto pt-3">100k requests SLA</p>
          </Card>

          {/* Card 2: Estimated Charge */}
          <Card className="flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-2 min-h-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estimated charge
              </span>
              <span className="text-xs text-slate-400 font-medium shrink-0">this period</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight mt-2">
              {formatCurrency(currentInvoice.total)}
            </h3>
            <p className="text-xs text-slate-400 mt-auto pt-3">Auto-debit on Apr 30</p>
          </Card>

          {/* Card 3: Next Renewal */}
          <Card className="flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-2 min-h-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Next renewal
              </span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                Auto-renew
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight mt-2">
              Apr 30, 2026
            </h3>
            <p className="text-xs text-slate-400 mt-auto pt-3">Auto-renew on file</p>
          </Card>

          {/* Card 4: Total API Requests (Slide 7) */}
          <Card className="flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-2 min-h-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total API requests
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center shrink-0">
                +12% <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight mt-2">
              72,450
            </h3>
            <p className="text-xs text-slate-400 mt-auto pt-3">72.5% of total capacity</p>
          </Card>
        </div>

        {/* Row 2: Resource Quota Meters with Progress Bars (Mockup 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-6">
          {/* Card 1: API requests Meter */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">API requests</span>
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900">82%</span>
            </div>
            <ProgressBar value={82} color="indigo" size="md" />
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <span>Approaching limit</span>
            </p>
          </Card>

          {/* Card 2: Storage Meter */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">Storage</span>
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900">41%</span>
            </div>
            <ProgressBar value={41} color="emerald" size="md" />
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span>Within limit</span>
            </p>
          </Card>

          {/* Card 3: Transactions Meter */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">Transactions</span>
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900">96%</span>
            </div>
            <ProgressBar value={96} color="amber" size="md" />
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <span>Near limit: alert sent</span>
            </p>
          </Card>
        </div>

        {/* Row 3: API Usage Trend + Recent Alerts & Quick Actions (Slide 7 & Mockup 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* API Usage Trend (2 columns on desktop) */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">API Usage Trend</h3>
                <p className="text-xs text-slate-400">Monthly progression & limit trajectory</p>
              </div>
              <button
                onClick={() => setCurrentTab('usage')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <ApiUsageTrendChart />
          </Card>

          {/* Quick Actions & Recent Alerts (1 column on desktop) */}
          <div className="space-y-4 sm:space-y-6 flex flex-col">
            {/* Recent alerts (Mockup 2) */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900">Recent alerts</h3>
                </div>
                <button
                  onClick={() => setCurrentTab('notifications')}
                  className="text-xs text-indigo-600 hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2.5">
                {alertsList.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          alert.variant === 'amber'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="font-medium text-slate-700 truncate">{alert.message}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {alert.time}
                    </span>
                  </div>
                ))}
                {alertsList.length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">No alerts found.</p>
                )}
              </div>
            </Card>

            {/* Quick actions (Mockup 2 Buttons + Navigation Shortcuts) */}
            <Card className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900">Quick actions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Common operations & shortcuts</p>
                </div>

                {/* 3 Prominent Mockup 2 Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
                  <button
                    onClick={() => setCurrentTab('usage')}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold text-center transition-all cursor-pointer shadow-2xs"
                  >
                    View usage
                  </button>
                  <button
                    onClick={() => setCurrentTab('plans')}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer"
                  >
                    Upgrade plan
                  </button>
                  <button
                    onClick={() => downloadInvoicePDF('inv_current')}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer"
                  >
                    Download invoice
                  </button>
                </div>

                {/* Detailed Administrative Navigation Links */}
                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => setCurrentTab('plans')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                          Upgrade Plan
                        </p>
                        <p className="text-[10px] text-slate-400">Expand API quotas & SLA</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  </button>

                  <button
                    onClick={() => downloadInvoicePDF('inv_current')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Receipt className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                          View Invoices
                        </p>
                        <p className="text-[10px] text-slate-400">Download PDF receipts</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('customers')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                          Manage Customers
                        </p>
                        <p className="text-[10px] text-slate-400">Multi-tenant client limits</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('notifications')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 group-hover:text-amber-700">
                          Set Usage Alerts
                        </p>
                        <p className="text-[10px] text-slate-400">Threshold & limit rules</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                Signed in as <strong>John Smith</strong> (Business Owner)
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
