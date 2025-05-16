import type { Request, Response, NextFunction } from 'express';
import { AuthError } from '../types/errors';
import { verifyToken } from '../utils/jwt';

interface AuthenticatedRequest extends Request {
  user?: unknown;
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return next(new AuthError('Authorization header missing', 'AUTH_MISSING_HEADER'));
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return next(new AuthError('Invalid Authorization header format. Expected Bearer token.', 'AUTH_INVALID_FORMAT'));
  }

  try {
    const payload = verifyToken(token);
    if (typeof payload !== 'object' || !payload || !('id' in payload)) {
      return next(new AuthError('Invalid token payload.', 'AUTH_INVALID_PAYLOAD'));
    }
    next();
  } catch (err: unknown) {
    return next(new AuthError('Invalid or expired token.', 'AUTH_INVALID_TOKEN'));
  }
}
