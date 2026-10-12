import { loadStore, saveStore, newId, type AuditLogEntry } from '../db/store.js';

export async function writeAudit(params: {
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'success' | 'failure';
  details?: string;
  ip?: string;
}): Promise<void> {
  const data = loadStore();
  const entry: AuditLogEntry = {
    id: newId('audit'),
    organizationId: params.organizationId,
    userId: params.userId,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    result: params.result,
    details: params.details?.slice(0, 2000),
    ip: params.ip,
    createdAt: new Date().toISOString(),
  };
  data.auditLog.push(entry);
  // Keep last 10_000 entries
  if (data.auditLog.length > 10000) {
    data.auditLog = data.auditLog.slice(-10000);
  }
  await saveStore(data);
}
