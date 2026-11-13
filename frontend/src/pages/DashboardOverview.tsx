import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Header } from '../components/layout/Header';
import { ApiUsageTrendChart } from '../components/dashboard/ApiUsageTrendChart';
import { useApp } from '../context/AppContext';
import { ArrowUpRight, Zap, Download } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const DashboardOverview = () => {
  const {
    currentPlan,
    subscriptionStatus,
    meters,
    currentInvoice,
    notifications,
    setCurrentTab,
    downloadInvoicePDF,
  } = useApp();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Overview"
        subtitle="Current billing period"
        actions={
          <Button
            onClick={() => setCurrentTab('plans')}
            size="md"
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            Upgrade plan
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Plan */}
          <Card className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</p>
              <div className="flex items-center gap-3 mt-2">
                <h3 className="text-2xl font-extrabold text-slate-900">{currentPlan}</h3>
                <Badge
                  variant={
                    subscriptionStatus === 'active'
                      ? 'active'
                      : subscriptionStatus === 'renewal_due'
                      ? 'threshold'
                      : 'suspended'
                  }
                >
                  {subscriptionStatus === 'active' ? 'Active' : subscriptionStatus}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Metered billing &bull; Standard SLA</p>
          </Card>

          {/* Card 2: Estimated charge */}
          <Card className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estimated charge
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(currentInvoice.total)}
                </h3>
                <span className="text-xs text-slate-500 font-medium">+ overages</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">This period (Apr 1 - Apr 30)</p>
          </Card>

          {/* Card 3: Next renewal */}
          <Card className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Next renewal
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">Apr 30, 2026</h3>
            </div>
            <p className="text-xs text-slate-500 mt-4">Auto-renew configured</p>
          </Card>
        </div>

        {/* Middle Row: 3 Usage Meters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meters.map((meter) => {
            const barColor: 'indigo' | 'emerald' | 'amber' =
              meter.percentage > 90 ? 'amber' : meter.percentage > 70 ? 'indigo' : 'emerald';

            return (
              <Card key={meter.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{meter.name}</span>
                  <span className="text-xl font-bold text-slate-900">{meter.percentage}%</span>
                </div>

                <ProgressBar value={meter.percentage} color={barColor} size="md" />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{meter.statusLabel}</span>
                  <span className="text-slate-400 font-medium">
                    {meter.used.toLocaleString()} / {meter.limit.toLocaleString()} {meter.unit}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* API Usage Trend Chart */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">API Usage Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily metered requests comparison across billing cycles
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('usage')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Inspect all events &rarr;
            </button>
          </div>
          <ApiUsageTrendChart />
        </Card>

        {/* Bottom Row: Recent Alerts + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Recent alerts</h3>
              <button
                onClick={() => setCurrentTab('notifications')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3.5 pt-1">
              {notifications.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        alert.type === 'Threshold'
                          ? 'threshold'
                          : alert.type === 'Renewal'
                          ? 'renewal'
                          : 'billing'
                      }
                    >
                      {alert.type}
                    </Badge>
                    <span className="text-slate-700 font-medium text-xs md:text-sm">
                      {alert.message}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ml-3">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
                Quick actions
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                Execute direct operations on your current subscription plan and billing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button
                onClick={() => setCurrentTab('usage')}
                variant="primary"
                icon={<Zap className="w-4 h-4" />}
              >
                View usage
              </Button>
              <Button onClick={() => setCurrentTab('plans')} variant="outline">
                Upgrade plan
              </Button>
              <Button
                onClick={() => downloadInvoicePDF('inv_current')}
                variant="outline"
                icon={<Download className="w-4 h-4" />}
              >
                Download invoice
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
