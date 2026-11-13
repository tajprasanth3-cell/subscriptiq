import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/** Attach a correlation id to every request for tracing and error reports. */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('x-request-id');
  req.requestId = incoming && incoming.length <= 128 ? incoming : randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}
