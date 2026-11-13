import type { Store } from '../store/store';
import type { AdminStats, AuditLog, Paginated } from '../types';
import { formatCompactNumber, formatCurrency } from '../utils/format';

const DISTRIBUTION_COLORS: Record<string, string> = {
  Basic: 'bg-indigo-600',
  Professional: 'bg-emerald-500',
  Enterprise: 'bg-amber-500',
};

export function getAdminStats(store: Store): AdminStats {
  const { organizations, customers, plans, events } = store.data;

  const monthlyRevenue = customers.reduce((sum, customer) => {
    const plan = plans.find((p) => p.name === customer.plan);
    return sum + (plan?.price ?? 0);
  }, 0);

  const activeSubscriptions = customers.filter(
    (c) => c.status === 'Active' || c.status === 'Near limit'
  ).length;

  const eventsProcessed = events.filter((e) => e.statusCategory === 'accepted').length;

  const totalCustomers = customers.length || 1;
  const tiers = Array.from(new Set(customers.map((c) => c.plan)));
  const subscriptionDistribution = tiers.map((tier) => {
    const count = customers.filter((c) => c.plan === tier).length;
    return {
      tier,
      count,
      percentage: Math.round((count / totalCustomers) * 1000) / 10,
      color: DISTRIBUTION_COLORS[tier] ?? 'bg-slate-400',
    };
  });

  return {
    totalBusinesses: organizations.length,
    activeSubscriptions,
    monthlyRevenue: formatCurrency(monthlyRevenue),
    eventsProcessed: formatCompactNumber(eventsProcessed),
    subscriptionDistribution,
  };
}

export interface ListAuditLogsQuery {
  search: string;
  page: number;
  pageSize: number;
}

export function listAuditLogs(store: Store, query: ListAuditLogsQuery): Paginated<AuditLog> {
  const search = (query.search ?? '').trim().toLowerCase();
  const filtered = store.data.auditLogs.filter(
    (log) =>
      search === '' ||
      log.who.toLowerCase().includes(search) ||
      log.change.toLowerCase().includes(search)
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
