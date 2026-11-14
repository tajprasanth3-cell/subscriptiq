import type { Store } from '../store/store';
import type { BillingCycle, Subscription, SubscriptionStatus } from '../types';
import { ApiError } from '../utils/ApiError';
import { createId, relativeTime } from '../utils/id';
import { recordAudit, type AuditActor } from './audit.service';
import { getPlan } from './plan.service';

export function getSubscription(store: Store): Subscription {
  return store.data.subscription;
}

function syncCurrentInvoiceToPlan(
  store: Store,
  planName: string,
  billingCycle: BillingCycle
): void {
  const plan = getPlan(store, planName);
  const invoice = store.data.invoices.find((i) => i.id === 'inv_current');
  if (!invoice) return;

  const overage = invoice.lineItems
    .filter((li) => li.id !== 'li_1')
    .reduce((sum, li) => sum + li.amount, 0);
  const recurringFee =
    billingCycle === 'annual' ? Math.round(plan.price * 0.8 * 12) : plan.price;

  invoice.lineItems[0] = {
    id: 'li_1',
    lineItem: 'Recurring fee',
    sourceUsage: `Plan (${plan.name})`,
    rate: 'Flat',
    amount: recurringFee,
  };
  invoice.total = recurringFee + overage;
}

export function changePlan(
  store: Store,
  planName: string,
  billingCycle: BillingCycle | undefined,
  actor: AuditActor
): Subscription {
  const plan = getPlan(store, planName);
  const subscription = store.data.subscription;
  const previousPlan = subscription.plan;
  subscription.plan = plan.name;
  subscription.status = 'active';
  if (billingCycle) subscription.billingCycle = billingCycle;

  store.data.plans.forEach((p) => {
    p.isCurrent = p.name === plan.name;
  });
  syncCurrentInvoiceToPlan(store, plan.name, subscription.billingCycle);

  // A plan change creates a fresh amount due; re-open the current invoice if it
  // had already been settled so the checkout payment can collect the difference.
  const currentInvoice = store.data.invoices.find((i) => i.id === 'inv_current');
  if (currentInvoice && previousPlan !== plan.name && currentInvoice.status === 'Paid') {
    currentInvoice.status = 'Open';
  }

  recordAudit(store, actor, `Changed subscription tier to ${plan.name}`);

  // Push renewal notification to user notification inbox
  store.data.notifications.unshift({
    id: createId('notif'),
    type: 'Renewal',
    message: `Subscription plan upgraded to ${plan.name} (${subscription.billingCycle} billing)`,
    timestamp: relativeTime(new Date()),
    unread: true,
  });

  store.persist();
  return subscription;
}

export function cancelSubscription(store: Store, actor: AuditActor): Subscription {
  const subscription = store.data.subscription;
  subscription.status = 'cancelled';
  recordAudit(store, actor, 'Requested subscription cancellation at period end');
  store.persist();
  return subscription;
}

export function reactivateSubscription(store: Store, actor: AuditActor): Subscription {
  const subscription = store.data.subscription;
  if (subscription.status === 'active') {
    throw ApiError.conflict('Subscription is already active');
  }
  subscription.status = 'active';
  recordAudit(store, actor, 'Reactivated subscription');
  store.persist();
  return subscription;
}

export function setSubscriptionStatus(
  store: Store,
  status: SubscriptionStatus,
  actor: AuditActor
): Subscription {
  const subscription = store.data.subscription;
  subscription.status = status;
  recordAudit(store, actor, `Set subscription status to ${status}`);
  store.persist();
  return subscription;
}
