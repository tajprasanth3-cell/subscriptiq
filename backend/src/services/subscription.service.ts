import type { Store } from '../store/store';
import type { BillingCycle, Subscription, SubscriptionStatus } from '../types';
import { ApiError } from '../utils/ApiError';
import { recordAudit, type AuditActor } from './audit.service';
import { getPlan } from './plan.service';

export function getSubscription(store: Store): Subscription {
  return store.data.subscription;
}

function syncCurrentInvoiceToPlan(store: Store, planName: string): void {
  const plan = getPlan(store, planName);
  const invoice = store.data.invoices.find((i) => i.id === 'inv_current');
  if (!invoice) return;

  const overage = invoice.lineItems
    .filter((li) => li.id !== 'li_1')
    .reduce((sum, li) => sum + li.amount, 0);

  invoice.lineItems[0] = {
    id: 'li_1',
    lineItem: 'Recurring fee',
    sourceUsage: `Plan (${plan.name})`,
    rate: 'Flat',
    amount: plan.price,
  };
  invoice.total = plan.price + overage;
}

export function changePlan(
  store: Store,
  planName: string,
  billingCycle: BillingCycle | undefined,
  actor: AuditActor
): Subscription {
  const plan = getPlan(store, planName);
  const subscription = store.data.subscription;
  subscription.plan = plan.name;
  subscription.status = 'active';
  if (billingCycle) subscription.billingCycle = billingCycle;

  store.data.plans.forEach((p) => {
    p.isCurrent = p.name === plan.name;
  });
  syncCurrentInvoiceToPlan(store, plan.name);

  recordAudit(store, actor, `Changed subscription tier to ${plan.name}`);
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
