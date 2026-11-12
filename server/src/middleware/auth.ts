// JWT guard. Attaches the fresh DB user to req.user (so deleted/unverified users lose access immediately).
import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import { User, type UserDocument } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyToken } from '../services/tokenService';

// A request that has passed through `protect`.
export interface AuthedRequest extends Request {
  user: UserDocument;
}

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('UNAUTHORIZED', 'Authentication required');
  }

  let userId: string;
  try {
    userId = verifyToken(token).sub;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('TOKEN_EXPIRED', 'Session expired. Please log in again.');
    }
    throw ApiError.unauthorized('UNAUTHORIZED', 'Invalid authentication token');
  }

  const user = await User.findById(userId);
  if (!user || !user.isVerified) {
    throw ApiError.unauthorized('UNAUTHORIZED', 'Account no longer valid');
  }
  (req as AuthedRequest).user = user;
  next();
});
