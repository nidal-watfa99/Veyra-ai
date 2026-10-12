export type AgentStatus = 'active' | 'in_dialogue' | 'idle' | 'calibrating';

export type Channel = 'WhatsApp' | 'Web Chat' | 'Email' | 'SMS';

export interface AIEmployee {
  id: string;
  name: string;
  codeName: string;
  role: string;
  specialization: string;
  avatar: string;
  status: AgentStatus;
  activeWorkload: {
    activeConversations: number;
    scheduledThisWeek: number;
    qualifiedLeads: number;
    avgLatency: string;
    guardrailIntegrity: string;
  };
  channels: Channel[];
  modelProfile: string;
  currentTask: string;
  guardrailPolicies: string[];
  recentMilestone: string;
  activeSince: string;
}

export interface DialogueTurn {
  speaker: 'client' | 'ai';
  text: string;
  timestamp: string;
  reasoningTrace?: {
    intentDetected?: string;
    retrievedSource?: string;
    policyCheck?: string;
    actionOutcome?: string;
  };
}

export interface Conversation {
  id: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  channel: Channel;
  status: 'active' | 'scheduled' | 'escalated' | 'resolved';
  assignedAgentId: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  priority: 'standard' | 'high' | 'urgent';
  intent: string;
  turnCount: number;
  dialogueHistory: DialogueTurn[];
  appointmentLinked?: {
    id: string;
    title: string;
    time: string;
    status: 'confirmed' | 'rescheduled' | 'prep_ready';
  };
}

export interface Appointment {
  id: string;
  clientName: string;
  clientCompany: string;
  clientRole: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  meetingType: 'Strategic Advisory' | 'Platform Demo' | 'Discovery Call' | 'Commercial Review';
  assignedAgentId: string;
  channel: string;
  status: 'confirmed' | 'rescheduled' | 'prep_ready';
  notes: string;
  prepDocumentGenerated: boolean;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  dealValue: string;
  stage: 'Discovery Qualified' | 'Demo Scheduled' | 'Proposal Review' | 'Autonomous Follow-up' | 'Won';
  assignedAgentId: string;
  confidenceScore: number;
  lastTouchpoint: string;
  nextScheduledStep: string;
  channel: Channel;
  activityLog: {
    action: string;
    timestamp: string;
    agentName: string;
  }[];
}

export type ActiveTab = 'overview' | 'employees' | 'conversations' | 'appointments' | 'pipeline' | 'vault' | 'aikeys';
