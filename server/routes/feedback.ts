import { Router, type Request, type Response } from 'express';
import { loadStore, saveStore, newId } from '../db/store.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Simple in-memory rate limit for feedback
const recent = new Map<string, number>();
const RATE_MS = 60_000;

router.post('/', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || 'unknown';
    const last = recent.get(ip) || 0;
    if (Date.now() - last < RATE_MS) {
      res.status(429).json({ error: 'rate_limited', message: 'Please wait before sending another message' });
      return;
    }

    const { type, title, description, email } = req.body || {};
    if (!type || !title || !description) {
      res.status(400).json({ error: 'invalid_input', message: 'type, title, description required' });
      return;
    }
    if (String(title).length > 200 || String(description).length > 5000) {
      res.status(400).json({ error: 'invalid_input', message: 'Title or description too long' });
      return;
    }
    // Reject likely secrets
    const blob = `${title} ${description}`;
    if (/(password|api[_-]?key|secret|token)\s*[:=]/i.test(blob)) {
      res.status(400).json({ error: 'sensitive_content', message: 'Do not include passwords or API keys in feedback' });
      return;
    }

    const entry = {
      id: newId('fb'),
      type: String(type).slice(0, 40),
      title: String(title).slice(0, 200),
      description: String(description).slice(0, 5000),
      email: email ? String(email).slice(0, 120) : undefined,
      createdAt: new Date().toISOString(),
      status: 'received' as const,
    };

    const store = loadStore();
    store.feedback.push(entry);
    await saveStore(store);
    recent.set(ip, Date.now());

    // Attempt email if SMTP configured
    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const developerEmail = process.env.DEVELOPER_EMAIL || 'nidalwatfa99@gmail.com';

    if (smtpConfigured) {
      // Placeholder: real SMTP would go here (nodemailer). Without the package we log and mark.
      logger.info('feedback_received_smtp_pending', { id: entry.id, to: developerEmail });
      entry.status = 'received';
      await saveStore(store);
      res.json({
        success: true,
        message: 'Feedback stored. Email delivery requires SMTP configuration on the server.',
        id: entry.id,
        mailtoFallback: `mailto:${developerEmail}?subject=${encodeURIComponent('[Veyra] ' + entry.title)}&body=${encodeURIComponent(entry.description)}`,
      });
    } else {
      logger.info('feedback_received', { id: entry.id });
      res.json({
        success: true,
        message: 'Feedback stored on server. Configure SMTP for email delivery, or use the mailto link.',
        id: entry.id,
        mailtoFallback: `mailto:${developerEmail}?subject=${encodeURIComponent('[Veyra Feedback] ' + entry.title)}&body=${encodeURIComponent(entry.description + (email ? '\n\nFrom: ' + email : ''))}`,
      });
    }
  } catch (e) {
    logger.error('feedback_error', { error: String(e) });
    res.status(500).json({ error: 'server_error' });
  }
});

export default router;
