
import { X, Download, Building2, CheckCircle2 } from 'lucide-react';
import type { Invoice } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { downloadInvoicePdf } from '../../utils/invoicePdf';

interface InvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoiceModal = ({ invoice, onClose }: InvoiceModalProps) => {
  const handleDownload = () => {
    downloadInvoicePdf(invoice);
  };

  return (
    <div className="invoice-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-150">
      <div className="invoice-print-area responsive-modal bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 my-auto">
        {/* Header Actions */}
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 print:hidden">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tax Invoice Document
            </span>
            <Badge variant="active">{invoice.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Download PDF
            </Button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="space-y-6">
          {/* Company & Client Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <span>SubscriptIQ Inc.</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">100 Tech Park, Suite 400</p>
              <p className="text-xs text-slate-400">Bangalore, KA 560001, India</p>
              <p className="text-xs text-slate-400">GSTIN: 29AABCU9603R1ZM</p>
            </div>

            <div className="text-left sm:text-right min-w-0 max-w-full">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 break-all">
                {invoice.invoiceNumber}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Issued Date: <strong className="text-slate-700">Apr 01, 2026</strong>
              </p>
              <p className="text-xs text-slate-500">
                Due Date: <strong className="text-slate-700">{invoice.dueDate || 'Apr 30, 2026'}</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between text-xs gap-3">
            <div className="min-w-0">
              <p className="font-bold uppercase text-[10px] tracking-wider text-slate-400 mb-1">
                Billed To:
              </p>
              <p className="font-bold text-slate-900 text-sm">{invoice.customer || 'Acme Corp'}</p>
              <p className="text-slate-500">ATTN: Accounts Payable</p>
              <p className="text-slate-500 break-all">finance@acme.com</p>
            </div>
            <div className="min-w-0 sm:text-right">
              <p className="font-bold uppercase text-[10px] tracking-wider text-slate-400 mb-1">
                Payment Method:
              </p>
              <p className="font-semibold text-slate-800 break-words">
                {invoice.paymentMethod || 'Visa ending in 4242'}
              </p>
              <div className="flex items-center gap-1 text-emerald-600 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Auto-Pay</span>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden responsive-table-wrapper">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Metered Metric</th>
                  <th className="py-2.5 px-4">Rate</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoice.lineItems.length > 0 ? (
                  invoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4 font-semibold text-slate-900 break-words">
                        {item.lineItem}
                      </td>
                      <td className="py-3 px-4 text-slate-500 break-words">{item.sourceUsage}</td>
                      <td className="py-3 px-4 text-slate-500 break-words">{item.rate}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(item.amount, invoice.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      Standard Monthly Subscription
                    </td>
                    <td className="py-3 px-4 text-slate-500">{invoice.period}</td>
                    <td className="py-3 px-4 text-slate-500">Flat</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-full max-w-xs space-y-2 text-xs">
              <div className="flex flex-wrap justify-between gap-2 text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-700">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-slate-500">
                <span>GST / Tax (18% included)</span>
                <span className="font-mono font-semibold text-slate-700">
                  {formatCurrency(Math.round(invoice.total * 0.18), invoice.currency)}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
                <span>Total Amount Due</span>
                <span className="font-mono text-indigo-700 text-lg">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 text-center">
            Thank you for choosing SubscriptIQ. This is a computer-generated tax invoice and requires no physical signature.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex items-center justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleDownload}>
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

