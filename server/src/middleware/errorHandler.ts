// One place that converts every failure into the documented error envelope (ADR-0007).
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { config } from '../config/env';
import { ApiError, type ErrorDetail } from '../utils/ApiError';

const STATUS_CODES: Record<number, string> = {
  400: 'VALIDATION_ERROR', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED', 413: 'PAYLOAD_TOO_LARGE', 415: 'UNSUPPORTED_MEDIA_TYPE',
};

// Loose shape covering errors from body-parser, express-openapi-validator and Mongoose.
interface ForeignError {
  name?: string;
  message?: string;
  type?: string;
  status?: number;
  code?: number | string;
  errors?: unknown;
}
interface ValidatorIssue { path?: string; message?: string }
interface MongooseIssue { path: string; message: string }

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
};

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const e = (err ?? {}) as ForeignError;
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details: ErrorDetail[] | undefined;

  if (err instanceof ApiError) {
    ({ status, code, message, details } = err);
  } else if (e.type === 'entity.parse.failed') {
    status = 400; code = 'INVALID_JSON'; message = 'Request body is not valid JSON';
  } else if (e.type === 'entity.too.large') {
    status = 413; code = 'PAYLOAD_TOO_LARGE'; message = 'Request body is too large';
  } else if (Array.isArray(e.errors) && e.status) {
    // express-openapi-validator errors
    status = e.status;
    code = STATUS_CODES[status] ?? 'VALIDATION_ERROR';
    message = status === 400 ? 'Request validation failed' : (e.message ?? message);
    if (status === 400) {
      details = (e.errors as ValidatorIssue[]).map((issue) => ({
        // '/body/team/0/name' -> 'team.0.name' (clean field names for the UI)
        field: (issue.path ?? '').replace(/^\/?(body|query|params)\/?/, '').replace(/\//g, '.') || 'body',
        message: issue.message ?? 'invalid value',
      }));
    }
  } else if (e.code === 11000) {
    status = 409; code = 'DUPLICATE_KEY'; message = 'A record with these details already exists';
  } else if (e.name === 'ValidationError' && e.errors && !Array.isArray(e.errors)) {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Request validation failed';
    details = Object.values(e.errors as Record<string, MongooseIssue>).map((i) => ({ field: i.path, message: i.message }));
  } else if (e.status && e.status < 500) {
    status = e.status; code = STATUS_CODES[status] ?? 'BAD_REQUEST'; message = e.message ?? message;
  }

  if (status >= 500 && !config.isTest) console.error(err);

  res.status(status).json({
    success: false,
    error: { code, message, ...(details && details.length ? { details } : {}) },
  });
};
