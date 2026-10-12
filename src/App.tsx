import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MetricsStrip } from './components/MetricsStrip';
import { AIPersonnelSection } from './components/AIPersonnelSection';
import { ConversationsSection } from './components/ConversationsSection';
import { AppointmentsSection } from './components/AppointmentsSection';
import { LeadPipelineSection } from './components/LeadPipelineSection';
import { KnowledgeVaultSection } from './components/KnowledgeVaultSection';
import { InspectorModal } from './components/InspectorModal';
import { DeployPersonnelModal } from './components/DeployPersonnelModal';
import { AIKeysModal } from './components/AIKeysModal';
import { SecurityDiagnosticModal } from './components/SecurityDiagnosticModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { 
  AI_EMPLOYEES, 
  CONVERSATIONS, 
  APPOINTMENTS, 
  LEADS 
} from './data/mockData';
import { 
  ActiveTab, 
  AIEmployee, 
  Conversation, 
  Appointment, 
  Lead 
} from './types';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Menu, 
  X,
  Compass,
  ArrowRight,
  KeyRound
} from 'lucide-react';

function VeyraApp() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('All Channels');
  
  // Data state
  const [employees, setEmployees] = useState<AIEmployee[]>(AI_EMPLOYEES);
  const [conversations] = useState<Conversation[]>(CONVERSATIONS);
  const [appointments] = useState<Appointment[]>(APPOINTMENTS);
  const [leads] = useState<Lead[]>(LEADS);

  // Modals & Inspection state
  const [inspectorItem, setInspectorItem] = useState<AIEmployee | Conversation | Appointment | Lead | null>(null);
  const [inspectorType, setInspectorType] = useState<'employee' | 'conversation' | 'appointment' | 'lead' | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isAIKeysModalOpen, setIsAIKeysModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [returnUrlParam, setReturnUrlParam] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check URL parameters for security / cookie check / return_url on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('return_url');
      if (returnUrl) {
        setReturnUrlParam(returnUrl);
      }
      if (params.get('cookie_check') === 'true' || params.get('cookie_check') === '1') {
        setIsSecurityModalOpen(true);
      }
    }
  }, []);

  // Inspector triggers
  const handleSelectEmployee = (agent: AIEmployee) => {
    setInspectorItem(agent);
    setInspectorType('employee');
  };

  const handleSelectConversation = (conv: Conversation) => {
    setInspectorItem(conv);
    setInspectorType('conversation');
  };

  const handleSelectAppointment = (apt: Appointment) => {
    setInspectorItem(apt);
    setInspectorType('appointment');
  };

  const handleSelectLead = (lead: Lead) => {
    setInspectorItem(lead);
    setInspectorType('lead');
  };

  const handleCloseInspector = () => {
    setInspectorItem(null);
    setInspectorType(null);
  };

  const handleDeployAgent = (newAgent: AIEmployee) => {
    setEmployees([newAgent, ...employees]);
  };

  return (
    <div className={`min-h-screen bg-[#0B0E14] text-[#E2E8F0] flex flex-col lg:flex-row antialiased selection:bg-[#0E766E]/40 selection:text-white ${isRTL ? 'font-sans' : ''}`}>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 h-14 px-4 bg-[#0F131C] border-b hairline-border flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#141B26] border hairline-border flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-emerald-400">V</span>
          </div>
          <span className="font-mono font-bold text-sm text-[#F1F5F9]">{t('appName')}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="p-1.5 rounded bg-[#141B26] text-emerald-400 border hairline-border cursor-pointer"
            title={t('cookieDiagnostics')}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAIKeysModalOpen(true)}
            className="p-1.5 rounded bg-[#141B26] text-[#C5A059] border hairline-border cursor-pointer"
            title={t('aiKeysAndModels')}
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#94A3B8] hover:text-white cursor-pointer"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop behind the mobile menu (tap outside to close) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar for Desktop & Mobile Overlay */}
      {/* On mobile the drawer is as tall as the viewport and scrolls internally, so the bottom items
          (diagnostics, language, session footer) are never cut off on short screens. */}
      <div className={`fixed lg:static inset-y-0 left-0 rtl:left-auto rtl:right-0 z-50 max-w-[85vw] overflow-y-auto overscroll-contain lg:max-w-none lg:overflow-visible transform lg:transform-none transition-transform duration-200 ${
        mobileMenuOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
      }`}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          unreadCount={conversations.filter(c => c.unread).length}
          upcomingAppointmentsCount={appointments.length}
          openAgentDeployModal={() => {
            setIsDeployModalOpen(true);
            setMobileMenuOpen(false);
          }}
          openAIKeysModal={() => {
            setIsAIKeysModalOpen(true);
            setMobileMenuOpen(false);
          }}
          openSecurityModal={() => {
            setIsSecurityModalOpen(true);
            setMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Strict Top Bar Contract Header */}
        <TopBar
          activeTab={activeTab}
          selectedChannelFilter={selectedChannelFilter}
          onChannelFilterChange={setSelectedChannelFilter}
          onOpenAuditModal={() => setActiveTab('vault')}
          onOpenDeployModal={() => setIsDeployModalOpen(true)}
          onOpenAIKeysModal={() => setIsAIKeysModalOpen(true)}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 p-5 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Executive Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b hairline-divider">
            <div>
              <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>{t('navWorkspaceOps')}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">{t('lockNominal')}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F1F5F9]">
                {t('pulseTitle')} <span className="font-serif italic font-normal text-[#C5A059]">{t('pulseItalic')}</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>{t('personnelOperational')}</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="font-mono text-[#64748B]">{t('zeroEscalations')}</span>
            </div>
          </div>

          {/* TAB: COMMAND OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Business Overview Metrics Strip */}
              <MetricsStrip />

              {/* AI Employee Status Section */}
              <AIPersonnelSection
                employees={employees}
                onSelectEmployee={handleSelectEmployee}
                compact={true}
              />

              {/* Split Layout: Live Dialogues & Upcoming Appointments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <ConversationsSection
                  conversations={conversations}
                  employees={employees}
                  onSelectConversation={handleSelectConversation}
                  selectedChannelFilter={selectedChannelFilter}
                />

                <AppointmentsSection
                  appointments={appointments}
                  employees={employees}
                  onSelectAppointment={handleSelectAppointment}
                />
              </div>

              {/* Lead Pipeline & High-Conviction Follow-ups */}
              <LeadPipelineSection
                leads={leads}
                employees={employees}
                onSelectLead={handleSelectLead}
              />
            </div>
          )}

          {/* TAB: EMPLOYEES */}
          {activeTab === 'employees' && (
            <div className="space-y-6">
              <AIPersonnelSection
                employees={employees}
                onSelectEmployee={handleSelectEmployee}
                compact={false}
              />
            </div>
          )}

          {/* TAB: CONVERSATIONS */}
          {activeTab === 'conversations' && (
            <div className="space-y-6">
              <ConversationsSection
                conversations={conversations}
                employees={employees}
                onSelectConversation={handleSelectConversation}
                selectedChannelFilter={selectedChannelFilter}
              />
            </div>
          )}

          {/* TAB: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <AppointmentsSection
                appointments={appointments}
                employees={employees}
                onSelectAppointment={handleSelectAppointment}
              />
            </div>
          )}

          {/* TAB: PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <LeadPipelineSection
                leads={leads}
                employees={employees}
                onSelectLead={handleSelectLead}
              />
            </div>
          )}

          {/* TAB: VAULT */}
          {activeTab === 'vault' && (
            <div className="space-y-6">
              <KnowledgeVaultSection />
            </div>
          )}
        </main>
      </div>

      {/* Inspector Modal for In-Depth Trace Inspection */}
      <InspectorModal
        item={inspectorItem}
        type={inspectorType}
        onClose={handleCloseInspector}
        employees={employees}
      />

      {/* Deploy Specialist Modal */}
      <DeployPersonnelModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={handleDeployAgent}
      />

      {/* AI Keys & Models Center Modal */}
      <AIKeysModal
        isOpen={isAIKeysModalOpen}
        onClose={() => setIsAIKeysModalOpen(false)}
      />

      {/* Security, Storage & Return URL Diagnostics Modal */}
      <SecurityDiagnosticModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        initialReturnUrl={returnUrlParam}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <VeyraApp />
    </LanguageProvider>
  );
}
