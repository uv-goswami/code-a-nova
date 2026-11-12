// Builds the Express app WITHOUT listening, so Jest/Supertest can import it (ADR-0010).
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';

import { config } from './config/env';
import { spec } from './config/openapi';
import { router } from './routes';
import { apiLimiter } from './middleware/rateLimiters';
import { notFound, errorHandler } from './middleware/errorHandler';

export const app = express();

app.set('trust proxy', 1); // behind Render/Railway proxy: real client IP for rate limiting
app.use(helmet());
app.use(cors({ origin: config.clientUrls }));
if (!config.isTest) app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));

// API docs (mounted BEFORE the validator so they are never validated).
app.get('/api/openapi.json', (_req, res) => {
  res.json(spec);
});
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(spec as unknown as Record<string, unknown>, { customSiteTitle: 'Code-a-Nova API Docs' })
);

// API responses are per-user and often private (profile, registration): never let browsers/proxies cache them.
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/api', apiLimiter);

// Validates every /api request against openapi.yaml (body, params, additionalProperties, enums...).
app.use(
  OpenApiValidator.middleware({
    apiSpec: spec,
    validateRequests: { allErrors: true }, // report every invalid field at once (better form UX)
    validateResponses: false,
    validateSecurity: false, // JWT is enforced by our own `protect` middleware
  })
);

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);
