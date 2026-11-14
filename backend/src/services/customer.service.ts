import type { Store } from '../store/store';
import type { Customer, CustomerStatus, Paginated } from '../types';
import { ApiError } from '../utils/ApiError';
import { createId } from '../utils/id';
import { recordAudit, type AuditActor } from './audit.service';

export interface CreateCustomerInput {
  name: string;
  email: string;
  mobile?: string;
  plan: string;
  status?: CustomerStatus;
  usagePercentage?: number;
  renewalDate?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface ListCustomersQuery {
  search: string;
  status?: CustomerStatus;
  page: number;
  pageSize: number;
}

const STATUS_CYCLE: Record<CustomerStatus, CustomerStatus> = {
  Active: 'Near limit',
  'Near limit': 'Suspended',
  Suspended: 'Active',
  Pending: 'Active',
};

export function listCustomers(store: Store, query: ListCustomersQuery): Paginated<Customer> {
  const search = query.search.trim().toLowerCase();
  const filtered = store.data.customers.filter((c) => {
    const matchesStatus = !query.status || c.status === query.status;
    const matchesSearch =
      search === '' ||
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.plan.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

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

export function getCustomer(store: Store, id: string): Customer {
  const customer = store.data.customers.find((c) => c.id === id);
  if (!customer) throw ApiError.notFound(`Customer "${id}" was not found`);
  return customer;
}

export function createCustomer(
  store: Store,
  input: CreateCustomerInput,
  actor: AuditActor
): Customer {
  const email = input.email.trim().toLowerCase();
  if (store.data.customers.some((c) => c.email.toLowerCase() === email)) {
    throw ApiError.conflict(`A customer with email "${email}" already exists`);
  }
  const customer: Customer = {
    id: createId('cust'),
    name: input.name.trim(),
    plan: input.plan,
    status: input.status ?? 'Active',
    usagePercentage: input.usagePercentage ?? Math.floor(10 + Math.random() * 30),
    renewalDate: input.renewalDate ?? 'May 30, 2026',
    email,
    mobile: input.mobile?.trim() || undefined,
  };
  store.data.customers.unshift(customer);
  recordAudit(store, actor, `Registered new customer: ${customer.name}`);
  store.persist();
  return customer;
}

export function updateCustomer(
  store: Store,
  id: string,
  input: UpdateCustomerInput,
  actor: AuditActor
): Customer {
  const customer = getCustomer(store, id);
  Object.assign(customer, input);
  recordAudit(store, actor, `Updated customer ${customer.name}`);
  store.persist();
  return customer;
}

export function updateCustomerStatus(
  store: Store,
  id: string,
  status: CustomerStatus,
  actor: AuditActor
): Customer {
  const customer = getCustomer(store, id);
  customer.status = status;
  recordAudit(store, actor, `Updated ${customer.name} status to ${status}`);
  store.persist();
  return customer;
}

export function cycleCustomerStatus(store: Store, id: string, actor: AuditActor): Customer {
  const customer = getCustomer(store, id);
  return updateCustomerStatus(store, id, STATUS_CYCLE[customer.status], actor);
}

export function deleteCustomer(store: Store, id: string, actor: AuditActor): void {
  const customer = getCustomer(store, id);
  store.data.customers = store.data.customers.filter((c) => c.id !== id);
  recordAudit(store, actor, `Removed customer: ${customer.name}`);
  store.persist();
}
