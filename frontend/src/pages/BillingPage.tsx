import { useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge, type BadgeVariant } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import {
  Download,
  CreditCard,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const PAGE_SIZE = 5;

const badgeVariant = (status: string): BadgeVariant => {
  if (status === 'Paid') return 'active';
  if (status === 'Overdue') return 'rejected';
  if (status === 'Pending') return 'duplicate';
  return 'info';
};

export const BillingPage = () => {
  const { currentInvoice, billingHistory, downloadInvoicePDF, payInvoice, role, organizationName } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);

  const isCustomer = role === 'Customer';

  const baseHistory = useMemo(() => {
    if (!isCustomer) return billingHistory;
    return billingHistory.filter(
      (inv) =>
        (inv.customer &&
          (inv.customer.toLowerCase().includes('techcorp') ||
            inv.customer.toLowerCase().includes(organizationName.toLowerCase()))) ||
        inv.customerId === 'cust_4' ||
        inv.id === 'inv_current' ||
        inv.id === 'inv_1'
    );
  }, [billingHistory, isCustomer, organizationName]);

  const filteredHistory = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return baseHistory;
    return baseHistory.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(search) ||
        (inv.customer && inv.customer.toLowerCase().includes(search)) ||
        (inv.customerId && inv.customerId.toLowerCase().includes(search))
    );
  }, [baseHistory, searchQuery]);

  const totalInvoices = filteredHistory.length;
  const totalPages = Math.max(1, Math.ceil(totalInvoices / PAGE_SIZE));
  const currentPage = Math.min(activePage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedHistory = filteredHistory.slice(startIndex, startIndex + PAGE_SIZE);
  const rangeStart = totalInvoices === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + PAGE_SIZE, totalInvoices);

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    let first = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const last = Math.min(totalPages, first + windowSize - 1);
    first = Math.max(1, last - windowSize + 1);
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  }, [currentPage, totalPages]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setActivePage(1);
  };

  const currentPaid = currentInvoice.status === 'Paid';

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full">
      <Header
        title={isCustomer ? 'My Billing History' : 'Invoices'}
        subtitle={
          isCustomer
            ? 'View your personal subscription invoices, itemized charges & payment receipts'
            : 'View and manage customer invoices, itemized charges & payment receipts'
        }
        showSearch
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={isCustomer ? 'Search my invoices...' : 'Search invoice #, customer...'}
        actions={
          <Button
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={() => downloadInvoicePDF('inv_current')}
          >
            Export PDF
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto responsive-container">
        {/* Top Split Row: Current Invoice & Payment Box (Mockup 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Period Invoice Breakdown (2 columns) */}
          <Card className="lg:col-span-2 space-y-6 min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-bold text-lg text-slate-900">Invoice, current period</h3>
                  <Badge variant={badgeVariant(currentInvoice.status)}>
                    {currentInvoice.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1 break-words">{currentInvoice.period}</p>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-400 break-all shrink-0">
                {currentInvoice.invoiceNumber}
              </span>
            </div>

            <div className="responsive-table-wrapper overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-xs md:text-sm">
                <thead className="text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-2.5">Line item</th>
                    <th className="py-2.5">Source usage</th>
                    <th className="py-2.5">Rate</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {currentInvoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-semibold text-slate-900">{item.lineItem}</td>
                      <td className="py-3 text-slate-500 text-xs">{item.sourceUsage}</td>
                      <td className="py-3 text-slate-500 text-xs">{item.rate}</td>
                      <td className="py-3 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(item.amount, currentInvoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <span className="text-sm font-semibold text-slate-500">Total:</span>
              <span className="text-2xl font-extrabold text-slate-900 break-all">
                {formatCurrency(currentInvoice.total, currentInvoice.currency)}
              </span>
            </div>
          </Card>

          {/* Payment Card (1 column) */}
          <Card className="space-y-6 flex flex-col justify-between min-w-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Payment</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Status, method and due date appear here.
              </p>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500 shrink-0">Next due date:</span>
                  <span className="font-semibold text-slate-900 text-right break-words">
                    {currentInvoice.dueDate || '—'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500 shrink-0">Payment method:</span>
                  <span className="font-semibold text-slate-900 text-right break-words min-w-0">
                    {currentInvoice.paymentMethod || 'Visa •••• 4242'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 pt-1 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{currentPaid ? 'Payment received' : 'Auto-debit verified'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {currentPaid ? (
                <Button
                  variant="outline"
                  fullWidth
                  size="md"
                  icon={<CheckCircle className="w-4 h-4" />}
                  disabled
                >
                  Invoice paid
                </Button>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  size="md"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => payInvoice(currentInvoice.id)}
                >
                  Mark as paid
                </Button>
              )}
              <Button
                variant="outline"
                fullWidth
                size="md"
                icon={<Download className="w-4 h-4" />}
                onClick={() => downloadInvoicePDF('inv_current')}
              >
                Download invoice
              </Button>
            </div>
          </Card>
        </div>

        {/* Bottom Card: Invoices Table with Pagination (Slide 12) */}
        <Card padding="none" className="overflow-hidden min-w-0">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900">Customer Invoices</h3>
              <p className="text-xs text-slate-400 mt-0.5 break-words">
                View, audit and export past issued tax invoices
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => downloadInvoicePDF('inv_current')}
            >
              Export PDF
            </Button>
          </div>

          <div className="responsive-table-wrapper overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs md:text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {pagedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 px-6 text-center text-slate-400">
                      No invoices match your search.
                    </td>
                  </tr>
                ) : (
                  pagedHistory.map((hist) => (
                    <tr key={hist.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                        {hist.invoiceNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{hist.customer || 'Acme Corp'}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          ID: {hist.customerId || (hist.customer === 'TechCorp' ? 'cust_4' : hist.customer === 'Acme Corp' ? 'cust_1' : hist.customer === 'Innovate Ltd' ? 'cust_5' : 'cust_6')}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {formatCurrency(hist.total, hist.currency)}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={badgeVariant(hist.status)}>{hist.status}</Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs whitespace-nowrap">
                        {hist.date || 'Apr 01, 2026'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => downloadInvoicePDF(hist.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Preview invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadInvoicePDF(hist.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Download receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {hist.status !== 'Paid' && (
                            <button
                              onClick={() => payInvoice(hist.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Mark as paid"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (Slide 12) */}
          <div className="p-4 px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span className="text-center sm:text-left">
              {totalInvoices === 0
                ? 'Showing 0 of 0 invoices'
                : `Showing ${rangeStart}-${rangeEnd} of ${totalInvoices} invoices`}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setActivePage(Math.max(1, currentPage - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePage(p)}
                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === p
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setActivePage(Math.min(totalPages, currentPage + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
