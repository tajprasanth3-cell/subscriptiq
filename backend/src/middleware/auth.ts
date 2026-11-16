import type { NextFunction, Request, Response } from 'express';
import { getStore } from '../store/store';
import type { Role, User, Organization } from '../types';
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
  let user = store.data.users.find(
    (u) => u.id === payload.sub || u.email.toLowerCase() === (payload.email || '').toLowerCase()
  );
  if (!user) {
    const newUser: User = {
      id: payload.sub,
      email: payload.email || 'user@subscriptiq.local',
      name: (payload.email || 'User').split('@')[0],
      role: payload.role,
      organizationId: payload.organizationId || 'org_acme',
      passwordHash: '',
      createdAt: new Date().toISOString(),
    };
    store.data.users.push(newUser);
    user = newUser;
  }

  let org = store.data.organizations.find((o) => o.id === user!.organizationId);
  if (!org) {
    const newOrg: Organization = {
      id: user.organizationId,
      name:
        user.role === 'Customer'
          ? 'TechCorp'
          : user.role === 'Super Admin'
            ? 'SubscriptIQ Platform'
            : 'Acme Corp',
      plan: 'Professional',
      createdAt: new Date().toISOString(),
    };
    store.data.organizations.push(newOrg);
    org = newOrg;
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: org.name,
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
