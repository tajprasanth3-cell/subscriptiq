import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getCurrentInvoice,
  getInvoice,
  invoiceToCsv,
  listInvoices,
  markInvoicePaid,
} from '../services/billing.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { actorFrom, ok } from '../utils/http';
import { idParamSchema, invoicesQuerySchema } from '../validation/schemas';

export const billingRouter = Router();

billingRouter.use(authenticate);

billingRouter.get(
  '/current',
  asyncHandler(async (_req, res) => {
    ok(res, getCurrentInvoice(getStore()));
  })
);

billingRouter.get(
  '/invoices',
  validate({ query: invoicesQuerySchema }),
  asyncHandler(async (req, res) => {
    ok(res, listInvoices(getStore(), req.query as unknown as never));
  })
);

billingRouter.get(
  '/invoices/:id/export',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const invoice = getInvoice(getStore(), req.params.id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoice.invoiceNumber}.csv"`
    );
    res.send(invoiceToCsv(invoice));
  })
);

billingRouter.get(
  '/invoices/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    ok(res, getInvoice(getStore(), req.params.id));
  })
);

billingRouter.post(
  '/invoices/:id/pay',
  requireRole('Business Owner', 'Super Admin', 'Customer'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    ok(res, markInvoicePaid(getStore(), req.params.id, actorFrom(req)));
  })
);
