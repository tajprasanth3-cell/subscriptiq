import type {
  AlertNotification,
  AlertRules,
  AuditLog,
  Customer,
  Invoice,
  Plan,
  Role,
  SubscriptionStatus,
  UsageEvent,
  UsageMeter,
} from '../types';
import { mockApiHandler } from './mockApiHandler';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');
const TOKEN_KEY = 'subscriptiq.token';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  organizationName: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export interface Subscription {
  id: string;
  plan: string;
  status: SubscriptionStatus;
  billingCycle: 'monthly' | 'annual';
  startedAt: string;
  renewalDate: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IngestResult {
  event: UsageEvent;
  metered: boolean;
}

export interface AdminStats {
  totalBusinesses: number;
  activeSubscriptions: number;
  monthlyRevenue: string;
  eventsProcessed: string;
  subscriptionDistribution: {
    tier: string;
    percentage: number;
    count: number;
    color: string;
  }[];
}

export interface NotificationPage extends Paginated<AlertNotification> {
  unreadCount: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, ...init } = options;
  const headers = new Headers(init.headers);

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const error = (payload as { error?: { message?: string; code?: string; details?: unknown } })
        ?.error;
      throw new ApiError(
        response.status,
        error?.message ?? `Request failed with status ${response.status}`,
        error?.code,
        error?.details
      );
    }

    const envelope = payload as { data?: T } | null;
    return (envelope && 'data' in envelope ? envelope.data : (payload as T)) as T;
  } catch (error) {
    // If it's an HTTP error from server (e.g. 401 Unauthorized), rethrow it
    if (error instanceof ApiError) {
      throw error;
    }

    // If network error (backend offline, connection refused, AbortError, Failed to fetch):
    // Transparently execute via Mock Service!
    return mockApiHandler<T>(path, options);
  }
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : '';
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResult>('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      }),
    register: (organizationName: string, email: string, password: string, role: Role = 'Business Owner') =>
      request<AuthResult>('/auth/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ organizationName, email, password, role }),
      }),
    resetPassword: (email: string, newPassword: string) =>
      request<AuthResult>('/auth/reset-password', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, newPassword }),
      }),
    me: () => request<{ user: AuthUser }>('/auth/me'),
  },

  plans: {
    list: () => request<Plan[]>('/plans'),
    create: (input: Omit<Plan, 'id'>) =>
      request<Plan>('/plans', { method: 'POST', body: JSON.stringify(input) }),
    remove: (id: string) =>
      request<void>(`/plans/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },

  subscription: {
    get: () => request<Subscription>('/subscription'),
    change: (plan: string, billingCycle?: 'monthly' | 'annual') =>
      request<Subscription>('/subscription/change', {
        method: 'POST',
        body: JSON.stringify({ plan, billingCycle }),
      }),
    cancel: () => request<Subscription>('/subscription/cancel', { method: 'POST' }),
    reactivate: () => request<Subscription>('/subscription/reactivate', { method: 'POST' }),
    setStatus: (status: SubscriptionStatus) =>
      request<Subscription>('/subscription/status', {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  usage: {
    meters: () => request<UsageMeter[]>('/usage/meters'),
    events: (params: PageQuery & { tab?: string } = {}) =>
      request<Paginated<UsageEvent>>(
        `/usage/events${query({
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 100,
          search: params.search,
          tab: params.tab,
        })}`
      ),
    simulate: (duplicate = false) =>
      request<IngestResult[]>('/usage/simulate', {
        method: 'POST',
        body: JSON.stringify({ duplicate, count: 1 }),
      }),
    clearEvents: () => request<void>('/usage/events', { method: 'DELETE' }),
  },

  billing: {
    current: () => request<Invoice>('/billing/current'),
    invoices: (params: PageQuery = {}) =>
      request<Paginated<Invoice>>(
        `/billing/invoices${query({
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 100,
          search: params.search,
        })}`
      ),
    invoice: (id: string) =>
      request<Invoice>(`/billing/invoices/${encodeURIComponent(id)}`),
    pay: (id: string) =>
      request<Invoice>(`/billing/invoices/${encodeURIComponent(id)}/pay`, {
        method: 'POST',
      }),
  },

  customers: {
    list: (params: PageQuery & { status?: string } = {}) =>
      request<Paginated<Customer>>(
        `/customers${query({
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 100,
          search: params.search,
          status: params.status,
        })}`
      ),
    create: (input: Omit<Customer, 'id'>) =>
      request<Customer>('/customers', { method: 'POST', body: JSON.stringify(input) }),
    setStatus: (id: string, status: Customer['status']) =>
      request<Customer>(`/customers/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  alerts: {
    rules: () => request<AlertRules>('/alerts/rules'),
    updateRules: (rules: AlertRules) =>
      request<AlertRules>('/alerts/rules', { method: 'PUT', body: JSON.stringify(rules) }),
    notifications: (params: PageQuery = {}) =>
      request<NotificationPage>(
        `/alerts/notifications${query({
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 100,
        })}`
      ),
    testNotification: (message?: string) =>
      request<AlertNotification>('/alerts/notifications/test', {
        method: 'POST',
        body: JSON.stringify(message ? { message } : {}),
      }),
    markRead: () =>
      request<{ updated: number }>('/alerts/notifications/read', { method: 'POST' }),
  },

  admin: {
    stats: () => request<AdminStats>('/admin/stats'),
    auditLogs: (params: PageQuery = {}) =>
      request<Paginated<AuditLog>>(
        `/admin/audit-logs${query({
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 100,
          search: params.search,
        })}`
      ),
  },
};
