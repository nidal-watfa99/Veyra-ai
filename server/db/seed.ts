/**
 * Seed initial organization + admin user.
 * Admin password is read from ADMIN_PASSWORD env or generated and printed once.
 * NO hardcoded default password in production path.
 */
import {
  loadStore,
  saveStore,
  newId,
  hashPassword,
  type Organization,
  type User,
  type AIEmployeeRecord,
} from './store.js';

const DEMO_AVATARS = {
  elena: '/src/assets/images/avatar_agent_elena_1791747346311.jpg',
  julian: '/src/assets/images/avatar_agent_julian_1791747357075.jpg',
  aria: '/src/assets/images/avatar_agent_aria_1791747368525.jpg',
};

export async function seedIfEmpty(): Promise<{ seeded: boolean; adminEmail?: string; generatedPassword?: string }> {
  const data = loadStore();
  if (data.users.length > 0) {
    return { seeded: false };
  }

  const orgId = newId('org');
  const userId = newId('user');
  const now = new Date().toISOString();

  let password = process.env.ADMIN_PASSWORD;
  let generated: string | undefined;
  if (!password || password.length < 12) {
    generated = require('crypto').randomBytes(12).toString('base64url');
    password = generated;
  }

  const { hash, salt } = hashPassword(password);

  const org: Organization = {
    id: orgId,
    name: 'Veyra Demo Organization',
    slug: 'veyra-demo',
    createdAt: now,
    settings: { language: 'ar', theme: 'dark' },
  };

  const admin: User = {
    id: userId,
    organizationId: orgId,
    email: (process.env.ADMIN_EMAIL || 'admin@veyra.local').toLowerCase(),
    passwordHash: hash,
    salt,
    name: 'Veyra Administrator',
    role: 'owner',
    mustChangePassword: !!generated,
    createdAt: now,
    locale: 'ar',
    theme: 'dark',
  };

  const employees: AIEmployeeRecord[] = [
    {
      id: 'agent-elena',
      organizationId: orgId,
      name: 'Elena Vance',
      codeName: 'EVA-01',
      role: 'Executive Concierge & Inbound Triage',
      specialization: 'High-intent qualification, multi-channel inbound routing',
      avatar: DEMO_AVATARS.elena,
      status: 'active',
      activeWorkload: {
        activeConversations: 0,
        scheduledThisWeek: 0,
        qualifiedLeads: 0,
        avgLatency: '—',
        guardrailIntegrity: '100%',
      },
      channels: ['WhatsApp', 'Web Chat', 'SMS'],
      modelProfile: 'Veyra Cortex Dual-Triage v4.2',
      currentTask: 'Awaiting assignments',
      guardrailPolicies: [
        'Strict adherence to fiduciary language compliance',
        'No speculative ROI figures without certified disclaimers',
      ],
      recentMilestone: 'Seeded',
      activeSince: now,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    },
    {
      id: 'agent-julian',
      organizationId: orgId,
      name: 'Julian Croft',
      codeName: 'JCR-02',
      role: 'Director of Scheduling & Time Optimization',
      specialization: 'Executive calendar orchestration',
      avatar: DEMO_AVATARS.julian,
      status: 'idle',
      activeWorkload: {
        activeConversations: 0,
        scheduledThisWeek: 0,
        qualifiedLeads: 0,
        avgLatency: '—',
        guardrailIntegrity: '100%',
      },
      channels: ['Email', 'Web Chat', 'WhatsApp'],
      modelProfile: 'Veyra Scheduler v3.1',
      currentTask: 'Awaiting assignments',
      guardrailPolicies: ['Confirm all timezone conversions explicitly'],
      recentMilestone: 'Seeded',
      activeSince: now,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    },
    {
      id: 'agent-aria',
      organizationId: orgId,
      name: 'Aria Sterling',
      codeName: 'AST-03',
      role: 'Enterprise Lead Nurture & Conversion Strategist',
      specialization: 'Lead qualification and nurture sequences',
      avatar: DEMO_AVATARS.aria,
      status: 'idle',
      activeWorkload: {
        activeConversations: 0,
        scheduledThisWeek: 0,
        qualifiedLeads: 0,
        avgLatency: '—',
        guardrailIntegrity: '100%',
      },
      channels: ['Email', 'WhatsApp'],
      modelProfile: 'Veyra Nurture v2.8',
      currentTask: 'Awaiting assignments',
      guardrailPolicies: ['Never invent contact data'],
      recentMilestone: 'Seeded',
      activeSince: now,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    },
  ];

  data.organizations.push(org);
  data.users.push(admin);
  data.employees.push(...employees);
  await saveStore(data);

  console.log('[seed] Organization and admin created.');
  console.log('[seed] Admin email:', admin.email);
  if (generated) {
    console.log('[seed] Generated admin password (change on first login):', generated);
    console.log('[seed] Set ADMIN_PASSWORD in .env for a fixed password on next clean seed.');
  }

  return { seeded: true, adminEmail: admin.email, generatedPassword: generated };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  seedIfEmpty().then((r) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  });
}
