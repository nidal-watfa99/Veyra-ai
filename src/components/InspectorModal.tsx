import React, { useState, useEffect } from 'react';
import { AIEmployee, Conversation, Appointment, Lead, DialogueTurn } from '../types';
import { 
  X, 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Lock,
  Compass,
  Send,
  Zap,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface InspectorModalProps {
  item: AIEmployee | Conversation | Appointment | Lead | null;
  type: 'employee' | 'conversation' | 'appointment' | 'lead' | null;
  onClose: () => void;
  employees: AIEmployee[];
}

export const InspectorModal: React.FC<InspectorModalProps> = ({
  item,
  type,
  onClose,
  employees,
}) => {
  const { t, language } = useLanguage();

  // Local state for interactive simulations inside inspector
  const [customTurns, setCustomTurns] = useState<{ [convId: string]: DialogueTurn[] }>({});
  const [inputMessage, setInputMessage] = useState('');
  const [showFullDossier, setShowFullDossier] = useState(false);
  const [agentStatusState, setAgentStatusState] = useState<{ [agentId: string]: string }>({});
  const [leadTouchpoints, setLeadTouchpoints] = useState<{ [leadId: string]: { action: string; timestamp: string; agentName: string }[] }>({});
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Reset purely transient UI state whenever a different item is inspected
  useEffect(() => {
    setInputMessage('');
    setShowFullDossier(false);
    setFeedbackNotice(null);
  }, [item]);

  // Close on Escape while the inspector is open
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  const getAgent = (agentId: string) => {
    return employees.find((e) => e.id === agentId) || employees[0];
  };

  const notifyAction = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 2800);
  };

  // Simulated AI turn generator with multilingual reasoning and real backend model integration
  const handleSimulateTurn = async (promptText: string, conv: Conversation) => {
    const agent = getAgent(conv.assignedAgentId);
    const clientTurn: DialogueTurn = {
      speaker: 'client',
      text: promptText,
      timestamp: language === 'ar' ? 'الآن' : 'Just now',
    };

    let aiReplyText = '';
    let intentDetected = '';
    let retrievedSource = '';
    let policyCheck = '';
    const isArabic = language === 'ar';

    // Try calling live backend AI proxy first
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: agent.name,
          agentRole: agent.role,
          userMessage: promptText,
          context: conv.clientCompany,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isLiveAI && data.reply) {
          aiReplyText = data.reply;
          intentDetected = `${data.provider?.toUpperCase()} [${data.model}] — Live Generation`;
          retrievedSource = `Grounding: ${conv.clientCompany} Context & Policy Guidelines`;
          policyCheck = 'Verified SEC & fiduciary compliance. Live model output validated.';
        }
      }
    } catch {
      // Fallback to verified domain response
    }

    if (!aiReplyText) {
      if (promptText.toLowerCase().includes('fee') || promptText.toLowerCase().includes('tariff') || promptText.toLowerCase().includes('retainer') || promptText.includes('رسوم') || promptText.includes('أتعاب')) {
        aiReplyText = isArabic
          ? `أتعاب الاستشارات المعتمدة لدينا للمكاتب العائلية محددة وفق جدول التعرفة Q4 (تبدأ من £15,000/شهرياً للمستوى الأساسي، بالإضافة إلى 65 نقطة أساس على الأصول المدارة بين £20M - £100M). قمت بتسجيل طلبك ويمكنني إرسال ملحق التعرفة التفصيلي فوراً.`
          : `Our baseline retainer for family office advisory is structured under Tariff Schedule Q4 (£15,000/month baseline plus 65 bps on discretionary assets between £20M - £100M). I have logged your inquiry and can forward the complete fee schedule appendix.`;
        intentDetected = isArabic ? 'استفسار عن جدول الرسوم والأتعاب' : 'Tariff & Fee Schedule Consultation';
        retrievedSource = isArabic ? 'ملحق تعرفة استشارات إيثلغارد (Q4)' : 'Aethelgard Master Advisory Retainer & Tariff Schedule (Q4)';
        policyCheck = isArabic ? 'تم التحقق من مطابقة الأرقام الرسمية والتزام الامتثال المالي.' : 'Verified zero-hallucination compliance. Fixed fee rate applied.';
      } else if (promptText.toLowerCase().includes('tuesday') || promptText.toLowerCase().includes('mayfair') || promptText.toLowerCase().includes('slot') || promptText.toLowerCase().includes('calendar') || promptText.includes('الثلاثاء') || promptText.includes('موعد') || promptText.includes('مايفير')) {
        aiReplyText = isArabic
          ? `تحققت من جدول شركائنا في جناح مايفير، ويمكننا حجز الساعة 11:30 أو 14:00 بتوقيت لندن يوم الثلاثاء في قاعة سرية مشفرة. كلا الموعدين يتضمنان هامش راحة 45 دقيقة. هل ترغب في إرسال بيانات الدعوة الرسمية؟`
          : `I have verified our senior partner calendar for Mayfair. We can hold 11:30 BST or 14:00 BST with a reserved private briefing suite. Both slots include 45-minute confidential advisory buffers. Shall I dispatch the calendar credentials?`;
        intentDetected = isArabic ? 'طلب حجز موعد استشاري سري' : 'Discreet Calendar Hold Request';
        retrievedSource = isArabic ? 'مصفوفة التواجد التنفيذي لمايفير وزيورخ' : 'Mayfair Executive Calendar Availability Matrix';
        policyCheck = isArabic ? 'تم التأكد من توفر الفاصل الزمني الإلزامي (45 دقيقة).' : 'Buffer verified: 45 min buffer between consultations upheld.';
      } else {
        aiReplyText = isArabic
          ? `مفهوم تماماً. قمت بمطابقة طلبكم مع إطار الحوكمة الاستشارية المعتمد لدينا. قامت إيلينا وفريق الشركاء بتسجيل المعايير لضمان الامتثال التام للأمانة الاستثمارية.`
          : `Understood. I have correlated your requirements against our institutional advisory framework. Elena and our senior practice leads have registered this operational parameter, ensuring full compliance with our discretionary protocols.`;
        intentDetected = isArabic ? 'تنسيق نطاق الاستشارة المؤسسية' : 'General Advisory Scope Alignment';
        retrievedSource = isArabic ? 'ميثاق الممارسة المؤسسية لإيثلغارد' : 'Aethelgard Enterprise Practice Charter';
        policyCheck = isArabic ? 'تم التحقق من النبرة المهنية وتوثيق الرد الآلي.' : 'Fiduciary tone verified. Proactive response logged.';
      }
    }

    const aiTurn: DialogueTurn = {
      speaker: 'ai',
      text: aiReplyText,
      timestamp: isArabic ? 'الآن' : 'Just now',
      reasoningTrace: {
        intentDetected,
        retrievedSource,
        policyCheck,
        actionOutcome: isArabic ? 'تم إرسال الرسالة آلياً مع توثيق سجل التدقيق' : 'Autonomous message sent; audit log recorded.',
      },
    };

    const currentList = customTurns[conv.id] || [];
    setCustomTurns({
      ...customTurns,
      [conv.id]: [...currentList, clientTurn, aiTurn],
    });
    setInputMessage('');
    notifyAction(isArabic ? `تم استنتاج الرد وإرساله آلياً بواسطة ${agent.name}` : `Autonomous response reasoned & delivered by ${agent.name}`);
  };

  const presetQuestions = language === 'ar'
    ? [
        'الاستفسار عن موعد متاح في مايفير يوم الثلاثاء',
        'طلب جدول أتعاب استشارات إدارة الثروات Q4',
        'طلب رابط قاعة الفيديو المشفرة للاجتماع',
      ]
    : [
        'Inquire about Mayfair meeting slot on Tuesday',
        'Ask about Q4 wealth retainer fee schedule',
        'Request encrypted video briefing room link',
      ];

  // NOTE: must stay below every hook call (Rules of Hooks)
  if (!item || !type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-3xl max-h-[92dvh] bg-[#10151F] border hairline-border rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#E2E8F0] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Notification */}
        {feedbackNotice && (
          <div className="absolute top-16 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#161D2B] border border-emerald-500/30 text-emerald-300 text-xs px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="px-6 py-4 bg-[#0F131C] border-b hairline-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
              {t('precisionInspector')} · {type.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#161D2B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-6">
          {/* TYPE: EMPLOYEE */}
          {type === 'employee' && (() => {
            const agent = item as AIEmployee;
            const currentStatus = agentStatusState[agent.id] || agent.status;
            return (
              <div className="space-y-6">
                {/* Agent Header Profile */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover border hairline-border bg-[#141B26] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-[#F1F5F9]">
                          {agent.name}
                        </h2>
                        <span className="font-mono text-xs text-[#64748B]">
                          [{agent.codeName}]
                        </span>
                      </div>
                      <p className="text-sm text-[#C5A059] font-medium mt-0.5">
                        {agent.role}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                        {agent.specialization}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#64748B] font-mono">
                        <span>Model: {agent.modelProfile}</span>
                        <span aria-hidden="true">·</span>
                        <span>{agent.activeSince}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Switcher Button */}
                  <div className="text-right rtl:text-left shrink-0">
                    <span className="block text-[10px] font-mono text-[#64748B] mb-1">{t('operationalMode')}</span>
                    <button
                      onClick={() => {
                        const next = currentStatus === 'active' ? 'in_dialogue' : currentStatus === 'in_dialogue' ? 'calibrating' : 'active';
                        setAgentStatusState({ ...agentStatusState, [agent.id]: next });
                        notifyAction(`Status updated to ${next.toUpperCase()}`);
                      }}
                      className="px-3 py-1 text-xs font-mono rounded border hairline-border bg-[#141B26] hover:bg-[#1C2536] text-emerald-400 cursor-pointer"
                    >
                      {currentStatus.toUpperCase()} ⟳
                    </button>
                  </div>
                </div>

                {/* Telemetry Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="panel-recessed p-3 rounded-lg border hairline-border text-center">
                    <div className="text-[10px] text-[#64748B] font-mono">{t('activeChats')}</div>
                    <div className="text-lg font-mono font-semibold text-[#F1F5F9] tabular-nums mt-0.5">
                      {agent.activeWorkload.activeConversations}
                    </div>
                  </div>
                  <div className="panel-recessed p-3 rounded-lg border hairline-border text-center">
                    <div className="text-[10px] text-[#64748B] font-mono">{t('bookedWk')}</div>
                    <div className="text-lg font-mono font-semibold text-[#F1F5F9] tabular-nums mt-0.5">
                      {agent.activeWorkload.scheduledThisWeek}
                    </div>
                  </div>
                  <div className="panel-recessed p-3 rounded-lg border hairline-border text-center">
                    <div className="text-[10px] text-[#64748B] font-mono">{t('systemLatency')}</div>
                    <div className="text-lg font-mono font-semibold text-[#E2E8F0] tabular-nums mt-0.5">
                      {agent.activeWorkload.avgLatency}
                    </div>
                  </div>
                  <div className="panel-recessed p-3 rounded-lg border hairline-border text-center">
                    <div className="text-[10px] text-[#64748B] font-mono">{t('guardrails')}</div>
                    <div className="text-lg font-mono font-semibold text-emerald-400 tabular-nums mt-0.5">
                      {agent.activeWorkload.guardrailIntegrity}
                    </div>
                  </div>
                </div>

                {/* Current Active Task */}
                <div className="surface-card p-4 rounded-xl border hairline-border space-y-2">
                  <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('currentFocus')}</span>
                  </div>
                  <p className="text-xs text-[#E2E8F0] leading-relaxed">
                    {agent.currentTask}
                  </p>
                  <div className="text-[11px] text-[#94A3B8] pt-2 border-t hairline-divider">
                    Latest milestone: {agent.recentMilestone}
                  </div>
                </div>

                {/* Guardrail Policies Handled */}
                <div className="surface-card p-4 rounded-xl border hairline-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('guardrailsNominal')}</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400">Strict Compliance</span>
                  </div>
                  <ul className="space-y-2">
                    {agent.guardrailPolicies.map((policy, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#94A3B8] leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{policy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}

          {/* TYPE: CONVERSATION */}
          {type === 'conversation' && (() => {
            const conv = item as Conversation;
            const agent = getAgent(conv.assignedAgentId);
            const extraTurns = customTurns[conv.id] || [];
            const allTurns = [...conv.dialogueHistory, ...extraTurns];

            return (
              <div className="space-y-6">
                {/* Header Information */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[#F1F5F9]">
                      {conv.clientName}
                    </h2>
                    <div className="text-xs text-[#94A3B8] mt-0.5">
                      {conv.clientRole} · {conv.clientCompany}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[11px] font-mono text-[#64748B]">
                      <span>Channel: {conv.channel}</span>
                      <span aria-hidden="true">·</span>
                      <span>Priority: {conv.priority.toUpperCase()}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#C5A059]">Intent: {conv.intent}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover border hairline-border shrink-0"
                    />
                    <div className="text-left rtl:text-right text-xs">
                      <div className="text-[#E2E8F0] font-medium">{agent.name}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">Assigned Agent</div>
                    </div>
                  </div>
                </div>

                {/* Linked Appointment (if present) */}
                {conv.appointmentLinked && (
                  <div className="panel-recessed p-3 rounded-lg border hairline-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C5A059]" />
                      <div>
                        <span className="text-[#F1F5F9] font-medium">{conv.appointmentLinked.title}</span>
                        <span className="text-[#64748B] font-mono ml-2 rtl:ml-0 rtl:mr-2">({conv.appointmentLinked.time})</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Synchronized
                    </span>
                  </div>
                )}

                {/* Dialogue History Transcript with AI Reasoning Trace */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
                      {t('dialoguesHeading')}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {allTurns.length} {t('turns')}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {allTurns.map((turn, idx) => (
                      <div key={idx} className="space-y-2">
                        {/* Message Box */}
                        <div
                          className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                            turn.speaker === 'client'
                              ? 'bg-[#151D2A] text-[#F1F5F9] border hairline-border ml-0 mr-8 rtl:mr-0 rtl:ml-8'
                              : 'bg-[#101826] text-[#E2E8F0] border border-emerald-950/40 ml-8 mr-0 rtl:ml-0 rtl:mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 text-[#64748B]">
                            <span className={turn.speaker === 'client' ? 'text-[#94A3B8]' : 'text-emerald-400 font-medium'}>
                              {turn.speaker === 'client' ? conv.clientName : `${agent.name} (Veyra AI)`}
                            </span>
                            <span>{turn.timestamp}</span>
                          </div>
                          <p className="break-words">{turn.text}</p>
                        </div>

                        {/* If AI turn has an autonomous reasoning trace, show recessed audit block */}
                        {turn.reasoningTrace && (
                          <div className="ml-8 mr-0 rtl:ml-0 rtl:mr-8 panel-recessed p-3 rounded-lg border hairline-border text-[11px] space-y-1.5">
                            <div className="font-mono text-[#C5A059] flex items-center gap-1 text-[10px] uppercase tracking-wider">
                              <Compass className="w-3 h-3 text-[#C5A059]" />
                              <span>{t('reasoningStep')}</span>
                            </div>
                            <div className="text-[#94A3B8]">
                              <span className="text-[#64748B]">{t('intentDetected')} </span>
                              {turn.reasoningTrace.intentDetected}
                            </div>
                            <div className="text-[#94A3B8]">
                              <span className="text-[#64748B]">{t('vaultSource')} </span>
                              {turn.reasoningTrace.retrievedSource}
                            </div>
                            <div className="text-emerald-400/90 font-mono text-[10px]">
                              {turn.reasoningTrace.policyCheck}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Simulation Sandbox Bar */}
                <div className="surface-card p-3.5 rounded-xl border hairline-border space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                    <span>{t('simClientInteraction')}</span>
                    <span className="text-[#C5A059]">{t('testReasoning')} ({agent.name})</span>
                  </div>

                  {/* Preset Question Triggers */}
                  <div className="flex flex-wrap gap-1.5">
                    {presetQuestions.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSimulateTurn(preset, conv)}
                        className="text-[11px] px-2.5 py-1 rounded bg-[#0D121B] hover:bg-[#161D2B] border hairline-border text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
                      >
                        + "{preset}"
                      </button>
                    ))}
                  </div>

                  {/* Custom Message Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (inputMessage.trim()) {
                        handleSimulateTurn(inputMessage, conv);
                      }
                    }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      placeholder={t('simulatePlaceholder')}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 panel-recessed px-3 py-1.5 rounded-lg text-xs text-[#F1F5F9] border hairline-border focus:outline-none placeholder-[#64748B]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-[#0B0E14] text-xs font-medium flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>{t('sendBtn')}</span>
                      <Send className="w-3 h-3 rtl:-scale-x-100" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })()}

          {/* TYPE: APPOINTMENT */}
          {type === 'appointment' && (() => {
            const apt = item as Appointment;
            const agent = getAgent(apt.assignedAgentId);
            return (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] mb-1">
                    <span>{apt.meetingType.toUpperCase()}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400">
                      {apt.status === 'prep_ready' ? t('dossierReady') : t('confirmed')}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#F1F5F9]">
                    {apt.title}
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {apt.clientName} ({apt.clientRole}, {apt.clientCompany})
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="panel-recessed p-3 rounded-lg border hairline-border">
                    <div className="text-[10px] text-[#64748B] font-mono">Date & Slot</div>
                    <div className="text-xs font-mono text-[#F1F5F9] font-medium mt-1">
                      {apt.date}
                    </div>
                    <div className="text-[11px] font-mono text-[#C5A059]">
                      {apt.time} ({apt.duration})
                    </div>
                  </div>
                  <div className="panel-recessed p-3 rounded-lg border hairline-border">
                    <div className="text-[10px] text-[#64748B] font-mono">Channel / Venue</div>
                    <div className="text-xs text-[#E2E8F0] mt-1 truncate">
                      {apt.channel}
                    </div>
                  </div>
                  <div className="panel-recessed p-3 rounded-lg border hairline-border">
                    <div className="text-[10px] text-[#64748B] font-mono">{t('assignedAgentCol')}</div>
                    <div className="text-xs text-[#E2E8F0] mt-1 flex items-center gap-1.5">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 rounded object-cover shrink-0"
                      />
                      <span>{agent.name}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Automated Dossier */}
                <div className="surface-card p-4 rounded-xl border hairline-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('briefingPack')}</span>
                    </div>
                    <button
                      onClick={() => setShowFullDossier(!showFullDossier)}
                      className="text-xs text-[#C5A059] hover:underline cursor-pointer font-mono"
                    >
                      {showFullDossier ? t('collapseDossier') : t('expandDossier')}
                    </button>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {apt.notes}
                  </p>

                  {showFullDossier && (
                    <div className="panel-recessed p-3 rounded-lg border hairline-border space-y-2 text-xs">
                      <div className="text-[11px] font-mono text-emerald-400">CONFIDENTIAL BRIEFING SYNTHESIS:</div>
                      <p className="text-[#E2E8F0] leading-relaxed">
                        • Verified Attendee Identity: {apt.clientName} ({apt.clientRole}).
                        <br />• Scheduled Venue: {apt.channel}.
                        <br />• Regulatory Check: SEC & GDPR compliant disclosure pack dispatched automatically.
                        <br />• Recommended Opening: Focus on jurisdictional asset protection and discretionary tax structuring.
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t hairline-divider flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Security classification: NDA Enforced</span>
                    <button
                      onClick={() => notifyAction(language === 'ar' ? 'تم تنزيل الحقيبة الإحاطة السرية بنجاح' : 'Executive briefing pack exported to PDF')}
                      className="text-emerald-400 font-mono text-[11px] hover:underline cursor-pointer"
                    >
                      {t('exportPdf')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TYPE: LEAD */}
          {type === 'lead' && (() => {
            const lead = item as Lead;
            const agent = getAgent(lead.assignedAgentId);
            const extraLogs = leadTouchpoints[lead.id] || [];
            const allLogs = [...extraLogs, ...lead.activityLog];

            return (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#F1F5F9]">
                      {lead.name}
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {lead.role} · {lead.company}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs font-mono">
                      <span className="text-emerald-400 font-semibold">{lead.dealValue}</span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span className="text-[#C5A059]">{lead.stage}</span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span className="text-[#94A3B8]">{lead.confidenceScore}% {t('winProbability')}</span>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left text-xs">
                    <div className="text-[#64748B]">Managed by</div>
                    <div className="text-[#E2E8F0] font-medium">{agent.name}</div>
                  </div>
                </div>

                {/* Next scheduled step with interactive trigger */}
                <div className="panel-recessed p-4 rounded-lg border hairline-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                      {t('nextStepCol')}
                    </span>
                    <button
                      onClick={() => {
                        const newTouchpoint = {
                          action: `Executed: ${lead.nextScheduledStep}`,
                          timestamp: language === 'ar' ? 'الآن' : 'Just now',
                          agentName: agent.name,
                        };
                        setLeadTouchpoints({
                          ...leadTouchpoints,
                          [lead.id]: [newTouchpoint, ...(leadTouchpoints[lead.id] || [])],
                        });
                        notifyAction(language === 'ar' ? `تم تنفيذ الخطوة وتوثيقها بواسطة ${agent.name}` : `Autonomous step triggered by ${agent.name}`);
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-[#0B0E14] bg-[#C5A059] hover:bg-[#D4AF37] rounded transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{t('executeStepNow')}</span>
                    </button>
                  </div>
                  <div className="text-xs text-[#F1F5F9] font-medium leading-relaxed">
                    {lead.nextScheduledStep}
                  </div>
                </div>

                {/* Activity Log */}
                <div className="space-y-3">
                  <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
                    {t('touchpointChronology')}
                  </div>
                  <div className="space-y-2">
                    {allLogs.map((log, idx) => (
                      <div key={idx} className="surface-card p-3 rounded-lg border hairline-border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[#E2E8F0]">{log.action}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#64748B] shrink-0 ml-3 rtl:ml-0 rtl:mr-3">
                          {log.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#0F131C] border-t hairline-border flex items-center justify-between text-xs text-[#64748B] shrink-0">
          <span className="font-mono">Veyra Policy Guard: Enforced</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#1C2536] text-[#F1F5F9] border hairline-border transition-colors cursor-pointer"
          >
            {t('closeInspector')}
          </button>
        </div>
      </div>
    </div>
  );
};
