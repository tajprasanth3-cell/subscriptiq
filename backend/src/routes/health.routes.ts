import { Router } from 'express';
import { getStore, storePath } from '../store/store';
import { ok } from '../utils/http';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const store = getStore();
  ok(res, {
    status: 'ok',
    service: 'subscriptiq-backend',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    store: {
      path: storePath(),
      plans: store.data.plans.length,
      customers: store.data.customers.length,
      events: store.data.events.length,
    },
  });
});
