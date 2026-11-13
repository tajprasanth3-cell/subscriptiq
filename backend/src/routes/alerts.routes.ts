import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getAlertRules,
  listNotifications,
  markAllNotificationsRead,
  triggerTestAlert,
  updateAlertRules,
} from '../services/alert.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { actorFrom, ok } from '../utils/http';
import {
  paginationSchema,
  testAlertSchema,
  updateAlertRulesSchema,
} from '../validation/schemas';

export const alertsRouter = Router();

alertsRouter.use(authenticate);

alertsRouter.get(
  '/rules',
  asyncHandler(async (_req, res) => {
    ok(res, getAlertRules(getStore()));
  })
);

alertsRouter.put(
  '/rules',
  requireRole('Business Owner', 'Super Admin'),
  validate({ body: updateAlertRulesSchema }),
  asyncHandler(async (req, res) => {
    ok(res, updateAlertRules(getStore(), req.body, actorFrom(req)));
  })
);

alertsRouter.get(
  '/notifications',
  validate({ query: paginationSchema }),
  asyncHandler(async (req, res) => {
    ok(res, listNotifications(getStore(), req.query as unknown as never));
  })
);

alertsRouter.post(
  '/notifications/test',
  requireRole('Business Owner', 'Super Admin'),
  validate({ body: testAlertSchema }),
  asyncHandler(async (req, res) => {
    ok(res, triggerTestAlert(getStore(), req.body.message), 201);
  })
);

alertsRouter.post(
  '/notifications/read',
  asyncHandler(async (_req, res) => {
    ok(res, { updated: markAllNotificationsRead(getStore()) });
  })
);
