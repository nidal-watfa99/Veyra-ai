import { Router, type Request, type Response } from 'express';
import {
  loadStore, saveStore, newId, hashPassword, verifyPassword, hashToken,
} from '../db/store.js';
import { signToken, generateSessionToken } from '../utils/crypto-auth.js';
import { writeAudit } from '../services/audit.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'invalid_input', message: 'Email and password required' });
      return;
    }
    const store = loadStore();
    const user = store.users.find((u) => u.email === email.toLowerCase().trim());
    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      logger.warn('login_failed', { email: email.toLowerCase() });
      res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password' });
      return;
    }

    const sessionId = newId('sess');
    const rawToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    store.sessions.push({
      id: sessionId,
      userId: user.id,
      organizationId: user.organizationId,
      tokenHash: hashToken(rawToken),
      expiresAt,
      createdAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']?.slice(0, 200),
    });
    user.lastLoginAt = new Date().toISOString();
    await saveStore(store);

    const jwt = signToken({
      sub: user.id,
      org: user.organizationId,
      role: user.role,
      sid: sessionId,
    });

    await writeAudit({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'auth.login',
      resource: 'session',
      resourceId: sessionId,
      result: 'success',
      ip: req.ip,
    });

    res.json({
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        mustChangePassword: user.mustChangePassword,
        locale: user.locale,
        theme: user.theme,
      },
      expiresAt,
    });
  } catch (e) {
    logger.error('login_error', { error: String(e) });
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const { verifyToken } = await import('../utils/crypto-auth.js');
      const payload = verifyToken(token);
      if (payload) {
        const store = loadStore();
        store.sessions = store.sessions.filter((s) => s.id !== payload.sid);
        await saveStore(store);
        await writeAudit({
          organizationId: payload.org,
          userId: payload.sub,
          action: 'auth.logout',
          resource: 'session',
          resourceId: payload.sid,
          result: 'success',
          ip: req.ip,
        });
      }
    }
    res.json({ success: true });
  } catch {
    res.json({ success: true });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'authentication_required' });
    return;
  }
  const { verifyToken } = await import('../utils/crypto-auth.js');
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'invalid_token' });
    return;
  }
  const store = loadStore();
  const user = store.users.find((u) => u.id === payload.sub);
  if (!user) {
    res.status(401).json({ error: 'user_not_found' });
    return;
  }
  const org = store.organizations.find((o) => o.id === user.organizationId);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      mustChangePassword: user.mustChangePassword,
      locale: user.locale,
      theme: user.theme,
    },
    organization: org ? { id: org.id, name: org.name, slug: org.slug } : null,
  });
});

export default router;
