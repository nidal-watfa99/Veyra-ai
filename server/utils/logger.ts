type Level = 'info' | 'warn' | 'error' | 'debug';

function redact(obj: unknown): unknown {
  if (obj == null) return obj;
  if (typeof obj === 'string') {
    // Redact things that look like API keys
    return obj.replace(/(sk-|AIza|gsk_|or-|key-)[a-zA-Z0-9_-]{10,}/g, '[REDACTED]');
  }
  if (Array.isArray(obj)) return obj.map(redact);
  if (typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (/password|secret|apikey|api_key|token|authorization/i.test(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return obj;
}

export function log(level: Level, message: string, meta?: unknown) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta !== undefined ? { meta: redact(meta) } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (m: string, meta?: unknown) => log('info', m, meta),
  warn: (m: string, meta?: unknown) => log('warn', m, meta),
  error: (m: string, meta?: unknown) => log('error', m, meta),
  debug: (m: string, meta?: unknown) => log('debug', m, meta),
};
