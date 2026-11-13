import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import { PlusCircle, Copy, Download, Trash2 } from 'lucide-react';
import clsx from 'clsx';

type TabType = 'all' | 'duplicate' | 'rejected';

export const UsagePage = () => {
  const { events, simulateIngestion, clearEvents, setCurrentTab } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((ev) => {
    const matchesTab = activeTab === 'all' || ev.statusCategory === activeTab;
    const matchesSearch =
      ev.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.resource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const duplicateCount = events.filter((e) => e.statusCategory === 'duplicate').length;
  const rejectedCount = events.filter((e) => e.statusCategory === 'rejected').length;

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Customer', 'Resource', 'Quantity', 'Timestamp', 'Status'];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.customer,
      e.resource,
      e.quantity,
      `"${e.timestamp}"`,
      `"${e.status}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subscriptiq_usage_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Usage Monitoring"
        subtitle="Track and analyze customer usage with idempotent event validation"
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search event ID, customer..."
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => simulateIngestion(false)}
              icon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Ingest Event</span>
              <span className="sm:hidden">Ingest</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateIngestion(true)}
              icon={<Copy className="w-3.5 h-3.5" />}
              title="Test idempotency: Ingest event with existing ID"
            >
              <span className="hidden sm:inline">Test Duplicate</span>
              <span className="sm:hidden">Dup</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              <span className="hidden md:inline">Export CSV</span>
              <span className="md:hidden">CSV</span>
            </Button>
            {events.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearEvents}
                icon={<Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />}
              />
            )}
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        {/* KPI Metrics Row (Slide 11 & Mockup 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Requests
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">4.8M</h3>
              <span className="text-xs font-bold text-emerald-600">+22.1%</span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Counted toward usage</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg. per Customer
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">19,200</h3>
            </div>
            <p className="text-xs text-slate-400 mt-4">Across active tenants</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Duplicates Ignored
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {(duplicateCount * 42).toLocaleString()}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-4">Idempotent suppression</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Usage Alerts
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900">12</h3>
              <span className="text-xs font-bold text-amber-500">Threshold passed</span>
            </div>
            <p className="text-xs text-slate-400 mt-4">Active quota warnings</p>
          </Card>
        </div>

        {/* Split Section: Usage Trend Bar Visual + Top Customers (Slide 11) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Usage Trend Visual (2 columns) */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Usage Trend</h3>
                <p className="text-xs text-slate-400">Daily API Requests & Storage distribution</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> API Requests
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Storage
                </span>
              </div>
            </div>

            {/* Custom SVG Dual Bar Chart (Slide 11) */}
            <div className="pt-2 overflow-x-auto responsive-table-wrapper">
              <svg viewBox="0 0 540 150" className="w-full min-w-[460px] h-40">
                {[
                  { date: 'Apr 1', h1: 75, h2: 45 },
                  { date: '', h1: 85, h2: 50 },
                  { date: '', h1: 60, h2: 40 },
                  { date: 'Apr 8', h1: 95, h2: 60 },
                  { date: '', h1: 50, h2: 30 },
                  { date: '', h1: 70, h2: 45 },
                  { date: '', h1: 90, h2: 55 },
                  { date: 'Apr 16', h1: 110, h2: 70 },
                  { date: '', h1: 80, h2: 50 },
                  { date: '', h1: 95, h2: 60 },
                  { date: 'Apr 22', h1: 85, h2: 55 },
                  { date: '', h1: 75, h2: 45 },
                  { date: '', h1: 105, h2: 65 },
                  { date: 'Apr 30', h1: 120, h2: 80 },
                ].map((bar, i) => {
                  const x = 25 + i * 36;
                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y={130 - bar.h1}
                        width="11"
                        height={bar.h1}
                        rx="4"
                        fill="#4F46E5"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                      <rect
                        x={x + 13}
                        y={130 - bar.h2}
                        width="11"
                        height={bar.h2}
                        rx="4"
                        fill="#A5B4FC"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                      {bar.date && (
                        <text
                          x={x + 10}
                          y={145}
                          textAnchor="middle"
                          className="text-[10px] fill-slate-400 font-medium"
                        >
                          {bar.date}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>

          {/* Top Customers (1 column - Slide 11) */}
          <Card className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Top Customers</h3>
                <button
                  onClick={() => setCurrentTab('customers')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'TechCorp', initials: 'TC', usage: '950K reqs', percent: 95 },
                  { name: 'Innovate Ltd', initials: 'IL', usage: '720K reqs', percent: 72 },
                  { name: 'Global Solutions', initials: 'GS', usage: '580K reqs', percent: 58 },
                  { name: 'Acme Corp', initials: 'AC', usage: '510K reqs', percent: 51 },
                ].map((cust) => (
                  <div
                    key={cust.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {cust.initials}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{cust.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{cust.usage}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">{cust.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Quotas verified per tenant isolation
            </div>
          </Card>
        </div>

        {/* Events Table Card with Tabs */}
        <Card padding="none" className="overflow-hidden">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 pt-3 sm:pt-4 border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'all' as TabType, label: `All events (${events.length})` },
              {
                id: 'duplicate' as TabType,
                label: `Duplicates (${duplicateCount})`,
              },
              {
                id: 'rejected' as TabType,
                label: `Rejected (${rejectedCount})`,
              },
            ].map((tab) => {
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'pb-3 text-xs md:text-sm font-semibold transition-all border-b-2 cursor-pointer',
                    isCurrent
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="responsive-table-wrapper overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs md:text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Event ID</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Resource</th>
                  <th className="py-3 px-6">Quantity</th>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredEvents.map((ev, index) => (
                  <tr key={`${ev.id}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs font-semibold text-slate-900">
                      {ev.id}
                    </td>
                    <td className="py-3.5 px-6">{ev.customer}</td>
                    <td className="py-3.5 px-6">{ev.resource}</td>
                    <td className="py-3.5 px-6 font-mono text-xs">{ev.quantity}</td>
                    <td className="py-3.5 px-6 text-slate-500 text-xs">{ev.timestamp}</td>
                    <td className="py-3.5 px-6">
                      <Badge
                        variant={
                          ev.statusCategory === 'accepted'
                            ? 'accepted'
                            : ev.statusCategory === 'duplicate'
                            ? 'duplicate'
                            : 'rejected'
                        }
                      >
                        {ev.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No events found matching current criteria. Try clicking "Ingest Event".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
