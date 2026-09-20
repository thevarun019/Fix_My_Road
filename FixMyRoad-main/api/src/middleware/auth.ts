import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header missing or invalid format'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      id: string;
      phone: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token'
    });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
        id: string;
        phone: string;
        role: string;
      };
      req.user = decoded;
    } catch {
      // ignore optional auth errors
    }
  }
  next();
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // If user wasn't decoded yet, attempt decoding from header
    if (!req.user && req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
          id: string;
          phone: string;
          role: string;
        };
        req.user = decoded;
      } catch {
        // invalid token
      }
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Please log in with an authorized account.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Forbidden: Requires one of [${roles.join(', ')}] permissions. Current role: ${req.user.role}` });
    }
    next();
  };
}
