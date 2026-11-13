import { Router } from 'express';
import { adminRouter } from './admin.routes';
import { alertsRouter } from './alerts.routes';
import { authRouter } from './auth.routes';
import { billingRouter } from './billing.routes';
import { customersRouter } from './customers.routes';
import { healthRouter } from './health.routes';
import { plansRouter } from './plans.routes';
import { subscriptionRouter } from './subscription.routes';
import { usageRouter } from './usage.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/plans', plansRouter);
apiRouter.use('/subscription', subscriptionRouter);
apiRouter.use('/usage', usageRouter);
apiRouter.use('/billing', billingRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/alerts', alertsRouter);
apiRouter.use('/admin', adminRouter);
