import type { Request, Response } from 'express';
import type { AuditActor } from '../services/audit.service';

/** Send a successful JSON response using the `{ data }` envelope. */
export function ok<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ data });
}

/** Build an audit actor descriptor from the authenticated request. */
export function actorFrom(req: Request): AuditActor {
  const user = req.user;
  if (!user) return { who: 'System', role: 'Automated Worker' };
  return { who: `${user.organizationName} (${user.role})`, role: user.role };
}
