import { Router, type Request, type Response } from 'express';
import { loadStore, saveStore, newId, mutateStore } from '../db/store.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { writeAudit } from '../services/audit.js';
import { logger } from '../utils/logger.js';

const router = Router();
router.use(requireAuth);

// Employees
router.get('/employees', (req: Request, res: Response) => {
  const store = loadStore();
  const items = store.employees.filter((e) => e.organizationId === req.auth!.organizationId);
  res.json({ items });
});

router.post('/employees', requireRole('owner', 'admin'), async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.name || !body.codeName || !body.role) {
      res.status(400).json({ error: 'invalid_input', message: 'name, codeName, role required' });
      return;
    }
    const now = new Date().toISOString();
    const record = {
      id: newId('agent'),
      organizationId: req.auth!.organizationId,
      name: String(body.name).slice(0, 120),
      codeName: String(body.codeName).slice(0, 40),
      role: String(body.role).slice(0, 120),
      specialization: String(body.specialization || '').slice(0, 300),
      avatar: String(body.avatar || ''),
      status: 'idle',
      activeWorkload: {
        activeConversations: 0,
        scheduledThisWeek: 0,
        qualifiedLeads: 0,
        avgLatency: '—',
        guardrailIntegrity: '100%',
      },
      channels: Array.isArray(body.channels) ? body.channels.slice(0, 10) : [],
      modelProfile: String(body.modelProfile || 'default'),
      currentTask: 'Awaiting assignments',
      guardrailPolicies: Array.isArray(body.guardrailPolicies) ? body.guardrailPolicies.slice(0, 20) : [],
      recentMilestone: '',
      activeSince: now,
      instructions: body.instructions ? String(body.instructions).slice(0, 5000) : undefined,
      tools: Array.isArray(body.tools) ? body.tools : undefined,
      knowledgeSourceIds: Array.isArray(body.knowledgeSourceIds) ? body.knowledgeSourceIds : undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: req.auth!.userId,
    };
    await mutateStore((data) => {
      data.employees.push(record);
    });
    await writeAudit({
      organizationId: req.auth!.organizationId,
      userId: req.auth!.userId,
      action: 'employee.create',
      resource: 'employee',
      resourceId: record.id,
      result: 'success',
      ip: req.ip,
    });
    res.status(201).json({ item: record });
  } catch (e) {
    logger.error('employee_create', { error: String(e) });
    res.status(500).json({ error: 'server_error' });
  }
});

router.patch('/employees/:id', requireRole('owner', 'admin'), async (req: Request, res: Response) => {
  const store = loadStore();
  const emp = store.employees.find(
    (e) => e.id === req.params.id && e.organizationId === req.auth!.organizationId
  );
  if (!emp) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const allowed = ['name', 'role', 'specialization', 'status', 'channels', 'modelProfile', 'currentTask', 'guardrailPolicies', 'instructions', 'tools', 'knowledgeSourceIds'];
  for (const k of allowed) {
    if (req.body[k] !== undefined) (emp as any)[k] = req.body[k];
  }
  emp.updatedAt = new Date().toISOString();
  await saveStore(store);
  await writeAudit({
    organizationId: req.auth!.organizationId,
    userId: req.auth!.userId,
    action: 'employee.update',
    resource: 'employee',
    resourceId: emp.id,
    result: 'success',
    ip: req.ip,
  });
  res.json({ item: emp });
});

router.delete('/employees/:id', requireRole('owner', 'admin'), async (req: Request, res: Response) => {
  const store = loadStore();
  const idx = store.employees.findIndex(
    (e) => e.id === req.params.id && e.organizationId === req.auth!.organizationId
  );
  if (idx < 0) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const [removed] = store.employees.splice(idx, 1);
  await saveStore(store);
  await writeAudit({
    organizationId: req.auth!.organizationId,
    userId: req.auth!.userId,
    action: 'employee.delete',
    resource: 'employee',
    resourceId: removed.id,
    result: 'success',
    ip: req.ip,
  });
  res.json({ success: true });
});

// Conversations, Appointments, Leads — org-scoped lists
router.get('/conversations', (req: Request, res: Response) => {
  const store = loadStore();
  const items = store.conversations.filter((c) => c.organizationId === req.auth!.organizationId);
  res.json({ items });
});

router.get('/appointments', (req: Request, res: Response) => {
  const store = loadStore();
  const items = store.appointments.filter((a) => a.organizationId === req.auth!.organizationId);
  res.json({ items });
});

router.get('/leads', (req: Request, res: Response) => {
  const store = loadStore();
  const items = store.leads.filter((l) => l.organizationId === req.auth!.organizationId);
  res.json({ items });
});

// Audit log (read-only for members; no delete for non-owner)
router.get('/audit', requireRole('owner', 'admin'), (req: Request, res: Response) => {
  const store = loadStore();
  const items = store.auditLog
    .filter((a) => a.organizationId === req.auth!.organizationId)
    .slice(-500)
    .reverse();
  res.json({ items });
});

export default router;
