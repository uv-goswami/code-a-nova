import type { RequestHandler } from 'express';
import { options } from '../config/openapi';

export const health: RequestHandler = (_req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
};

export const getOptions: RequestHandler = (_req, res) => {
  res.json({ success: true, data: options });
};
