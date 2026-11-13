export type Role = 'Business Owner' | 'Super Admin' | 'Customer';

export type PlanTier = 'Basic' | 'Professional' | 'Enterprise' | string;

export type SubscriptionStatus =
  | 'plan_selected'
  | 'active'
  | 'renewal_due'
  | 'past_due'
  | 'cancelled';

export type BillingCycle = 'monthly' | 'annual';

export interface Plan {
  id: string;
  name: PlanTier;
  price: number;
  currency: string;
  billingInterval: 'month' | 'year';
  description: string;
  badge?: string;
  apiLimit: string;
  storageLimit: string;
  features: string[];
  isCurrent?: boolean;
  createdAt?: string;
}

export interface Subscription {
  id: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startedAt: string;
  renewalDate: string;
}

export interface UsageMeter {
  id: string;
  name: string;
  used: number;
  limit: number;
  unit: string;
  percentage: number;
  statusLabel: string;
  statusType: 'normal' | 'approaching' | 'warning';
}

export type UsageEventStatus =
  | 'Accepted'
  | 'Duplicate, ignored'
  | 'Rejected: no quantity'
  | 'Rejected: invalid schema'
  | 'Rejected: quota exceeded';

export type UsageStatusCategory = 'accepted' | 'duplicate' | 'rejected';

export interface UsageEvent {
  id: string;
  customer: string;
  resource: string;
  quantity: number | string;
  timestamp: string;
  status: UsageEventStatus;
  statusCategory: UsageStatusCategory;
}

export interface InvoiceLineItem {
  id: string;
  lineItem: string;
  sourceUsage: string;
  rate: string;
  amount: number;
}

export type InvoiceStatus = 'Open' | 'Paid' | 'Pending' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer?: string;
  period: string;
  date?: string;
  status: InvoiceStatus;
  total: number;
  currency: string;
  lineItems: InvoiceLineItem[];
  dueDate?: string;
  paymentMethod?: string;
}

export type CustomerStatus = 'Active' | 'Near limit' | 'Suspended' | 'Pending';

export interface Customer {
  id: string;
  name: string;
  plan: PlanTier;
  status: CustomerStatus;
  usagePercentage: number;
  renewalDate: string;
  email: string;
}

export type AlertType = 'Threshold' | 'Renewal' | 'Billing' | 'System';

export interface AlertNotification {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  unread?: boolean;
}

export interface AlertRules {
  firstAlertPercentage: number;
  secondAlertPercentage: number;
  actionOnExceed: 'notify_only' | 'charge_overage' | 'block_usage';
}

export interface AuditLog {
  id: string;
  who: string;
  role: string;
  change: string;
  timestamp: string;
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  passwordHash: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: PlanTier;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  organizationName: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
