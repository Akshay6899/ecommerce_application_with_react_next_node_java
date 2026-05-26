import { Request, Response, NextFunction } from 'express';
import { verify } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = verify(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
