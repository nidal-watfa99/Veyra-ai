/**
 * Veyra AI — Production server entry
 * Express API + Vite middleware (dev) / static (prod)
 * Durable store, auth, org isolation, provider key encryption, health checks
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Fail fast on missing critical secrets in production
if (isProd) {
  if (!process.env.JWT_SECRET && !process.env.SESSION_SECRET) {
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      message: 'FATAL: JWT_SECRET or SESSION_SECRET must be set in production',
    }));
    process.exit(1);
  }
  if (!process.env.ENCRYPTION_KEY) {
    console.warn(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'warn',
      message: 'ENCRYPTION_KEY not set; deriving from JWT_SECRET (set a dedicated 64-char hex key in production)',
    }));
  }
}

async function main() {
  const app = express();

  // Security headers (minimal without helmet package)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    if (isProd) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // CORS
  const allowedOrigin = process.env.CORS_ORIGIN || process.env.APP_PUBLIC_URL || true;
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigin === true) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else if (typeof allowedOrigin === 'string' && origin === allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  // Simple rate limit for auth endpoints
  const authHits = new Map<string, number[]>();
  app.use('/api/auth/login', (req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const window = 15 * 60 * 1000;
    const hits = (authHits.get(ip) || []).filter((t) => now - t < window);
    if (hits.length >= 20) {
      res.status(429).json({ error: 'rate_limited', message: 'Too many login attempts' });
      return;
    }
    hits.push(now);
    authHits.set(ip, hits);
    next();
  });

  // Seed DB if empty
  const { seedIfEmpty } = await import('./server/db/seed.js');
  const seedResult = await seedIfEmpty();
  if (seedResult.seeded) {
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      message: 'Database seeded',
      meta: { adminEmail: seedResult.adminEmail, hasGeneratedPassword: !!seedResult.generatedPassword },
    }));
  }

  // Routes
  const healthRoutes = (await import('./server/routes/health.js')).default;
  const authRoutes = (await import('./server/routes/auth.js')).default;
  const dataRoutes = (await import('./server/routes/data.js')).default;
  const providerRoutes = (await import('./server/routes/providers.js')).default;
  const feedbackRoutes = (await import('./server/routes/feedback.js')).default;

  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/data', dataRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/feedback', feedbackRoutes);

  // Source ZIP download (if present)
  app.get('/veyra-ai-source.zip', (_req, res) => {
    const zipPath = path.join(__dirname, 'public', 'veyra-ai-source.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'veyra-ai-source.zip');
    } else {
      res.status(404).json({ error: 'not_found', message: 'Source archive not packaged in this build' });
    }
  });

  // Vite / static
  if (!isProd) {
    const { createServer as createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(__dirname, 'dist');
    if (fs.existsSync(dist)) {
      app.use(express.static(dist, { maxAge: '1h', index: false }));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(dist, 'index.html'));
      });
    } else {
      console.warn(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        message: 'dist/ not found — run npm run build before production start',
      }));
    }
  }

  // Central error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      message: 'unhandled_error',
      meta: { error: String(err?.message || err) },
    }));
    res.status(500).json({ error: 'server_error', message: 'An unexpected error occurred' });
  });

  const server = app.listen(PORT, () => {
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      message: `Veyra AI listening on :${PORT}`,
      meta: { env: NODE_ENV, port: PORT },
    }));
  });

  const shutdown = (signal: string) => {
    console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'info', message: `Shutting down (${signal})` }));
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((e) => {
  console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'error', message: 'startup_failed', meta: { error: String(e) } }));
  process.exit(1);
});
