import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/generateToken';
import { sendError } from '../utils/apiResponse';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Authentication token missing. Please sign in.', 401);
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 'Session invalid or expired. Please sign in again.', 401);
  }
}

// Security middleware aliases
export const authenticate = protect;
export const authenticateToken = protect;
