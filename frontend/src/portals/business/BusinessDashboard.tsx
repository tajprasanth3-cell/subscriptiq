import { Card } from '../../components/common/Card';
import { Header } from '../../components/layout/Header';
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
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BusinessDashboard = () => {
  const { currentPlan, currentInvoice, setCurrentTab, downloadInvoicePDF } = useApp();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Business Dashboard"
        subtitle="Manage your organization, monitor usage quotas and configure client billing"
        actions={
          <button
            onClick={() => setCurrentTab('plans')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Upgrade Plan</span>
            <span className="sm:hidden">Upgrade</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        {/* Top 4 Stat Cards (Slide 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Current Plan */}
          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Plan
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{currentPlan}</h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-4">100k requests SLA</p>
          </Card>

          {/* Card 2: Total API Requests */}
          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total API Requests
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">72,450</h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                +12% <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-4">72.5% of total capacity</p>
          </Card>

          {/* Card 3: Remaining Usage */}
          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Remaining Usage
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">27,550</h3>
              <span className="text-xs font-semibold text-slate-400">units</span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Resets in 19 days</p>
          </Card>

          {/* Card 4: Current Bill */}
          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Bill
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {formatCurrency(currentInvoice.total)}
              </h3>
              <span className="text-xs text-slate-400 font-medium">this period</span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Auto-debit on Apr 30</p>
          </Card>
        </div>

        {/* Middle Split Row: API Usage Trend + Quick Actions (Slide 7) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* API Usage Trend (2 columns) */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">API Usage Trend</h3>
                <p className="text-xs text-slate-400">Monthly progression & limit trajectory</p>
              </div>
              <button
                onClick={() => setCurrentTab('usage')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <ApiUsageTrendChart />
          </Card>

          {/* Quick Actions (1 column - Slide 7) */}
          <Card className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Quick Actions</h3>
                <p className="text-xs text-slate-400 mt-0.5">Frequent administrative shortcuts</p>
              </div>

              <div className="space-y-3 pt-3">
                <button
                  onClick={() => setCurrentTab('plans')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                        Upgrade Plan
                      </p>
                      <p className="text-[11px] text-slate-400">Expand API quotas & SLA</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => downloadInvoicePDF('inv_current')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                        View Invoices
                      </p>
                      <p className="text-[11px] text-slate-400">Download PDF receipts</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => setCurrentTab('customers')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                        Manage Customers
                      </p>
                      <p className="text-[11px] text-slate-400">Multi-tenant client limits</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => setCurrentTab('notifications')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-amber-700">
                        Set Usage Alerts
                      </p>
                      <p className="text-[11px] text-slate-400">Threshold & limit rules</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
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
  );
};
