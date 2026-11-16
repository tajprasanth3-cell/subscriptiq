import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  cancelSubscription,
  changePlan,
  getSubscription,
  reactivateSubscription,
  setSubscriptionStatus,
} from '../services/subscription.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { actorFrom, ok } from '../utils/http';
import { changePlanSchema, updateSubscriptionStatusSchema } from '../validation/schemas';

export const subscriptionRouter = Router();

subscriptionRouter.use(authenticate);

subscriptionRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user?.role === 'Customer') {
      return ok(res, {
        id: 'sub_techcorp',
        plan: 'Professional',
        status: 'active',
        billingCycle: 'monthly',
        startedAt: '2026-01-01T00:00:00Z',
        renewalDate: 'Apr 30, 2026',
      });
    }
    ok(res, getSubscription(getStore()));
  })
);

subscriptionRouter.post(
  '/change',
  requireRole('Business Owner', 'Super Admin', 'Customer'),
  validate({ body: changePlanSchema }),
  asyncHandler(async (req, res) => {
    const subscription = changePlan(
      getStore(),
      req.body.plan,
      req.body.billingCycle,
      actorFrom(req)
    );
    ok(res, subscription);
  })
);

subscriptionRouter.post(
  '/cancel',
  requireRole('Business Owner', 'Super Admin', 'Customer'),
  asyncHandler(async (req, res) => {
    ok(res, cancelSubscription(getStore(), actorFrom(req)));
  })
);

subscriptionRouter.post(
  '/reactivate',
  requireRole('Business Owner', 'Super Admin', 'Customer'),
  asyncHandler(async (req, res) => {
    ok(res, reactivateSubscription(getStore(), actorFrom(req)));
  })
);

subscriptionRouter.patch(
  '/status',
  requireRole('Business Owner', 'Super Admin'),
  validate({ body: updateSubscriptionStatusSchema }),
  asyncHandler(async (req, res) => {
    ok(res, setSubscriptionStatus(getStore(), req.body.status, actorFrom(req)));
  })
);
