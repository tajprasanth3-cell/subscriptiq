import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPaymentOrder,
  verifyPayment,
  getAvailablePaymentGateways,
} from '../services/payment.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { actorFrom, ok } from '../utils/http';

export const paymentsRouter = Router();

// Public methods check
paymentsRouter.get('/methods', (_req, res) => {
  ok(res, getAvailablePaymentGateways());
});

// Authenticated gateway endpoints
paymentsRouter.use(authenticate);

paymentsRouter.post(
  '/create-order',
  asyncHandler(async (req, res) => {
    const store = getStore();
    const actor = actorFrom(req);
    const { amount, currency, planName, invoiceId } = req.body;

    const order = createPaymentOrder(store, {
      amount: Number(amount),
      currency,
      planName,
      invoiceId,
      customerName: actor.who,
      customerEmail: req.user?.email,
    });

    ok(res, order, 201);
  })
);

paymentsRouter.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const store = getStore();
    const actor = actorFrom(req);
    const { orderId, paymentMethod, paymentDetails, invoiceId, planName, amount } = req.body;

    const result = await verifyPayment(store, {
      orderId,
      paymentMethod,
      paymentDetails,
      invoiceId,
      planName,
      amount: Number(amount),
      actor,
    });

    ok(res, result);
  })
);
