import type { Store } from '../store/store';
import type {
  AlertNotification,
  Paginated,
  UsageEvent,
  UsageMeter,
  UsageStatusCategory,
} from '../types';
import { createId, relativeTime } from '../utils/id';
import { toCsv } from '../utils/format';

export interface IngestInput {
  id: string;
  customer: string;
  resource: string;
  quantity?: number | string;
  timestamp?: string;
}

export interface IngestResult {
  event: UsageEvent;
  metered: boolean;
}

export interface ListEventsQuery {
  tab: 'all' | 'accepted' | 'duplicate' | 'rejected';
  search: string;
  page: number;
  pageSize: number;
}

export interface SimulateOptions {
  duplicate: boolean;
  count: number;
}

const RESOURCES = ['API requests', 'Storage', 'Transactions', 'Webhooks'];

type Classification =
  | { ok: true; quantity: number }
  | { ok: false; status: UsageEvent['status']; statusCategory: UsageStatusCategory };

/**
 * Classify an incoming event payload. This is the schema gate that decides
 * whether an event carries a billable quantity before idempotency is applied.
 */
export function classifyQuantity(quantity: number | string | undefined): Classification {
  if (quantity === undefined || quantity === null) {
    return { ok: false, status: 'Rejected: no quantity', statusCategory: 'rejected' };
  }
  if (typeof quantity === 'number') {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, status: 'Rejected: invalid schema', statusCategory: 'rejected' };
    }
    return { ok: true, quantity };
  }
  const trimmed = quantity.trim();
  if (trimmed === '') {
    return { ok: false, status: 'Rejected: no quantity', statusCategory: 'rejected' };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { ok: false, status: 'Rejected: invalid schema', statusCategory: 'rejected' };
  }
  return { ok: true, quantity: parsed };
}

function findMeterForResource(store: Store, resource: string): UsageMeter | undefined {
  const target = resource.trim().toLowerCase();
  return (
    store.data.meters.find((m) => m.name.toLowerCase() === target) ??
    store.data.meters.find((m) => m.id === 'api_requests')
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function meterStatus(percentage: number): { label: string; type: UsageMeter['statusType'] } {
  if (percentage >= 100) return { label: 'Limit exceeded', type: 'warning' };
  if (percentage > 90) return { label: 'Near limit: alert sent', type: 'warning' };
  if (percentage > 70) return { label: 'Approaching limit', type: 'approaching' };
  return { label: 'Within limit', type: 'normal' };
}

function raiseThresholdAlerts(store: Store, meter: UsageMeter, previous: number): void {
  const { firstAlertPercentage, secondAlertPercentage } = store.data.alertRules;
  const now = meter.percentage;
  const checks: { threshold: number; label: string }[] = [
    { threshold: firstAlertPercentage, label: 'first' },
    { threshold: secondAlertPercentage, label: 'second' },
  ];
  for (const check of checks) {
    if (previous < check.threshold && now >= check.threshold) {
      const notification: AlertNotification = {
        id: createId('notif'),
        type: 'Threshold',
        message: `${meter.name} crossed the ${check.label} alert threshold (${check.threshold}%).`,
        timestamp: relativeTime(),
        unread: true,
      };
      store.data.notifications.unshift(notification);
    }
  }
}

function meterEvent(store: Store, resource: string, quantity: number): UsageMeter | undefined {
  const meter = findMeterForResource(store, resource);
  if (!meter) return undefined;
  const previous = meter.percentage;
  meter.used = round(meter.used + quantity);
  meter.percentage = Math.min(100, Math.round((meter.used / meter.limit) * 100));
  const status = meterStatus(meter.percentage);
  meter.statusLabel = status.label;
  meter.statusType = status.type;
  raiseThresholdAlerts(store, meter, previous);
  return meter;
}

/**
 * Idempotently ingest a single usage event.
 *
 * Rules (applied in order):
 *  1. Missing/invalid quantity  -> rejected (never metered)
 *  2. Already-seen event id     -> duplicate, ignored (never metered twice)
 *  3. Quota block rule active   -> rejected: quota exceeded
 *  4. Otherwise                 -> accepted and metered
 */
export function ingestEvent(store: Store, input: IngestInput): IngestResult {
  const classification = classifyQuantity(input.quantity);
  if (!classification.ok) {
    const event: UsageEvent = {
      id: input.id,
      customer: input.customer,
      resource: input.resource,
      quantity: input.quantity ?? 'missing',
      timestamp: input.timestamp ?? relativeTime(),
      status: classification.status,
      statusCategory: classification.statusCategory,
    };
    store.data.events.unshift(event);
    store.persist();
    return { event, metered: false };
  }

  if (store.data.processedEventIds.includes(input.id)) {
    const event: UsageEvent = {
      id: input.id,
      customer: input.customer,
      resource: input.resource,
      quantity: classification.quantity,
      timestamp: input.timestamp ?? relativeTime(),
      status: 'Duplicate, ignored',
      statusCategory: 'duplicate',
    };
    store.data.events.unshift(event);
    store.persist();
    return { event, metered: false };
  }

  const meter = findMeterForResource(store, input.resource);
  if (
    meter &&
    store.data.alertRules.actionOnExceed === 'block_usage' &&
    meter.used >= meter.limit
  ) {
    const event: UsageEvent = {
      id: input.id,
      customer: input.customer,
      resource: input.resource,
      quantity: classification.quantity,
      timestamp: input.timestamp ?? relativeTime(),
      status: 'Rejected: quota exceeded',
      statusCategory: 'rejected',
    };
    store.data.events.unshift(event);
    store.persist();
    return { event, metered: false };
  }

  const event: UsageEvent = {
    id: input.id,
    customer: input.customer,
    resource: input.resource,
    quantity: classification.quantity,
    timestamp: input.timestamp ?? relativeTime(),
    status: 'Accepted',
    statusCategory: 'accepted',
  };
  store.data.events.unshift(event);
  store.data.processedEventIds.push(input.id);
  meterEvent(store, input.resource, classification.quantity);
  store.persist();
  return { event, metered: true };
}

/** Simulate one or more ingestions, mirroring the frontend's demo behaviour. */
export function simulateIngestion(store: Store, options: SimulateOptions): IngestResult[] {
  const results: IngestResult[] = [];
  for (let i = 0; i < options.count; i += 1) {
    const resource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
    const quantity = options.duplicate ? 250 : Math.floor(50 + Math.random() * 450);
    results.push(
      ingestEvent(store, {
        id: options.duplicate ? 'evt_101' : createId('evt'),
        customer: 'Acme',
        resource,
        quantity,
      })
    );
  }
  return results;
}

export function listMeters(store: Store, role?: string): UsageMeter[] {
  if (role === 'Customer') {
    return [
      {
        id: 'api_requests',
        name: 'API requests',
        used: 72450,
        limit: 100000,
        unit: 'reqs',
        percentage: 72.5,
        statusLabel: 'Within quota',
        statusType: 'normal',
      },
      {
        id: 'storage',
        name: 'Storage',
        used: 24,
        limit: 50,
        unit: 'GB',
        percentage: 48,
        statusLabel: 'Within limit',
        statusType: 'normal',
      },
    ];
  }
  return store.data.meters;
}

export function listEvents(store: Store, query: ListEventsQuery, role?: string): Paginated<UsageEvent> {
  const search = query.search.trim().toLowerCase();
  let baseEvents = store.data.events;
  if (role === 'Customer') {
    baseEvents = baseEvents.filter((e) => e.customer.toLowerCase().includes('techcorp'));
  }
  const filtered = baseEvents.filter((event) => {
    const matchesTab = query.tab === 'all' || event.statusCategory === query.tab;
    const matchesSearch =
      search === '' ||
      event.id.toLowerCase().includes(search) ||
      event.customer.toLowerCase().includes(search) ||
      event.resource.toLowerCase().includes(search);
    return matchesTab && matchesSearch;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;
  const items = filtered.slice(start, start + query.pageSize);
  return { items, total, page, pageSize: query.pageSize, totalPages };
}

export function eventStats(store: Store) {
  const events = store.data.events;
  return {
    totalEvents: events.length,
    accepted: events.filter((e) => e.statusCategory === 'accepted').length,
    duplicates: events.filter((e) => e.statusCategory === 'duplicate').length,
    rejected: events.filter((e) => e.statusCategory === 'rejected').length,
  };
}

/**
 * Clears the visible event log. Processed event ids are intentionally retained
 * so idempotency guarantees survive a log reset.
 */
export function clearEvents(store: Store): void {
  store.data.events = [];
  store.persist();
}

export function eventsToCsv(store: Store, tab: ListEventsQuery['tab'], search: string): string {
  const term = search.trim().toLowerCase();
  const rows = store.data.events
    .filter((event) => tab === 'all' || event.statusCategory === tab)
    .filter(
      (event) =>
        term === '' ||
        event.id.toLowerCase().includes(term) ||
        event.customer.toLowerCase().includes(term) ||
        event.resource.toLowerCase().includes(term)
    )
    .map((event) => [
      event.id,
      event.customer,
      event.resource,
      event.quantity,
      event.timestamp,
      event.status,
    ]);

  return toCsv(['Event ID', 'Customer', 'Resource', 'Quantity', 'Timestamp', 'Status'], rows);
}
