import { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Header } from '../../components/layout/Header';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Zap, HardDrive, Receipt, Clock, Crown, Download, Layers } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

// Circular gauge component declared outside of render for React purity
const CircularGauge = ({
  percent,
  color = '#4F46E5',
  size = 72,
  stroke = 7,
}: {
  percent: number;
  color?: string;
  size?: number;
  stroke?: number;
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold text-slate-800">{percent}%</span>
    </div>
  );
};

export const CustomerDashboard = () => {
  const { currentPlan, currentInvoice, setCurrentTab, downloadInvoicePDF } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const activities = [
    {
      icon: Zap,
      color: 'text-indigo-600 bg-indigo-50',
      title: 'API Usage: 1,000 requests',
      time: '2 hours ago',
      desc: 'Batch webhooks ingested from production endpoint',
    },
    {
      icon: HardDrive,
      color: 'text-emerald-600 bg-emerald-50',
      title: 'Storage updated: 500 MB added',
      time: '5 hours ago',
      desc: 'Blob upload processed for invoice attachments',
    },
    {
      icon: Receipt,
      color: 'text-purple-600 bg-purple-50',
      title: `Invoice generated: ${currentInvoice.invoiceNumber} (${formatCurrency(currentInvoice.total)})`,
      time: '1 day ago',
      desc: 'Auto-debit scheduled via primary credit card',
    },
  ].filter(
    (a) =>
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
      <Header
        title="Customer Portal"
        subtitle="Track personal resource quotas, active subscription and billing statements"
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search customer activity, usage..."
        actions={
          <button
            onClick={() => setCurrentTab('plans')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span className="hidden sm:inline">Change Plan</span>
            <span className="sm:hidden">Plan</span>
          </button>
        }
      />

      <div className="p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        {/* Hero Plan Card (Slide 9 - Purple Gradient Card) */}
        <div className="rounded-3xl p-5 sm:p-7 lg:p-8 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 shrink-0" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                  {currentPlan} Plan
                </h2>
                <Badge variant="active" className="bg-emerald-400/20 text-emerald-100 ring-emerald-300/30">
                  Active
                </Badge>
              </div>

              <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black">
                  {formatCurrency(currentInvoice.total)}
                </span>
                <span className="text-indigo-200 text-xs sm:text-sm font-medium">/ month</span>
              </div>

              <p className="text-xs text-indigo-100 mt-1.5 sm:mt-2">
                Auto-renews on <strong className="text-white">{currentInvoice.dueDate || 'Apr 30, 2026'}</strong> &bull; Priority SLA &bull; Verified
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setCurrentTab('plans')}
                className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white text-indigo-700 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Layers className="w-4 h-4" />
                <span>Manage Plan</span>
              </button>
              <button
                onClick={() => downloadInvoicePDF('inv_current')}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Invoice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: 3 Radial Gauge & Bill Cards (Slide 9) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-6">
          {/* Card 1: API Usage */}
          <Card className="flex items-center justify-between p-4 sm:p-5 lg:p-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>API Usage</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900">72,450</p>
              <p className="text-xs text-slate-500 font-medium">of 100,000 requests</p>
            </div>
            <CircularGauge percent={72.5} color="#4F46E5" />
          </Card>

          {/* Card 2: Storage Usage */}
          <Card className="flex items-center justify-between p-4 sm:p-5 lg:p-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                <span>Storage Usage</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900">24 GB</p>
              <p className="text-xs text-slate-500 font-medium">of 50 GB allowance</p>
            </div>
            <CircularGauge percent={48} color="#10B981" />
          </Card>

          {/* Card 3: Current Bill */}
          <Card className="flex flex-col justify-between p-4 sm:p-5 lg:p-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5 text-amber-500" />
                <span>Current Bill</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {formatCurrency(currentInvoice.total)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Due on Apr 30, 2026 &bull; Auto-pay</p>
            </div>
            <button
              onClick={() => downloadInvoicePDF('inv_current')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-4 cursor-pointer"
            >
              <span>View Invoice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Card>
        </div>

        {/* Row 3: Recent Activity (Slide 9) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">Recent Activity</h3>
            </div>
            <span className="text-xs text-slate-400">Personal usage audit trail</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {activities.map((act, i) => {
              const Icon = act.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-start justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors gap-1.5 sm:gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl ${act.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">{act.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-mono shrink-0 pl-11 sm:pl-0 sm:ml-3">
                    {act.time}
                  </span>
                </div>
              );
            })}
            {activities.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activity matching your search.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
