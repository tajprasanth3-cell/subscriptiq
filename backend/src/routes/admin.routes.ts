import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getAdminStats, listAuditLogs } from '../services/admin.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/http';
import { auditLogsQuerySchema } from '../validation/schemas';

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole('Super Admin'));

adminRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    ok(res, getAdminStats(getStore()));
  })
);

adminRouter.get(
  '/audit-logs',
  validate({ query: auditLogsQuerySchema }),
  asyncHandler(async (req, res) => {
    ok(res, listAuditLogs(getStore(), req.query as unknown as never));
  })
);
