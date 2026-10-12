/**
 * Veyra AI — Durable JSON document store with atomic writes.
 * Production-oriented file-backed persistence (no native deps).
 * Schema versioned; multi-tenant isolation by organizationId.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.VEYRA_DATA_DIR || path.resolve(__dirname, '../../data/store');
const SCHEMA_VERSION = 1;

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  settings: Record<string, unknown>;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  passwordHash: string; // scrypt
  salt: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt?: string;
  locale?: string;
  theme?: string;
}

export interface Session {
  id: string;
  userId: string;
  organizationId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  ip?: string;
  userAgent?: string;
}

export interface AIEmployeeRecord {
  id: string;
  organizationId: string;
  name: string;
  codeName: string;
  role: string;
  specialization: string;
  avatar: string;
  status: string;
  activeWorkload: Record<string, unknown>;
  channels: string[];
  modelProfile: string;
  currentTask: string;
  guardrailPolicies: string[];
  recentMilestone: string;
  activeSince: string;
  instructions?: string;
  tools?: string[];
  knowledgeSourceIds?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ConversationRecord {
  id: string;
  organizationId: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  channel: string;
  status: string;
  assignedAgentId: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  priority: string;
  intent: string;
  turnCount: number;
  dialogueHistory: unknown[];
  appointmentLinked?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRecord {
  id: string;
  organizationId: string;
  clientName: string;
  clientCompany: string;
  clientRole: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  meetingType: string;
  assignedAgentId: string;
  channel: string;
  status: string;
  notes: string;
  prepDocumentGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadRecord {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  channel: string;
  stage: string;
  score: number;
  assignedAgentId: string;
  lastTouch: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeFile {
  id: string;
  organizationId: string;
  name: string;
  mimeType: string;
  size: number;
  storagePath: string;
  extractedText?: string;
  version: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderKeyRecord {
  id: string;
  organizationId: string;
  provider: string;
  encryptedKey: string; // AES-256-GCM
  iv: string;
  authTag: string;
  selectedModel: string;
  status: string;
  lastTestedAt?: string;
  lastLatencyMs?: number;
  lastError?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'success' | 'failure';
  details?: string;
  ip?: string;
  createdAt: string;
}

export interface FeedbackEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  email?: string;
  userId?: string;
  organizationId?: string;
  createdAt: string;
  status: 'received' | 'sent' | 'failed';
}

export interface TaskExecution {
  id: string;
  organizationId: string;
  agentId: string;
  taskType: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  inputSummary: string;
  resultSummary?: string;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  createdAt: string;
}

interface StoreData {
  schemaVersion: number;
  organizations: Organization[];
  users: User[];
  sessions: Session[];
  employees: AIEmployeeRecord[];
  conversations: ConversationRecord[];
  appointments: AppointmentRecord[];
  leads: LeadRecord[];
  knowledgeFiles: KnowledgeFile[];
  providerKeys: ProviderKeyRecord[];
  auditLog: AuditLogEntry[];
  feedback: FeedbackEntry[];
  taskExecutions: TaskExecution[];
  meta: { lastBackupAt?: string };
}

function emptyStore(): StoreData {
  return {
    schemaVersion: SCHEMA_VERSION,
    organizations: [],
    users: [],
    sessions: [],
    employees: [],
    conversations: [],
    appointments: [],
    leads: [],
    knowledgeFiles: [],
    providerKeys: [],
    auditLog: [],
    feedback: [],
    taskExecutions: [],
    meta: {},
  };
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const STORE_FILE = path.join(DATA_DIR, 'veyra.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

let cache: StoreData | null = null;
let writeLock = Promise.resolve();

export function getPaths() {
  return { DATA_DIR, STORE_FILE, BACKUP_DIR, UPLOADS_DIR };
}

export function loadStore(): StoreData {
  if (cache) return cache;
  ensureDir(DATA_DIR);
  ensureDir(BACKUP_DIR);
  ensureDir(UPLOADS_DIR);
  if (!fs.existsSync(STORE_FILE)) {
    cache = emptyStore();
    atomicWrite(STORE_FILE, JSON.stringify(cache, null, 2));
    return cache;
  }
  const raw = fs.readFileSync(STORE_FILE, 'utf8');
  const data = JSON.parse(raw) as StoreData;
  if (!data.schemaVersion) data.schemaVersion = SCHEMA_VERSION;
  cache = data;
  return cache;
}

function atomicWrite(filePath: string, content: string) {
  const tmp = filePath + '.tmp.' + process.pid;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

export async function saveStore(data: StoreData): Promise<void> {
  writeLock = writeLock.then(() => {
    ensureDir(DATA_DIR);
    atomicWrite(STORE_FILE, JSON.stringify(data, null, 2));
    cache = data;
  });
  await writeLock;
}

export async function mutateStore<T>(fn: (data: StoreData) => T): Promise<T> {
  const data = loadStore();
  const result = fn(data);
  await saveStore(data);
  return result;
}

export function backupStore(): string {
  const data = loadStore();
  ensureDir(BACKUP_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(BACKUP_DIR, `veyra-${stamp}.json`);
  fs.copyFileSync(STORE_FILE, dest);
  data.meta.lastBackupAt = new Date().toISOString();
  atomicWrite(STORE_FILE, JSON.stringify(data, null, 2));
  return dest;
}

export function newId(prefix = ''): string {
  return (prefix ? prefix + '_' : '') + crypto.randomUUID();
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, s, 64).toString('hex');
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const h = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(hash, 'hex'));
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** AES-256-GCM encrypt API keys. Key from ENCRYPTION_KEY env (32-byte hex) or derived. */
export function encryptSecret(plaintext: string): { encrypted: string; iv: string; authTag: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return {
    encrypted: enc.toString('hex'),
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
}

export function decryptSecret(encrypted: string, iv: string, authTag: string): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'hex')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}

function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey && /^[0-9a-fA-F]{64}$/.test(envKey)) {
    return Buffer.from(envKey, 'hex');
  }
  // Derive from JWT_SECRET if present (dev only — production must set ENCRYPTION_KEY)
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'veyra-dev-insecure-change-me';
  return crypto.scryptSync(secret, 'veyra-encryption-salt', 32);
}

export function maskKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

export { DATA_DIR, STORE_FILE, UPLOADS_DIR };
