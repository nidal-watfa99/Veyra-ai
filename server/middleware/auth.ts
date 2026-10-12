import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto-auth.js';
import { loadStore, hashToken } from '../db/store.js';

export interface AuthUser {
  userId: string;
  organizationId: string;
  role: string;
  sessionId: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : (req.cookies?.veyra_session as string | undefined);

  if (!token) {
    res.status(401).json({ error: 'authentication_required', message: 'Login required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'invalid_token', message: 'Session expired or invalid' });
    return;
  }

  const store = loadStore();
  const session = store.sessions.find((s) => s.id === payload.sid && s.userId === payload.sub);
  if (!session) {
    res.status(401).json({ error: 'session_revoked', message: 'Session no longer valid' });
    return;
  }
  if (new Date(session.expiresAt) < new Date()) {
    res.status(401).json({ error: 'session_expired', message: 'Session expired' });
    return;
  }

  const user = store.users.find((u) => u.id === payload.sub);
  if (!user || user.organizationId !== payload.org) {
    res.status(401).json({ error: 'user_not_found', message: 'User not found' });
    return;
  }

  req.auth = {
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    sessionId: session.id,
    email: user.email,
    name: user.name,
  };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'authentication_required' });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'forbidden', message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

/** Ensure resource belongs to the authenticated organization */
export function orgScope(organizationId: string | undefined, authOrg: string): boolean {
  return !!organizationId && organizationId === authOrg;
}
