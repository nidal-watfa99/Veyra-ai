/**
 * Session tokens using HMAC-SHA256 (no external jwt dependency required).
 */
import crypto from 'crypto';

const SECRET = () => process.env.JWT_SECRET || process.env.SESSION_SECRET || 'veyra-dev-insecure-change-me';

export interface TokenPayload {
  sub: string; // userId
  org: string;
  role: string;
  sid: string; // session id
  exp: number;
  iat: number;
}

function b64url(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString('base64url');
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, 'base64url');
}

export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, ttlSeconds = 86400 * 7): string {
  const iat = Math.floor(Date.now() / 1000);
  const full: TokenPayload = { ...payload, iat, exp: iat + ttlSeconds };
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(full));
  const sig = crypto.createHmac('sha256', SECRET()).update(`${header}.${body}`).digest();
  return `${header}.${body}.${b64url(sig)}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = crypto.createHmac('sha256', SECRET()).update(`${header}.${body}`).digest();
    const actual = fromB64url(sig);
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as TokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}
