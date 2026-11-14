import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { login, register, resetPassword } from '../services/auth.service';
import { getStore } from '../store/store';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/http';
import { loginSchema, registerSchema, resetPasswordSchema } from '../validation/schemas';

export const authRouter = Router();

authRouter.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const result = login(getStore(), req.body);
    ok(res, result);
  })
);

authRouter.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  asyncHandler(async (req, res) => {
    const result = resetPassword(getStore(), req.body);
    ok(res, result);
  })
);

authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const result = register(getStore(), req.body);
    ok(res, result, 201);
  })
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    ok(res, { user: req.user });
  })
);
