export type Language = 'en' | 'ar' | 'fr';

export interface Translations {
  // Brand & Meta
  appName: string;
  appSubtitle: string;
  deploySpecialist: string;
  downloadZip: string;
  guardrailsNominal: string;
  workspaceTitle: string;
  workspaceLocation: string;
  privateTier: string;
  managingDirector: string;
  fiduciaryNotice: string;
  latencyAvg: string;
  lockNominal: string;
  
  // Navigation
  navWorkspaceOps: string;
  navOverview: string;
  navPersonnel: string;
  navMessages: string;
  navCalendar: string;
  navPipeline: string;
  navVault: string;
  navAIKeys: string;
  activeBadge: string;
  unreadBadge: string;
  highValueBadge: string;
  aiKeysAndModels: string;

  // TopBar
  commandCenter: string;
  guardrailsAndVault: string;
  allChannels: string;
  channelWhatsApp: string;
  channelWebChat: string;
  channelEmail: string;
  channelSMS: string;

  // Header Pulse
  pulseTitle: string;
  pulseItalic: string;
  personnelOperational: string;
  zeroEscalations: string;

  // Metrics
  metricActiveDialogues: string;
  metricAppointments: string;
  metricPipelineValue: string;
  metricResolutionRate: string;
  metricStarted2h: string;
  metricTodayQueued: string;
  metricHighConviction: string;
  metricStrictProtocol: string;
  metricSlaUptime: string;
  metricZeroDoubleBookings: string;
  metricAvgVelocity: string;
  metricGuardrailIntegrity: string;

  // Personnel Section
  workforceHeading: string;
  workforceItalic: string;
  workforceSubtext: string;
  systemLatency: string;
  activeDuty: string;
  inDialogue: string;
  calibrating: string;
  currentFocus: string;
  activeChats: string;
  bookedWk: string;
  guardrails: string;
  inspect: string;

  // Conversations Section
  dialoguesHeading: string;
  dialoguesItalic: string;
  dialoguesSubtext: string;
  searchDialogues: string;
  allPriorities: string;
  urgent: string;
  high: string;
  standard: string;
  turns: string;
  linkedSlot: string;

  // Appointments Section
  appointmentsHeading: string;
  appointmentsItalic: string;
  appointmentsSubtext: string;
  allSlots: string;
  dossierReady: string;
  confirmed: string;
  autoRescheduled: string;
  orchestratedBy: string;
  briefingPack: string;

  // Pipeline Section
  pipelineHeading: string;
  pipelineItalic: string;
  pipelineSubtext: string;
  leadAndFirm: string;
  pipelineValueCol: string;
  stageCol: string;
  assignedAgentCol: string;
  nextStepCol: string;
  touchpointCol: string;
  winProbability: string;

  // Knowledge Vault
  vaultHeading: string;
  vaultItalic: string;
  vaultSubtext: string;
  ingestDirectiveBtn: string;
  allDirectives: string;
  tokensCount: string;
  vectorEmbeddings: string;
  closeDirective: string;
  vaultSearchPlaceholder: string;
  vaultCatCommercial: string;
  vaultCatRegulatory: string;
  vaultCatScheduling: string;
  vaultCatBrand: string;
  vaultOperationalScope: string;
  vaultEnforcedDirectives: string;
  vaultIngestTitle: string;
  vaultFieldTitle: string;
  vaultFieldTitlePlaceholder: string;
  vaultFieldCategory: string;
  vaultFieldSummary: string;
  vaultFieldSummaryPlaceholder: string;
  vaultFieldDirectives: string;
  vaultFieldDirectivesPlaceholder: string;
  vaultSubmit: string;
  vaultNoResults: string;
  noItemsMatch: string;
  noConversationsMatch: string;

  // Modals & Inspector
  precisionInspector: string;
  closeInspector: string;
  operationalMode: string;
  simClientInteraction: string;
  testReasoning: string;
  simulatePlaceholder: string;
  sendBtn: string;
  reasoningStep: string;
  intentDetected: string;
  vaultSource: string;
  policyCheck: string;
  expandDossier: string;
  collapseDossier: string;
  exportPdf: string;
  executeStepNow: string;
  touchpointChronology: string;
  cancelBtn: string;
  authorizeDeploy: string;
  newPersonnelTitle: string;
  personnelName: string;
  systemIdentifier: string;
  operationalMandate: string;
  specializationLabel: string;
  omnichannelLabel: string;
  securityDiagnosticsTitle: string;
  storageAccessStatus: string;
  requestStorageAccessBtn: string;
  testPopupBtn: string;
  validateUrlBtn: string;
  safeDestination: string;
  unsafeDestination: string;
  popupBlockedNotice: string;
  cookieDiagnostics: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'VEYRA AI',
    appSubtitle: 'Autonomous Personnel',
    deploySpecialist: 'Deploy Specialist',
    downloadZip: 'Download ZIP',
    guardrailsNominal: 'Autonomous Guardrails',
    workspaceTitle: 'Aethelgard Advisory',
    workspaceLocation: 'Zurich & Mayfair',
    privateTier: 'Private Tier',
    managingDirector: 'Alexander Ward · Managing Partner',
    fiduciaryNotice: '3 Active personnel adhering to SEC fiduciary & GDPR standards.',
    latencyAvg: 'Latency: 1.3s avg',
    lockNominal: 'Lock: Nominal',

    navWorkspaceOps: 'Workspace Operations',
    navOverview: 'Command Overview',
    navPersonnel: 'AI Personnel',
    navMessages: 'Inbound Messages',
    navCalendar: 'Executive Calendar',
    navPipeline: 'Lead Pipeline',
    navVault: 'Knowledge & Policies',
    navAIKeys: 'AI Keys & Models',
    activeBadge: '3 Active',
    unreadBadge: 'unread',
    highValueBadge: '5 High-Value',
    aiKeysAndModels: 'AI Keys & Models',

    commandCenter: 'Command Overview',
    guardrailsAndVault: 'Guardrails & Vault',
    allChannels: 'All Channels',
    channelWhatsApp: 'WhatsApp',
    channelWebChat: 'Web Chat',
    channelEmail: 'Email',
    channelSMS: 'SMS',

    pulseTitle: 'Enterprise Pulse',
    pulseItalic: '& Intelligence',
    personnelOperational: '3 Personnel Operational',
    zeroEscalations: 'Zero human escalations today',

    metricActiveDialogues: 'Active Client Dialogues',
    metricAppointments: 'Appointments Orchestrated',
    metricPipelineValue: 'Qualified Deal Pipeline',
    metricResolutionRate: 'Autonomous Resolution Rate',
    metricStarted2h: '+8 started in last 2h',
    metricTodayQueued: '5 today · 13 queued for week',
    metricHighConviction: '5 high-conviction mandates',
    metricStrictProtocol: 'Escalations strictly per protocol',
    metricSlaUptime: '100% SLA uptime',
    metricZeroDoubleBookings: '0 double-bookings',
    metricAvgVelocity: 'Avg velocity 4.2d',
    metricGuardrailIntegrity: 'Guardrail integrity 99.8%',

    workforceHeading: 'Autonomous Workforce',
    workforceItalic: '· 3 Active Specialists',
    workforceSubtext: 'Dedicated enterprise agents orchestrating customer messaging, scheduling, and strategic follow-ups.',
    systemLatency: 'System latency:',
    activeDuty: 'Active Duty',
    inDialogue: 'In Dialogue',
    calibrating: 'Calibrating',
    currentFocus: 'Current Focus',
    activeChats: 'Active Chats',
    bookedWk: 'Booked Wk',
    guardrails: 'Guardrails',
    inspect: 'Inspect',

    dialoguesHeading: 'Inbound Messages & Dialogues',
    dialoguesItalic: '· Live Triage',
    dialoguesSubtext: 'Real-time conversations orchestrated across WhatsApp, Web Chat, Email, and SMS with autonomous policy checks.',
    searchDialogues: 'Search dialogues...',
    allPriorities: 'All Priorities',
    urgent: 'Urgent',
    high: 'High',
    standard: 'Standard',
    turns: 'turns',
    linkedSlot: 'Linked',

    appointmentsHeading: 'Executive Appointments',
    appointmentsItalic: '· Calendar Orchestration',
    appointmentsSubtext: 'Autonomous multi-attendee scheduling with conflict mitigation and preliminary dossier synthesis.',
    allSlots: 'All Slots',
    dossierReady: 'Dossier Ready',
    confirmed: 'Confirmed',
    autoRescheduled: 'Auto-Rescheduled',
    orchestratedBy: 'Orchestrated by',
    briefingPack: 'Briefing Pack',

    pipelineHeading: 'High-Value Pipeline Follow-ups',
    pipelineItalic: '· Autonomous Nurture',
    pipelineSubtext: 'Continuous multi-touch relationship maintenance with zero dropped follow-up sequences.',
    leadAndFirm: 'Lead & Firm',
    pipelineValueCol: 'Pipeline Value',
    stageCol: 'Stage',
    assignedAgentCol: 'Assigned AI Agent',
    nextStepCol: 'Next Autonomous Step',
    touchpointCol: 'Touchpoint',
    winProbability: 'win probability',

    vaultHeading: 'Knowledge Vault & Guardrail Directives',
    vaultItalic: '· Grounding Repository',
    vaultSubtext: "Verified institutional source material that grounds Elena, Julian, and Aria's autonomous responses.",
    ingestDirectiveBtn: '+ Ingest Directive',
    allDirectives: 'All Directives',
    tokensCount: 'tokens',
    vectorEmbeddings: 'Vector Embeddings:',
    closeDirective: 'Close Directive',
    vaultSearchPlaceholder: "Search policies & vaults...",
    vaultCatCommercial: "Commercial Contracts & Pricing",
    vaultCatRegulatory: "Regulatory Compliance",
    vaultCatScheduling: "Scheduling & Logistics",
    vaultCatBrand: "Brand Architecture",
    vaultOperationalScope: "Operational Scope",
    vaultEnforcedDirectives: "Enforced Directives & Bounds",
    vaultIngestTitle: "Ingest New Institutional Directive",
    vaultFieldTitle: "Directive Title / Reference Code",
    vaultFieldTitlePlaceholder: "e.g. Q4 Executive Cross-Border Tax Entity Guidelines",
    vaultFieldCategory: "Governance Category",
    vaultFieldSummary: "Executive Summary",
    vaultFieldSummaryPlaceholder: "Describe the operational constraints this document imposes on AI personnel...",
    vaultFieldDirectives: "Enforceable Guardrail Directives (one per line)",
    vaultFieldDirectivesPlaceholder: "e.g.\nNever quote fixed returns without caveat\nRequire KYC proof before Mayfair meeting confirmation",
    vaultSubmit: "Index & Ground Workforce",
    vaultNoResults: "No documents match the current search or filter.",
    noItemsMatch: "No items match the current filter.",
    noConversationsMatch: "No conversations matching the current filter.",

    precisionInspector: 'Precision Inspector',
    closeInspector: 'Close Inspector',
    operationalMode: 'Operational Mode',
    simClientInteraction: 'SIMULATE LIVE CLIENT INTERACTION',
    testReasoning: 'Test Cognitive Reasoning',
    simulatePlaceholder: 'Type a custom inquiry to test AI personnel reasoning...',
    sendBtn: 'Send',
    reasoningStep: 'Autonomous Reasoning Step',
    intentDetected: 'Intent detected:',
    vaultSource: 'Vault source:',
    policyCheck: 'Policy check:',
    expandDossier: 'Expand Briefing Pack',
    collapseDossier: 'Collapse Pack',
    exportPdf: 'Export Briefing Pack (.PDF)',
    executeStepNow: 'Execute Step Now',
    touchpointChronology: 'Autonomous Touchpoint Chronology',
    cancelBtn: 'Cancel',
    authorizeDeploy: 'Authorize & Deploy Specialist',
    newPersonnelTitle: 'Deploy New Autonomous Personnel',
    personnelName: 'Personnel Name',
    systemIdentifier: 'System Identifier',
    operationalMandate: 'Operational Mandate & Role',
    specializationLabel: 'Domain Specialization',
    omnichannelLabel: 'Authorized Omnichannel Interfaces',
    securityDiagnosticsTitle: 'Security & Cookie Storage Diagnostics',
    storageAccessStatus: 'Storage Access API & Cookie State',
    requestStorageAccessBtn: 'Request Storage Access',
    testPopupBtn: 'Test Window / Popup Access',
    validateUrlBtn: 'Validate Return URL',
    safeDestination: 'Destination is Verified & Safe',
    unsafeDestination: 'Unsafe Destination Blocked',
    popupBlockedNotice: 'Popup was blocked by browser. Direct link provided.',
    cookieDiagnostics: 'Security & Storage Audit',
  },
  ar: {
    appName: 'فيرا للذكاء الاصطناعي',
    appSubtitle: 'موظفون ذاتيو الإدارة',
    deploySpecialist: 'نشر موظف ذكي',
    downloadZip: 'تحميل الكود (.ZIP)',
    guardrailsNominal: 'حواجز الأمان الآلية',
    workspaceTitle: 'استشارات إيثلغارد',
    workspaceLocation: 'زيورخ ومايفير',
    privateTier: 'الفئة الخاصة',
    managingDirector: 'ألكسندر وارد · شريك إداري',
    fiduciaryNotice: '3 موظفين يعملون وفقاً لمعايير الأمانة المالية SEC وحماية البيانات GDPR.',
    latencyAvg: 'زمن الاستجابة: 1.3 ثانية',
    lockNominal: 'الحالة: نموذجية',

    navWorkspaceOps: 'عمليات مساحة العمل',
    navOverview: 'نظرة عامة على القيادة',
    navPersonnel: 'موظفو الذكاء الاصطناعي',
    navMessages: 'الرسائل والمحادثات',
    navCalendar: 'الجدول التنفيذي',
    navPipeline: 'مسار العملاء والصفقات',
    navVault: 'المعرفة واللوائح',
    navAIKeys: 'مفاتيح ونماذج الذكاء الاصطناعي',
    activeBadge: '3 نشطين',
    unreadBadge: 'غير مقروءة',
    highValueBadge: '5 صفقات كبرى',
    aiKeysAndModels: 'مركز مفاتيح ونماذج AI',

    commandCenter: 'نظرة عامة على القيادة',
    guardrailsAndVault: 'الحواجز وبنك المعرفة',
    allChannels: 'كافة القنوات',
    channelWhatsApp: 'واتساب',
    channelWebChat: 'محادثة الموقع',
    channelEmail: 'البريد الإلكتروني',
    channelSMS: 'الرسائل القصيرة SMS',

    pulseTitle: 'النبض المؤسسي',
    pulseItalic: 'والذكاء العملياتي',
    personnelOperational: '3 موظفين قيد التشغيل',
    zeroEscalations: 'صفر تصعيد بشري اليوم',

    metricActiveDialogues: 'المحادثات النشطة للعملاء',
    metricAppointments: 'المواعيد المنسقة',
    metricPipelineValue: 'قيمة مسار الصفقات المؤهلة',
    metricResolutionRate: 'نسبة الإنجاز الذاتي',
    metricStarted2h: '+8 بدأت خلال آخر ساعتين',
    metricTodayQueued: '5 اليوم · 13 في الانتظار هذا الأسبوع',
    metricHighConviction: '5 تفويضات استثمارية عالية القيمة',
    metricStrictProtocol: 'تصعيد صارم وفق البروتوكول',
    metricSlaUptime: 'جاهزية 100% باتفاقية الخدمة',
    metricZeroDoubleBookings: 'صفر تضارب في المواعيد',
    metricAvgVelocity: 'معدل السرعة 4.2 يوم',
    metricGuardrailIntegrity: 'سلامة الامتثال 99.8%',

    workforceHeading: 'القوى العاملة الذاتية',
    workforceItalic: '· 3 خبراء نشطين',
    workforceSubtext: 'موظفون مؤسسيون متخصصون يديرون رسائل العملاء، الحجوزات، والمتابعات الإستراتيجية.',
    systemLatency: 'استجابة النظام:',
    activeDuty: 'في الخدمة',
    inDialogue: 'في محادثة مباشرة',
    calibrating: 'قيد المعايرة',
    currentFocus: 'التركيز الحالي',
    activeChats: 'محادثات نشطة',
    bookedWk: 'حجوزات الأسبوع',
    guardrails: 'الامتثال',
    inspect: 'فحص وتدقيق',

    dialoguesHeading: 'الرسائل الواردة والمحادثات',
    dialoguesItalic: '· تصنيف ومتابعة حية',
    dialoguesSubtext: 'حوارات فورية تُدار عبر واتساب، الموقع، البريد، والرسائل مع التحقق التلقائي من السياسات.',
    searchDialogues: 'بحث في المحادثات...',
    allPriorities: 'كافة الأولويات',
    urgent: 'عاجل جداً',
    high: 'أولوية عالية',
    standard: 'قياسي',
    turns: 'رسائل متبادلة',
    linkedSlot: 'موعد مرتبط',

    appointmentsHeading: 'المواعيد والجدول التنفيذي',
    appointmentsItalic: '· تنسيق المواعيد الآلي',
    appointmentsSubtext: 'تنسيق مواعيد متعددة الأطراف وتفادي التعارض مع إعداد وتوليد حقائب الإحاطة التلقائية.',
    allSlots: 'كافة المواعيد',
    dossierReady: 'الحقيبة جاهزة',
    confirmed: 'مؤكد',
    autoRescheduled: 'مُعاد جدولته آلياً',
    orchestratedBy: 'بتنسيق من',
    briefingPack: 'حقيبة إحاطة',

    pipelineHeading: 'متابعة مسار الصفقات الكبرى',
    pipelineItalic: '· تغذية الفرص آلياً',
    pipelineSubtext: 'إدارة علاقات متواصلة متعددة اللمسات لضمان عدم ضياع أي متابعة إستراتيجية.',
    leadAndFirm: 'العميل والشركة',
    pipelineValueCol: 'قيمة الصفقة',
    stageCol: 'المرحلة',
    assignedAgentCol: 'الموظف المسؤول',
    nextStepCol: 'الخطوة الآلية القادمة',
    touchpointCol: 'آخر تواصل',
    winProbability: 'احتمال الفوز بالصفقة',

    vaultHeading: 'بنك المعرفة وموجّهات الامتثال',
    vaultItalic: '· مستودع المرجعية',
    vaultSubtext: 'المصادر والوثائق المؤسسية المعتمدة التي تؤسس إجابات إيلينا، جوليان، وآريا.',
    ingestDirectiveBtn: '+ إدراج لائحة جديدة',
    allDirectives: 'كافة اللوائح',
    tokensCount: 'رمز تشفير',
    vectorEmbeddings: 'وحدات التضمين الرقمي:',
    closeDirective: 'إغلاق الوثيقة',
    vaultSearchPlaceholder: "ابحث في اللوائح والمستودعات...",
    vaultCatCommercial: "العقود التجارية والتسعير",
    vaultCatRegulatory: "الامتثال التنظيمي",
    vaultCatScheduling: "الجدولة والخدمات اللوجستية",
    vaultCatBrand: "هوية العلامة وأسلوب الخطاب",
    vaultOperationalScope: "النطاق التشغيلي",
    vaultEnforcedDirectives: "اللوائح والحدود الملزمة",
    vaultIngestTitle: "إدراج لائحة مؤسسية جديدة",
    vaultFieldTitle: "عنوان اللائحة / رمز المرجع",
    vaultFieldTitlePlaceholder: "مثال: إرشادات الضرائب العابرة للحدود للربع الرابع",
    vaultFieldCategory: "فئة الحوكمة",
    vaultFieldSummary: "الملخص التنفيذي",
    vaultFieldSummaryPlaceholder: "صف القيود التشغيلية التي تفرضها هذه الوثيقة على موظفي الذكاء الاصطناعي...",
    vaultFieldDirectives: "لوائح الحماية الملزمة (واحدة في كل سطر)",
    vaultFieldDirectivesPlaceholder: "مثال:\nلا تذكر عوائد ثابتة دون تحفظ\nاطلب إثبات KYC قبل تأكيد اجتماع مايفير",
    vaultSubmit: "فهرسة وتأسيس الموظفين",
    vaultNoResults: "لا توجد وثائق تطابق البحث أو التصفية الحالية.",
    noItemsMatch: "لا توجد عناصر تطابق التصفية الحالية.",
    noConversationsMatch: "لا توجد محادثات تطابق التصفية الحالية.",

    precisionInspector: 'لوحة الفحص الهندسي الدقيق',
    closeInspector: 'إغلاق الفاحص',
    operationalMode: 'نمط التشغيل',
    simClientInteraction: 'محاكاة حية لتفاعل العميل',
    testReasoning: 'اختبار التفكير والاستنتاج الآلي',
    simulatePlaceholder: 'اكتب سؤالاً أو استفساراً لاختبار تفكير الموظف الذكي...',
    sendBtn: 'إرسال',
    reasoningStep: 'خطوة التفكير والاستنتاج الآلي',
    intentDetected: 'النية المكتشفة:',
    vaultSource: 'مرجع بنك المعرفة:',
    policyCheck: 'فحص الامتثال والسياسة:',
    expandDossier: 'توسيع حقيبة الإحاطة',
    collapseDossier: 'طي الحقيبة',
    exportPdf: 'تصدير حقيبة الإحاطة (.PDF)',
    executeStepNow: 'تنفيذ الخطوة الآن',
    touchpointChronology: 'السجل الزمني للتواصل الآلي',
    cancelBtn: 'إلغاء',
    authorizeDeploy: 'اعتماد ونشر الموظف الذكي',
    newPersonnelTitle: 'نشر موظف ذكاء اصطناعي جديد',
    personnelName: 'اسم الموظف',
    systemIdentifier: 'المعرّف الرقمي',
    operationalMandate: 'المهمة والدور العملياتي',
    specializationLabel: 'مجال التخصص الدقيق',
    omnichannelLabel: 'القنوات الرقمية المصرح بها',
    securityDiagnosticsTitle: 'فحص الأمان والوصول للتخزين وملفات تعريف الارتباط',
    storageAccessStatus: 'واجهة الوصول للتخزين وملفات الارتباط',
    requestStorageAccessBtn: 'طلب إذن الوصول للتخزين',
    testPopupBtn: 'اختبار النوافذ المنبثقة',
    validateUrlBtn: 'التحقق من رابط العودة',
    safeDestination: 'الوجهة آمنة وموثوقة',
    unsafeDestination: 'تم حظر وجهة غير آمنة أو غير موثوقة',
    popupBlockedNotice: 'حظر المتصفح النافذة المنبثقة. يتوفر رابط بديل مباشر.',
    cookieDiagnostics: 'تدقيق الأمان وملفات الارتباط',
  },
  fr: {
    appName: 'VEYRA IA',
    appSubtitle: 'Personnel Autonome',
    deploySpecialist: 'Déployer Spécialiste',
    downloadZip: 'Télécharger ZIP',
    guardrailsNominal: 'Garde-fous Autonomes',
    workspaceTitle: 'Conseil Aethelgard',
    workspaceLocation: 'Zurich & Mayfair',
    privateTier: 'Palier Privé',
    managingDirector: 'Alexander Ward · Associé Gérant',
    fiduciaryNotice: '3 Spécialistes actifs conformes aux normes fiduciaires SEC et RGPD.',
    latencyAvg: 'Latence : 1.3s moy.',
    lockNominal: 'Statut : Nominal',

    navWorkspaceOps: 'Opérations Espace de Travail',
    navOverview: 'Vue Commandement',
    navPersonnel: 'Personnel IA',
    navMessages: 'Messages Entrants',
    navCalendar: 'Calendrier Exécutif',
    navPipeline: 'Pipeline Opportunités',
    navVault: 'Savoirs & Politiques',
    navAIKeys: 'Clés IA & Modèles',
    activeBadge: '3 Actifs',
    unreadBadge: 'non lus',
    highValueBadge: '5 Haute Valeur',
    aiKeysAndModels: 'Centre Clés IA & Modèles',

    commandCenter: 'Vue d’Ensemble',
    guardrailsAndVault: 'Garde-fous & Coffre',
    allChannels: 'Tous Canaux',
    channelWhatsApp: 'WhatsApp',
    channelWebChat: 'Web Chat',
    channelEmail: 'Email',
    channelSMS: 'SMS',

    pulseTitle: 'Pouls Entreprise',
    pulseItalic: '& Intelligence',
    personnelOperational: '3 Spécialistes Opérationnels',
    zeroEscalations: 'Zéro escalade humaine aujourd’hui',

    metricActiveDialogues: 'Dialogues Clients Actifs',
    metricAppointments: 'Rendez-vous Orchestrés',
    metricPipelineValue: 'Pipeline Qualifié',
    metricResolutionRate: 'Taux Résolution Autonome',
    metricStarted2h: '+8 initiés en 2h',
    metricTodayQueued: '5 aujourd’hui · 13 cette semaine',
    metricHighConviction: '5 mandats haute conviction',
    metricStrictProtocol: 'Escalades selon protocole strict',
    metricSlaUptime: 'Disponibilité SLA 100%',
    metricZeroDoubleBookings: '0 double réservation',
    metricAvgVelocity: 'Vélocité moy. 4.2j',
    metricGuardrailIntegrity: 'Intégrité garde-fous 99.8%',

    workforceHeading: 'Force Autonome',
    workforceItalic: '· 3 Spécialistes Actifs',
    workforceSubtext: 'Agents d’entreprise dédiés gérant messages, planification et relances stratégiques.',
    systemLatency: 'Latence système :',
    activeDuty: 'En Service',
    inDialogue: 'En Dialogue',
    calibrating: 'Calibration',
    currentFocus: 'Objectif Actuel',
    activeChats: 'Discussions Actives',
    bookedWk: 'Planifiés Sem.',
    guardrails: 'Conformité',
    inspect: 'Inspecter',

    dialoguesHeading: 'Messages Entrants & Dialogues',
    dialoguesItalic: '· Triage en Direct',
    dialoguesSubtext: 'Conversations temps réel orchestrées via WhatsApp, Web, Email et SMS avec contrôle de politique.',
    searchDialogues: 'Rechercher dialogues...',
    allPriorities: 'Toutes Priorités',
    urgent: 'Urgent',
    high: 'Élevé',
    standard: 'Standard',
    turns: 'échanges',
    linkedSlot: 'Lié',

    appointmentsHeading: 'Rendez-vous Exécutifs',
    appointmentsItalic: '· Orchestration Calendrier',
    appointmentsSubtext: 'Planification autonome multi-participants avec prévention de conflits et dossiers de synthèse.',
    allSlots: 'Tous Créneaux',
    dossierReady: 'Dossier Prêt',
    confirmed: 'Confirmé',
    autoRescheduled: 'Replanifié Auto',
    orchestratedBy: 'Orchestré par',
    briefingPack: 'Dossier Synthèse',

    pipelineHeading: 'Relances Pipeline Stratégique',
    pipelineItalic: '· Nurturing Autonome',
    pipelineSubtext: 'Maintien de relation multi-points sans aucune perte de momentum.',
    leadAndFirm: 'Prospect & Entreprise',
    pipelineValueCol: 'Valeur Pipeline',
    stageCol: 'Étape',
    assignedAgentCol: 'Agent IA Assigné',
    nextStepCol: 'Prochaine Action Autonome',
    touchpointCol: 'Point de Contact',
    winProbability: 'probabilité de succès',

    vaultHeading: 'Coffre de Connaissances & Directives',
    vaultItalic: '· Répertoire d’Ancrage',
    vaultSubtext: 'Documents institutionnels vérifiés fondant les réponses autonomes d’Elena, Julian et Aria.',
    ingestDirectiveBtn: '+ Ingérer Directive',
    allDirectives: 'Toutes Directives',
    tokensCount: 'tokens',
    vectorEmbeddings: 'Plongements Vectoriels :',
    closeDirective: 'Fermer Directive',
    vaultSearchPlaceholder: "Rechercher politiques et coffres...",
    vaultCatCommercial: "Contrats commerciaux & Tarification",
    vaultCatRegulatory: "Conformité réglementaire",
    vaultCatScheduling: "Planification & Logistique",
    vaultCatBrand: "Architecture de marque",
    vaultOperationalScope: "Portée opérationnelle",
    vaultEnforcedDirectives: "Directives & limites appliquées",
    vaultIngestTitle: "Ingérer une nouvelle directive institutionnelle",
    vaultFieldTitle: "Titre de la directive / Code de référence",
    vaultFieldTitlePlaceholder: "ex. Directives fiscales transfrontalières du T4",
    vaultFieldCategory: "Catégorie de gouvernance",
    vaultFieldSummary: "Résumé exécutif",
    vaultFieldSummaryPlaceholder: "Décrivez les contraintes opérationnelles que ce document impose au personnel IA...",
    vaultFieldDirectives: "Directives de garde-fous applicables (une par ligne)",
    vaultFieldDirectivesPlaceholder: "ex.\nNe jamais citer de rendements fixes sans réserve\nExiger une preuve KYC avant de confirmer une réunion à Mayfair",
    vaultSubmit: "Indexer & Ancrer les équipes",
    vaultNoResults: "Aucun document ne correspond à la recherche ou au filtre actuel.",
    noItemsMatch: "Aucun élément ne correspond au filtre actuel.",
    noConversationsMatch: "Aucune conversation ne correspond au filtre actuel.",

    precisionInspector: 'Inspecteur de Précision',
    closeInspector: 'Fermer Inspecteur',
    operationalMode: 'Mode Opérationnel',
    simClientInteraction: 'SIMULER INTERACTION CLIENT',
    testReasoning: 'Tester Raisonnement Cognitif',
    simulatePlaceholder: 'Saisissez une demande client pour tester le raisonnement...',
    sendBtn: 'Envoyer',
    reasoningStep: 'Étape de Raisonnement Autonome',
    intentDetected: 'Intention détectée :',
    vaultSource: 'Source coffre :',
    policyCheck: 'Contrôle politique :',
    expandDossier: 'Déployer Dossier',
    collapseDossier: 'Réduire Dossier',
    exportPdf: 'Exporter Dossier (.PDF)',
    executeStepNow: 'Exécuter l’Étape Maintenant',
    touchpointChronology: 'Chronologie des Actions Autonomes',
    cancelBtn: 'Annuler',
    authorizeDeploy: 'Autoriser & Déployer Spécialiste',
    newPersonnelTitle: 'Déployer Nouveau Personnel Autonome',
    personnelName: 'Nom du Personnel',
    systemIdentifier: 'Identifiant Système',
    operationalMandate: 'Mandat Opérationnel & Rôle',
    specializationLabel: 'Spécialisation de Domaine',
    omnichannelLabel: 'Canaux Omnicanaux Autorisés',
    securityDiagnosticsTitle: 'Diagnostics Sécurité et Stockage Cookies',
    storageAccessStatus: 'API d’accès au stockage & État Cookies',
    requestStorageAccessBtn: 'Demander l’accès au stockage',
    testPopupBtn: 'Tester Fenêtre / Popups',
    validateUrlBtn: 'Valider URL de Retour',
    safeDestination: 'Destination vérifiée et sécurisée',
    unsafeDestination: 'Destination non sécurisée bloquée',
    popupBlockedNotice: 'Popup bloquée par le navigateur. Lien direct fourni.',
    cookieDiagnostics: 'Audit Sécurité & Stockage',
  },
};
