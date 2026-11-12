import type { NextFunction, Request, RequestHandler, Response } from 'express';

// Forwards rejected promises from async route handlers to Express error middleware.
// Generic so controllers can declare a richer request type (e.g. AuthedRequest).
export const asyncHandler =
  <R extends Request = Request>(fn: (req: R, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as R, res, next)).catch(next);
  };
