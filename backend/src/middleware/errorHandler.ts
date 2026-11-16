import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const apiError =
    err instanceof ApiError
      ? err
      : new ApiError(500, 'An unexpected error occurred', 'INTERNAL_ERROR');

  if (!(err instanceof ApiError)) {
    // Log unexpected failures with full context for debugging.
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(apiError.statusCode).json({
    error: {
      code: apiError.code,
      message: err instanceof Error ? `${apiError.message}: ${err.message}` : apiError.message,
      details: apiError.details ?? (err instanceof Error ? err.stack : undefined),
      requestId: req.requestId,
    },
  });
}
