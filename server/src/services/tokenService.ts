import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { tokenPayloadSchema, type TokenPayload } from '../validators/rules';
import type { UserDocument } from '../models/User';

// Issues a signed JWT. Payload is deliberately minimal: user id + role.
export const signToken = (user: UserDocument): string =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

// Verifies signature + expiry (jsonwebtoken) and the payload shape (Zod).
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret);
  const parsed = tokenPayloadSchema.safeParse(decoded);
  if (!parsed.success) throw new jwt.JsonWebTokenError('Invalid token payload');
  return parsed.data;
}
