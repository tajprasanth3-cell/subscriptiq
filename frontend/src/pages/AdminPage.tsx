import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Header } from '../components/layout/Header';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { PlanDistributionChart } from '../components/dashboard/PlanDistributionChart';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowUpRight, Rocket, Calendar, ArrowRight } from 'lucide-react';

export const AdminPage = () => {
  const { adminStats, auditLogs, role, setCurrentTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState('Last 30 Days');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.who.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.change.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Admin Dashboard"
        subtitle="Overview of platform statistics, fleet telemetry and global controls"
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search audit history..."
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Period Selector (Slide 6) */}
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="bg-transparent focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="This Year">This Year</option>
              </select>
            </div>

            <span className="text-xs font-semibold text-slate-500 hidden md:inline">
              Role: <strong className="text-indigo-600">{role}</strong>
            </span>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        {/* KPI Summary Cards (4 Columns matching Slide 6 & Mockup 8) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Organizations
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {adminStats.totalBusinesses}
              </h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                +12% <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Active enterprise accounts</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Subscriptions
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {adminStats.activeSubscriptions.toLocaleString()}
              </h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                +7.4% <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Across all production tiers</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Revenue
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {adminStats.monthlyRevenue}
              </h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                +16.5% <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Recurring fees + metered overages</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Usage Events
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {adminStats.eventsProcessed}
              </h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                +22.1% <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-4">100% idempotent check rate</p>
          </Card>
        </div>

        {/* Middle Charts Split Row (Slide 6) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Overview Chart */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Revenue Overview</h3>
                <p className="text-xs text-slate-400">Total platform billings trajectory ({timePeriod})</p>
              </div>
              <button
                onClick={() => setCurrentTab('billing')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <RevenueChart />
          </Card>

          {/* Plan Distribution Donut Chart */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Plan Distribution</h3>
                <p className="text-xs text-slate-400">248 Organizations breakdown</p>
              </div>
              <button
                onClick={() => setCurrentTab('plans')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <PlanDistributionChart />
          </Card>
        </div>

        {/* Bottom Split Row: Top Plans + Upgrade Banner + Audit History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Plans Card (Slide 6) */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Top Plans</h3>
              <button
                onClick={() => setCurrentTab('plans')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Professional</span>
                </div>
                <span className="font-mono font-bold text-slate-900">42.3%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-800">Basic</span>
                </div>
                <span className="font-mono font-bold text-slate-900">38.7%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-800">Enterprise</span>
                </div>
                <span className="font-mono font-bold text-slate-900">18.9%</span>
              </div>
            </div>

            {/* Upgrade Promo Banner (Slide 6) */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-700 text-white relative overflow-hidden flex flex-col justify-between">
              <Rocket className="w-16 h-16 text-indigo-300/20 absolute -right-2 -bottom-2 pointer-events-none" />
              <div>
                <p className="font-extrabold text-sm text-white">Upgrade to Pro</p>
                <p className="text-[11px] text-indigo-200 mt-1">
                  Unlock advanced analytics, automation and more.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('plans')}
                className="mt-3 text-xs font-bold text-white hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Upgrade Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>

          {/* Audit History Ledger (2 columns) */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Audit history</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Tamper-evident system activity log ({filteredLogs.length} events)
              </span>
            </div>

            <div className="responsive-table-wrapper overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-xs md:text-sm">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Actor / Operator</th>
                    <th className="py-3 px-6">System Change</th>
                    <th className="py-3 px-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{log.who}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-700">{log.change}</td>
                      <td className="py-3.5 px-6 text-right text-slate-400 text-xs font-mono">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 text-xs">
                        No audit history entries found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
