export type Role = 'Business Owner' | 'Super Admin' | 'Customer';

export type PlanTier = 'Basic' | 'Professional' | 'Enterprise';

export type SubscriptionStatus =
  | 'plan_selected'
  | 'active'
  | 'renewal_due'
  | 'past_due'
  | 'cancelled';

export interface PlanFeature {
  text: string;
  included: boolean;
}

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

export interface UsageEvent {
  id: string;
  customer: string;
  resource: string;
  quantity: number | string;
  timestamp: string;
  status:
    | 'Accepted'
    | 'Duplicate, ignored'
    | 'Rejected: no quantity'
    | 'Rejected: invalid schema'
    | 'Rejected: quota exceeded';
  statusCategory: 'accepted' | 'duplicate' | 'rejected';
}

export interface InvoiceLineItem {
  id: string;
  lineItem: string;
  sourceUsage: string;
  rate: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer?: string;
  period: string;
  date?: string;
  status: 'Open' | 'Paid' | 'Pending' | 'Overdue';
  total: number;
  currency: string;
  lineItems: InvoiceLineItem[];
  dueDate?: string;
  paymentMethod?: string;
}

export interface Customer {
  id: string;
  name: string;
  plan: PlanTier;
  status: 'Active' | 'Near limit' | 'Suspended' | 'Pending';
  usagePercentage: number;
  renewalDate: string;
  email: string;
}

export interface AlertNotification {
  id: string;
  type: 'Threshold' | 'Renewal' | 'Billing' | 'System';
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

