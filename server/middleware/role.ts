import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { sendError } from '../utils/apiResponse';

export function authorize(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required to access this resource', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access forbidden: Role '${req.user.role}' lacks permissions for this endpoint. Required: ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
}

// Security middleware aliases
export const requireRole = authorize;
export const authorizeRoles = authorize;
