import { useState, type FormEvent } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import type { Customer, PlanTier } from '../types';
import { UserPlus, X } from 'lucide-react';

export const CustomersPage = () => {
  const { customers, addCustomer, updateCustomerStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Near limit' | 'Suspended'>('All');

  // Form state
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState<PlanTier>('Basic');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgMobile, setNewOrgMobile] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    addCustomer({
      name: newOrgName.trim(),
      plan: newOrgPlan,
      status: 'Active',
      usagePercentage: Math.floor(10 + Math.random() * 30),
      renewalDate: 'May 30, 2026',
      email: newOrgEmail.trim() || `${newOrgName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      mobile: newOrgMobile.trim() || undefined,
    });

    setNewOrgName('');
    setNewOrgEmail('');
    setNewOrgMobile('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Customers"
        subtitle="Organizations under your business & tenant accounts"
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search customers by name or email..."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Near limit">Near limit</option>
              <option value="Suspended">Suspended</option>
            </select>
            <Button
              variant="primary"
              size="md"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add customer
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto responsive-container">
        <Card padding="none" className="overflow-hidden">
          <div className="responsive-table-wrapper overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs md:text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Organization</th>
                  <th className="py-3 px-6">Plan</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Usage vs limit</th>
                  <th className="py-3 px-6">Renewal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCustomers.map((cust) => {
                  const meterColor =
                    cust.usagePercentage > 90
                      ? 'amber'
                      : cust.usagePercentage > 75
                      ? 'indigo'
                      : 'emerald';

                    return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{cust.name}</div>
                        <div className="text-slate-400 text-xs font-normal">{cust.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800">{cust.plan}</span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={cust.status}
                          onChange={(e) =>
                            updateCustomerStatus(cust.id, e.target.value as Customer['status'])
                          }
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                          title="Update customer status"
                        >
                          <option value="Active">Active</option>
                          <option value="Near limit">Near limit</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 w-56">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">
                              {cust.usagePercentage}%
                            </span>
                          </div>
                          <ProgressBar value={cust.usagePercentage} color={meterColor} size="sm" />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium text-xs">
                        {cust.renewalDate}
                      </td>
                    </tr>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      No customers match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Add New Customer</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Wayne Enterprises"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={newOrgEmail}
                  onChange={(e) => setNewOrgEmail(e.target.value)}
                  placeholder="admin@waynecorp.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={newOrgMobile}
                  onChange={(e) => setNewOrgMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subscription Tier
                </label>
                <select
                  value={newOrgPlan}
                  onChange={(e) => setNewOrgPlan(e.target.value as PlanTier)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="Basic">Basic (₹499/mo)</option>
                  <option value="Professional">Professional (₹1,499/mo)</option>
                  <option value="Enterprise">Enterprise (₹4,999/mo)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
