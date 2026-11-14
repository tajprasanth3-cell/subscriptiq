import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createCustomer,
  cycleCustomerStatus,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
  updateCustomerStatus,
} from '../services/customer.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { actorFrom, ok } from '../utils/http';
import {
  createCustomerSchema,
  customersQuerySchema,
  idParamSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
} from '../validation/schemas';

export const customersRouter = Router();

customersRouter.use(authenticate);

customersRouter.get(
  '/',
  requireRole('Business Owner', 'Super Admin'),
  validate({ query: customersQuerySchema }),
  asyncHandler(async (req, res) => {
    ok(res, listCustomers(getStore(), req.query as unknown as never));
  })
);

customersRouter.get(
  '/:id',
  requireRole('Business Owner', 'Super Admin'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    ok(res, getCustomer(getStore(), req.params.id));
  })
);

customersRouter.post(
  '/',
  requireRole('Business Owner', 'Super Admin'),
  validate({ body: createCustomerSchema }),
  asyncHandler(async (req, res) => {
    ok(res, createCustomer(getStore(), req.body, actorFrom(req)), 201);
  })
);

customersRouter.patch(
  '/:id',
  requireRole('Business Owner', 'Super Admin'),
  validate({ params: idParamSchema, body: updateCustomerSchema }),
  asyncHandler(async (req, res) => {
    ok(res, updateCustomer(getStore(), req.params.id, req.body, actorFrom(req)));
  })
);

customersRouter.patch(
  '/:id/status',
  requireRole('Business Owner', 'Super Admin'),
  validate({ params: idParamSchema, body: updateCustomerStatusSchema }),
  asyncHandler(async (req, res) => {
    ok(res, updateCustomerStatus(getStore(), req.params.id, req.body.status, actorFrom(req)));
  })
);

customersRouter.post(
  '/:id/cycle-status',
  requireRole('Business Owner', 'Super Admin'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    ok(res, cycleCustomerStatus(getStore(), req.params.id, actorFrom(req)));
  })
);

customersRouter.delete(
  '/:id',
  requireRole('Business Owner', 'Super Admin'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    deleteCustomer(getStore(), req.params.id, actorFrom(req));
    res.status(204).send();
  })
);
