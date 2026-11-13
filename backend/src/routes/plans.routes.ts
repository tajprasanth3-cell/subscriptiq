import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPlan, deletePlan, getPlan, listPlans, updatePlan } from '../services/plan.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { actorFrom, ok } from '../utils/http';
import { createPlanSchema, idParamSchema, updatePlanSchema } from '../validation/schemas';

export const plansRouter = Router();

plansRouter.use(authenticate);

plansRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    ok(res, listPlans(getStore()));
  })
);

plansRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    ok(res, getPlan(getStore(), req.params.id));
  })
);

plansRouter.post(
  '/',
  requireRole('Super Admin'),
  validate({ body: createPlanSchema }),
  asyncHandler(async (req, res) => {
    const plan = createPlan(getStore(), req.body, actorFrom(req));
    ok(res, plan, 201);
  })
);

plansRouter.patch(
  '/:id',
  requireRole('Super Admin'),
  validate({ params: idParamSchema, body: updatePlanSchema }),
  asyncHandler(async (req, res) => {
    const plan = updatePlan(getStore(), req.params.id, req.body, actorFrom(req));
    ok(res, plan);
  })
);

plansRouter.delete(
  '/:id',
  requireRole('Super Admin'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    deletePlan(getStore(), req.params.id, actorFrom(req));
    res.status(204).send();
  })
);
