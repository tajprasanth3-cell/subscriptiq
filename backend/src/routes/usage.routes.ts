import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  clearEvents,
  eventStats,
  eventsToCsv,
  ingestEvent,
  listEvents,
  listMeters,
  simulateIngestion,
} from '../services/usage.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/http';
import {
  ingestEventSchema,
  simulateIngestionSchema,
  usageEventsQuerySchema,
} from '../validation/schemas';

export const usageRouter = Router();

usageRouter.use(authenticate);

usageRouter.get(
  '/meters',
  asyncHandler(async (req, res) => {
    ok(res, listMeters(getStore(), req.user?.role));
  })
);

usageRouter.get(
  '/events/stats',
  asyncHandler(async (_req, res) => {
    ok(res, eventStats(getStore()));
  })
);

usageRouter.get(
  '/events/export',
  validate({ query: usageEventsQuerySchema }),
  asyncHandler(async (req, res) => {
    const { tab, search } = req.query as unknown as { tab: string; search: string };
    const csv = eventsToCsv(getStore(), tab as never, search);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="usage_events_${Date.now()}.csv"`);
    res.send(csv);
  })
);

usageRouter.get(
  '/events',
  validate({ query: usageEventsQuerySchema }),
  asyncHandler(async (req, res) => {
    ok(res, listEvents(getStore(), req.query as unknown as never, req.user?.role));
  })
);

usageRouter.post(
  '/events',
  validate({ body: ingestEventSchema }),
  asyncHandler(async (req, res) => {
    const result = ingestEvent(getStore(), req.body);
    ok(res, result, result.metered ? 201 : 200);
  })
);

usageRouter.post(
  '/simulate',
  validate({ body: simulateIngestionSchema }),
  asyncHandler(async (req, res) => {
    const results = simulateIngestion(getStore(), req.body);
    ok(res, results, 201);
  })
);

usageRouter.delete(
  '/events',
  asyncHandler(async (_req, res) => {
    clearEvents(getStore());
    res.status(204).send();
  })
);
