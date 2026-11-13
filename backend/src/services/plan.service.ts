import type { Store } from '../store/store';
import type { Plan } from '../types';
import { ApiError } from '../utils/ApiError';
import { createId } from '../utils/id';
import { recordAudit, type AuditActor } from './audit.service';

export type CreatePlanInput = Omit<Plan, 'id' | 'createdAt'>;
export type UpdatePlanInput = Partial<CreatePlanInput>;

export function listPlans(store: Store): Plan[] {
  return store.data.plans;
}

export function getPlan(store: Store, id: string): Plan {
  const plan = store.data.plans.find((p) => p.id === id || p.name === id);
  if (!plan) throw ApiError.notFound(`Plan "${id}" was not found`);
  return plan;
}

export function createPlan(store: Store, input: CreatePlanInput, actor: AuditActor): Plan {
  if (store.data.plans.some((p) => p.name.toLowerCase() === input.name.toLowerCase())) {
    throw ApiError.conflict(`A plan named "${input.name}" already exists`);
  }
  const plan: Plan = {
    ...input,
    id: createId('plan'),
    createdAt: new Date().toISOString(),
  };
  store.data.plans.push(plan);
  recordAudit(store, actor, `Created new subscription tier: ${plan.name}`);
  store.persist();
  return plan;
}

export function updatePlan(
  store: Store,
  id: string,
  input: UpdatePlanInput,
  actor: AuditActor
): Plan {
  const plan = getPlan(store, id);
  Object.assign(plan, input);
  recordAudit(store, actor, `Updated subscription tier: ${plan.name}`);
  store.persist();
  return plan;
}

export function deletePlan(store: Store, id: string, actor: AuditActor): void {
  if (store.data.plans.length <= 1) {
    throw ApiError.conflict('At least one plan must remain in the catalog');
  }
  const plan = getPlan(store, id);
  store.data.plans = store.data.plans.filter((p) => p.id !== plan.id);
  recordAudit(store, actor, `Deleted subscription tier: ${plan.name}`);
  store.persist();
}
