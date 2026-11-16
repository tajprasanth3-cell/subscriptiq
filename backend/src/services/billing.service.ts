import type { Store } from '../store/store';
import type { Invoice, Paginated } from '../types';
import { ApiError } from '../utils/ApiError';
import { toCsv } from '../utils/format';
import { recordAudit, type AuditActor } from './audit.service';

export const CURRENT_INVOICE_ID = 'inv_current';

export function getCurrentInvoice(store: Store, role?: string): Invoice {
  if (role === 'Customer') {
    const customerInv = store.data.invoices.find((i) => (i.customer ?? '').toLowerCase().includes('techcorp'));
    if (customerInv) return customerInv;
  }
  const invoice = store.data.invoices.find((i) => i.id === CURRENT_INVOICE_ID);
  if (!invoice) throw ApiError.notFound('Current invoice not found');
  return invoice;
}

export function getInvoice(store: Store, id: string): Invoice {
  const invoice = store.data.invoices.find((i) => i.id === id || i.invoiceNumber === id);
  if (!invoice) throw ApiError.notFound(`Invoice "${id}" was not found`);
  return invoice;
}

export interface ListInvoicesQuery {
  search: string;
  page: number;
  pageSize: number;
}

export function listInvoices(store: Store, query: ListInvoicesQuery, role?: string): Paginated<Invoice> {
  const search = query.search.trim().toLowerCase();
  let history = store.data.invoices.filter((i) => i.id !== CURRENT_INVOICE_ID);
  if (role === 'Customer') {
    history = history.filter((i) => (i.customer ?? '').toLowerCase().includes('techcorp'));
  }
  const filtered = history.filter(
    (inv) =>
      search === '' ||
      inv.invoiceNumber.toLowerCase().includes(search) ||
      (inv.customer ?? '').toLowerCase().includes(search)
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;
  return {
    items: filtered.slice(start, start + query.pageSize),
    total,
    page,
    pageSize: query.pageSize,
    totalPages,
  };
}

export function markInvoicePaid(store: Store, id: string, actor: AuditActor): Invoice {
  const invoice = getInvoice(store, id);
  if (invoice.status === 'Paid') {
    throw ApiError.conflict(`Invoice ${invoice.invoiceNumber} is already paid`);
  }
  invoice.status = 'Paid';
  recordAudit(store, actor, `Marked invoice ${invoice.invoiceNumber} as paid`);
  store.persist();
  return invoice;
}

export function invoiceToCsv(invoice: Invoice): string {
  const rows = invoice.lineItems.map((item) => [
    item.lineItem,
    item.sourceUsage,
    item.rate,
    item.amount,
  ]);
  rows.push(['TOTAL', '', '', invoice.total]);
  return toCsv(['Line item', 'Source usage', 'Rate', 'Amount'], rows);
}
