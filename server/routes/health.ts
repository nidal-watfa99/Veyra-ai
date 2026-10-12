import { Router, type Request, type Response } from 'express';
import { loadStore, getPaths } from '../db/store.js';
import fs from 'fs';

const router = Router();
const startedAt = Date.now();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'veyra-ai',
    version: process.env.npm_package_version || '1.0.0',
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (_req: Request, res: Response) => {
  try {
    const paths = getPaths();
    const storeReadable = fs.existsSync(paths.STORE_FILE) || true;
    const data = loadStore();
    const checks = {
      store: storeReadable,
      organizations: data.organizations.length >= 0,
      encryptionKey: !!(process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || process.env.SESSION_SECRET),
      jwtSecret: !!(process.env.JWT_SECRET || process.env.SESSION_SECRET),
    };
    const ready = checks.store;
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not_ready',
      checks,
      warnings: [
        !checks.encryptionKey ? 'ENCRYPTION_KEY or JWT_SECRET not set — using insecure default (dev only)' : null,
        process.env.NODE_ENV === 'production' && !(process.env.JWT_SECRET || process.env.SESSION_SECRET)
          ? 'CRITICAL: set JWT_SECRET in production'
          : null,
      ].filter(Boolean),
    });
  } catch (e) {
    res.status(503).json({ status: 'not_ready', error: String(e) });
  }
});

export default router;
