// Brute-force / spam protection. Disabled under test so suites stay deterministic.
import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { config } from '../config/env';

const make = (windowMinutes: number, max: number, code: string): RequestHandler =>
  config.isTest
    ? (_req, _res, next) => next()
    : rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        limit: max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, res) => {
          res.status(429).json({ success: false, error: { code, message: 'Too many requests. Please try again later.' } });
        },
      });

export const apiLimiter = make(15, 300, 'RATE_LIMITED');
export const authLimiter = make(15, 30, 'RATE_LIMITED');
export const contactLimiter = make(60, 5, 'RATE_LIMITED');
