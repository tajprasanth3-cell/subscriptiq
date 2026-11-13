import type { NextFunction, Request, Response } from 'express';
import { getStore } from '../store/store';
import type { Role } from '../types';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';

function extractToken(req: Request): string | null {
  const header = req.header('authorization');
  if (header && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

/** Require a valid bearer token and attach the resolved user to the request. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(ApiError.unauthorized());
    return;
  }

  const payload = verifyToken(token);
  const store = getStore();
  const user = store.data.users.find((u) => u.id === payload.sub);
  if (!user) {
    next(ApiError.unauthorized('Account no longer exists'));
    return;
  }

  const org = store.data.organizations.find((o) => o.id === user.organizationId);

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: org?.name ?? 'Unknown Organization',
  };
  next();
}

/** Restrict a route to one or more roles. Must run after `authenticate`. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden(`This action requires one of: ${roles.join(', ')}`));
      return;
    }
    next();
  };
}
