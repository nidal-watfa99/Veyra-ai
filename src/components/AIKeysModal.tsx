import React, { useState, useEffect } from 'react';
import { 
  X, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Shield, 
  Trash2, 
  Radio, 
  Info, 
  Zap, 
  Eye, 
  EyeOff,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { safeOpenWindow, resilientStorage } from '../utils/security';
import {
  type ProviderId,
  getStoredKey,
  setStoredKey,
  removeStoredKey,
  getActiveProvider,
  maskKey,
  testProvider,
} from '../utils/aiClient';

const CATALOG_STORAGE_KEY = 'veyra_ai_catalog_v2';

export interface ProviderCatalogItem {
  id: string;
  name: string;
  officialPortalUrl: string;
  docsUrl: string;
  freeTierNotes: {
    en: string;
    ar: string;
  };
  hasStoredKey: boolean;
  maskedKey: string;
  selectedModel: string;
  status: 'connected' | 'invalid_key' | 'quota_exceeded' | 'timeout_error' | 'untested';
  lastTestedAt?: string;
  lastLatencyMs?: number;
  lastError?: string;
  models: {
    id: string;
    name: string;
    tag: string;
    isFreeTierEligible: boolean;
  }[];
}

const DEFAULT_CATALOG: ProviderCatalogItem[] = [
  {
    id: 'gemini',
    name: 'Google Gemini API',
    officialPortalUrl: 'https://aistudio.google.com/app/apikey',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
    freeTierNotes: {
      en: 'Free tier available in Google AI Studio with up to 15 RPM / 1M TPM depending on regional availability and account tier.',
      ar: 'تتوفر باقة مجانية في Google AI Studio تصل إلى 15 طلباً بالدقيقة و 1M رمز بالدقيقة بحسب المنطقة والحساب.',
    },
    hasStoredKey: false,
    maskedKey: '',
    selectedModel: 'gemini-2.5-flash',
    status: 'untested',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Fast / Multimodal', isFreeTierEligible: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tag: 'Complex Reasoning', isFreeTierEligible: true },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Ultra High-Speed', isFreeTierEligible: true },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', tag: 'Versatile / High Volume', isFreeTierEligible: true },
    ],
  },
  {
    id: 'groq',
    name: 'GroqCloud',
    officialPortalUrl: 'https://console.groq.com/keys',
    docsUrl: 'https://console.groq.com/docs/overview',
    freeTierNotes: {
      en: 'Free developer tier with high token/second inference speed on Groq LPUs. Subject to per-minute rate limits.',
      ar: 'باقة مجانية للمطورين بسرعة فائقة على معالجات Groq LPU مع حدود استخدام دقيقة مجانية.',
    },
    hasStoredKey: false,
    maskedKey: '',
    selectedModel: 'llama-3.3-70b-versatile',
    status: 'untested',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', tag: 'Top Tier Open Weight', isFreeTierEligible: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', tag: 'Sub-second Latency', isFreeTierEligible: true },
    ],
  },
  {
    id: 'cerebras',
    name: 'Cerebras Inference',
    officialPortalUrl: 'https://inference.cerebras.ai/',
    docsUrl: 'https://inference-docs.cerebras.ai/',
    freeTierNotes: {
      en: 'Free access tier for developers with daily generation credits on CS-3 wafer-scale inference systems.',
      ar: 'باقة مجانية يومية للمطورين بسرعة معالجة شريحة Wafer-Scale CS-3.',
    },
    hasStoredKey: false,
    maskedKey: '',
    selectedModel: 'llama-3.3-70b',
    status: 'untested',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', tag: 'Wafer Speed', isFreeTierEligible: true },
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B', tag: 'Ultra-Fast Agents', isFreeTierEligible: true },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    officialPortalUrl: 'https://openrouter.ai/keys',
    docsUrl: 'https://openrouter.ai/collections/free-models/',
    freeTierNotes: {
      en: 'Dedicated catalog of free models tagged with ":free" available without upfront payment or credits.',
      ar: 'دليل كامل لنماذج مجانية بالكامل تنتهي بـ :free تعمل بدون رصيد مالي مسبق.',
    },
    hasStoredKey: false,
    maskedKey: '',
    selectedModel: 'meta-llama/llama-3.3-70b-instruct:free',
    status: 'untested',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)', tag: 'High Intelligence Free', isFreeTierEligible: true },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', tag: 'Reasoning Free', isFreeTierEligible: true },
    ],
  },
];

interface AIKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIKeysModal: React.FC<AIKeysModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const [catalog, setCatalog] = useState<ProviderCatalogItem[]>(() => {
    // Keys and settings live in this browser only (works on static hosting, no backend)
    let saved: ProviderCatalogItem[] = [];
    try {
      const raw = resilientStorage.getItem(CATALOG_STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {
      saved = [];
    }
    return DEFAULT_CATALOG.map((d) => {
      const s = saved.find((x) => x.id === d.id);
      const key = getStoredKey(d.id);
      return {
        ...d,
        ...(s ? { selectedModel: s.selectedModel, status: s.status, lastTestedAt: s.lastTestedAt, lastLatencyMs: s.lastLatencyMs, lastError: s.lastError, models: s.models?.length ? s.models : d.models } : {}),
        hasStoredKey: Boolean(key),
        maskedKey: key ? maskKey(key) : '',
      };
    });
  });
  const [activeProviderId, setActiveProviderId] = useState<string>(() => {
    return getActiveProvider();
  });
  const [selectedProviderId, setSelectedProviderId] = useState<string>('gemini');
  const [inputKey, setInputKey] = useState<string>('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: string;
    latencyMs?: number;
    sampleResponse?: string;
    error?: string;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Fetch catalog on mount or open
  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
    }
  }, [isOpen]);

  // Close on Escape while open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const persistCatalog = (updated: ProviderCatalogItem[]) => {
    resilientStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated));
  };

  const flashMessage = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 2500);
  };

  // Re-sync "has key" flags from browser storage
  const fetchCatalog = () => {
    setCatalog((prev) =>
      prev.map((p) => {
        const key = getStoredKey(p.id);
        return { ...p, hasStoredKey: Boolean(key), maskedKey: key ? maskKey(key) : '' };
      })
    );
    setActiveProviderId(getActiveProvider());
  };

  if (!isOpen) return null;

  const currentProvider = catalog.find((p) => p.id === selectedProviderId) || catalog[0];

  const handleTestKey = async () => {
    if (!currentProvider) return;
    const keyToUse = inputKey.trim() || getStoredKey(currentProvider.id);
    if (!keyToUse) {
      setTestResult({
        success: false,
        status: 'invalid_key',
        error: isArabic ? 'يرجى إدخال مفتاح API أولاً' : 'Please enter an API key first',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const out = await testProvider(currentProvider.id as ProviderId, keyToUse, currentProvider.selectedModel);
      setTestResult(out);

      if (out.success) {
        // A key that passed a real test is saved locally so the agents can use it
        setStoredKey(currentProvider.id, keyToUse);
        resilientStorage.setItem('veyra_model_' + currentProvider.id, out.model || currentProvider.selectedModel);
        setInputKey('');
      }

      setCatalog((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== currentProvider.id) return p;
          const liveModels = (out.models || []).slice(0, 30).map((m) => ({
            id: m.id,
            name: m.name,
            tag: 'Live',
            isFreeTierEligible: true,
          }));
          return {
            ...p,
            status: out.status,
            lastTestedAt: new Date().toISOString(),
            lastLatencyMs: out.latencyMs,
            lastError: out.success ? undefined : out.error,
            selectedModel: out.model || p.selectedModel,
            models: liveModels.length ? liveModels : p.models,
            ...(out.success ? { hasStoredKey: true, maskedKey: maskKey(keyToUse) } : {}),
          };
        });
        persistCatalog(updated);
        return updated;
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfiguration = async (makeActive: boolean = false) => {
    if (!currentProvider) return;

    const trimmedKey = inputKey.trim();
    if (trimmedKey) setStoredKey(currentProvider.id, trimmedKey);
    const effectiveKey = trimmedKey || getStoredKey(currentProvider.id);
    if (!effectiveKey) {
      flashMessage(isArabic ? 'أدخل مفتاح API أولاً' : 'Enter an API key first');
      return;
    }

    resilientStorage.setItem('veyra_model_' + currentProvider.id, currentProvider.selectedModel);
    setCatalog((prev) => {
      const updated = prev.map((p) =>
        p.id === currentProvider.id ? { ...p, hasStoredKey: true, maskedKey: maskKey(effectiveKey) } : p
      );
      persistCatalog(updated);
      return updated;
    });

    if (makeActive) {
      setActiveProviderId(currentProvider.id);
      resilientStorage.setItem('veyra_active_provider', currentProvider.id);
    }

    setInputKey('');
    flashMessage(isArabic ? 'تم حفظ التكوين على هذا المتصفح' : 'Configuration saved on this browser');
  };

  const handleDeleteKey = async () => {
    if (!currentProvider) return;

    removeStoredKey(currentProvider.id);
    resilientStorage.removeItem('veyra_model_' + currentProvider.id);
    setCatalog((prev) => {
      const updated = prev.map((p) =>
        p.id === currentProvider.id
          ? {
              ...p,
              hasStoredKey: false,
              maskedKey: '',
              status: 'untested' as const,
              lastTestedAt: undefined,
              lastError: undefined,
            }
          : p
      );
      persistCatalog(updated);
      return updated;
    });

    setInputKey('');
    setTestResult(null);
    flashMessage(isArabic ? 'تم حذف المفتاح' : 'Key removed');
  };

  const handleModelChange = async (modelId: string) => {
    if (!currentProvider) return;
    resilientStorage.setItem('veyra_model_' + currentProvider.id, modelId);
    setCatalog((prev) => {
      const updated = prev.map((p) => (p.id === currentProvider.id ? { ...p, selectedModel: modelId } : p));
      persistCatalog(updated);
      return updated;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>{isArabic ? 'متصل ومؤكد' : 'Connected'}</span>
          </span>
        );
      case 'invalid_key':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>{isArabic ? 'مفتاح غير صالح (401)' : 'Invalid Key'}</span>
          </span>
        );
      case 'quota_exceeded':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-500">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{isArabic ? 'تجاوز الحصة (429)' : 'Quota Exceeded'}</span>
          </span>
        );
      case 'timeout_error':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>{isArabic ? 'خطأ بالاتصال / مهلة' : 'Connection Error'}</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono text-[#64748B]">
            {isArabic ? 'غير مختبر' : 'Untested'}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-4xl max-h-[92dvh] bg-[#10151F] border hairline-border rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#E2E8F0] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Notification */}
        {saveMessage && (
          <div className="absolute top-16 right-6 rtl:right-auto rtl:left-6 z-50 bg-[#161D2B] border border-emerald-500/30 text-emerald-300 text-xs px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#0F131C] border-b hairline-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#141B26] border hairline-border flex items-center justify-center text-[#C5A059] shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#F1F5F9] tracking-tight">
                  {isArabic ? 'مركز مفاتيح الذكاء الاصطناعي والنماذج' : 'AI Keys & Models Center'}
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
                  {isArabic ? 'متعدد المزودين' : 'Multi-Provider'}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                {isArabic 
                  ? 'إدارة واختبار مفاتيح API الحقيقية لنماذج Gemini و Groq و Cerebras و OpenRouter' 
                  : 'Manage and test real API keys for Google Gemini, Groq, Cerebras, and OpenRouter'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#161D2B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Split: Provider Sidebar & Detail Area */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden overscroll-contain divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse hairline-divider">
          {/* Left/Right Provider List */}
          <div className="w-full md:w-64 bg-[#0D121B] p-3 space-y-1 shrink-0 md:overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
              {isArabic ? 'مزودو الخدمة المدعومون' : 'Supported Providers'}
            </div>

            {catalog.map((prov) => {
              const isSelected = selectedProviderId === prov.id;
              const isActiveEngine = activeProviderId === prov.id;
              return (
                <button
                  key={prov.id}
                  onClick={() => {
                    setSelectedProviderId(prov.id);
                    setInputKey('');
                    setTestResult(null);
                  }}
                  className={`w-full text-left rtl:text-right p-3 rounded-lg transition-colors cursor-pointer flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-[#151D2A] text-white border-slate-700/80 shadow-xs'
                      : 'border-transparent text-[#94A3B8] hover:bg-[#121824] hover:text-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{prov.name}</span>
                    {isActiveEngine && (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-800/40">
                        {isArabic ? 'الافتراضي' : 'Active'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-[#64748B] truncate max-w-[110px]">
                      {prov.hasStoredKey ? prov.maskedKey : (isArabic ? 'بدون مفتاح' : 'No key')}
                    </span>
                    {getStatusBadge(prov.status)}
                  </div>
                </button>
              );
            })}

            {/* Note about regional free quotas */}
            <div className="pt-3 px-2 text-[10px] text-[#64748B] leading-relaxed border-t hairline-divider">
              <div className="flex items-center gap-1 text-[#C5A059] mb-1 font-mono">
                <Info className="w-3 h-3 shrink-0" />
                <span>{isArabic ? 'تنبيه الحصص المجانية' : 'Quota Notice'}</span>
              </div>
              <p>
                {isArabic
                  ? 'مجانية النماذج وحدود السرعة والاستخدام تختلف بحسب نوع الحساب ومنطقة المستخدم وتحديثات المزود الرسمية.'
                  : 'Free model tier availability and rate limits vary depending on user region, account standing, and provider terms.'}
              </p>
            </div>
          </div>

          {/* Provider Detail Pane */}
          {currentProvider && (
            <div className="flex-1 min-w-0 p-4 sm:p-5 md:overflow-y-auto space-y-5 bg-[#10151F]">
              {/* Provider Title & External Links */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b hairline-divider">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[#F1F5F9]">
                      {currentProvider.name}
                    </h3>
                    {getStatusBadge(currentProvider.status)}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {isArabic ? currentProvider.freeTierNotes.ar : currentProvider.freeTierNotes.en}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => safeOpenWindow(currentProvider.officialPortalUrl)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#E2E8F0] hover:text-white bg-[#161D2B] hover:bg-[#1E273A] border hairline-border rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{isArabic ? 'إنشاء المفتاح رسمياً' : 'Get API Key'}</span>
                    <ExternalLink className="w-3 h-3 text-[#C5A059]" />
                  </button>

                  <button
                    onClick={() => safeOpenWindow(currentProvider.docsUrl)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#E2E8F0] bg-[#121722] hover:bg-[#161D2B] border hairline-border rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{isArabic ? 'الوثائق' : 'Docs'}</span>
                    <ExternalLink className="w-3 h-3 text-[#64748B]" />
                  </button>
                </div>
              </div>

              {/* API Key Input & Management Card */}
              <div className="surface-card p-4 rounded-xl border hairline-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#94A3B8]">
                    {isArabic ? 'مفتاح API الخاص بالمزود' : 'Provider API Key'}
                  </label>
                  {currentProvider.hasStoredKey && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{isArabic ? 'مفتاح محفوظ في الخادم' : 'Key Stored On Server'}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <div className="relative flex-1 min-w-[12rem]">
                    <input
                      type={showKeyText ? 'text' : 'password'}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={currentProvider.hasStoredKey ? currentProvider.maskedKey : (isArabic ? 'الصق مفتاح API هنا...' : 'Paste API key here...')}
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      className="w-full panel-recessed py-2 ps-3.5 pe-9 rounded-lg text-xs font-mono text-[#F1F5F9] border hairline-border focus:outline-none focus:border-slate-500 placeholder-[#64748B]"
                    />
                    <button
                      type="button"
                      aria-label={showKeyText ? 'Hide key' : 'Show key'}
                      onClick={() => setShowKeyText(!showKeyText)}
                      className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] p-1"
                    >
                      {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveConfiguration(false)}
                    className="px-3.5 py-2 text-xs font-medium text-[#0B0E14] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {isArabic ? 'حفظ' : 'Save'}
                  </button>

                  {currentProvider.hasStoredKey && (
                    <button
                      type="button"
                      onClick={handleDeleteKey}
                      className="p-2 text-[#94A3B8] hover:text-rose-400 bg-[#141B26] hover:bg-[#1F2737] border hairline-border rounded-lg transition-colors cursor-pointer shrink-0"
                      title={isArabic ? 'حذف المفتاح' : 'Delete Key'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Test Connection Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t hairline-divider">
                  <div className="text-[11px] font-mono text-[#64748B]">
                    {currentProvider.lastTestedAt && (
                      <span>
                        {isArabic ? 'آخر اختبار:' : 'Last probe:'} {new Date(currentProvider.lastTestedAt).toLocaleTimeString()}
                        {currentProvider.lastLatencyMs && ` (${currentProvider.lastLatencyMs}ms)`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestKey}
                      disabled={isTesting}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? (isArabic ? 'جاري الاختبار الفعلي...' : 'Testing...') : (isArabic ? 'اختبار الاتصال الفعلي' : 'Test Connection')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveConfiguration(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F1F5F9] bg-[#161D2B] hover:bg-[#1E2638] border hairline-border rounded-lg transition-colors cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{isArabic ? 'تعيين كمزود افتراضي' : 'Set as Active Engine'}</span>
                    </button>
                  </div>
                </div>

                {/* Test Result Inspection Box */}
                {testResult && (
                  <div className={`p-3 rounded-lg border text-xs space-y-1.5 mt-2 ${
                    testResult.success
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  }`}>
                    <div className="flex items-center justify-between font-mono font-medium">
                      <span className="flex items-center gap-1.5">
                        {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                        <span>{testResult.success ? (isArabic ? 'اجتاز الاختبار الفعلي بنجاح' : 'Probe Succeeded') : (isArabic ? 'فشل الاختبار الفعلي' : 'Probe Failed')}</span>
                      </span>
                      {testResult.latencyMs && <span className="text-[11px]">{testResult.latencyMs}ms</span>}
                    </div>
                    {testResult.sampleResponse && (
                      <p className="text-[11px] font-mono text-[#E2E8F0] bg-black/30 p-2 rounded border border-white/5">
                        "{testResult.sampleResponse}"
                      </p>
                    )}
                    {testResult.error && (
                      <p className="text-[11px] font-mono text-rose-300">
                        {testResult.error}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Models Catalog Table */}
              <div className="surface-card p-4 rounded-xl border hairline-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#F1F5F9]">
                      {isArabic ? 'النماذج المتاحة وفق شروط المزود' : 'Available Models & Quotas'}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      {isArabic ? 'اختر النموذج الذي سيعمل به موظفو Veyra AI' : 'Select model to govern Veyra AI personnel reasoning'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#C5A059]">
                    {currentProvider.models.length} {isArabic ? 'نماذج' : 'models'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {currentProvider.models.map((model) => {
                    const isSelectedModel = currentProvider.selectedModel === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => handleModelChange(model.id)}
                        className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex flex-wrap items-center justify-between gap-2 ${
                          isSelectedModel
                            ? 'bg-[#151F2E] border-emerald-500/40 text-white'
                            : 'bg-[#0E131C] border hairline-border hover:bg-[#141B26] text-[#94A3B8]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name={`model_${currentProvider.id}`}
                            checked={isSelectedModel}
                            readOnly
                            className="text-emerald-500 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-medium text-[#E2E8F0]">
                              {model.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#64748B]">
                              {model.id}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#94A3B8] bg-[#141B26] px-2 py-0.5 rounded border hairline-border">
                            {model.tag}
                          </span>
                          {model.isFreeTierEligible && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                              {isArabic ? 'باقة مجانية' : 'Free Tier'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#0F131C] border-t hairline-border flex items-center justify-between gap-3 text-xs text-[#64748B] shrink-0">
          <div className="flex items-center gap-2 font-mono min-w-0">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{isArabic ? 'المفاتيح محمية ومخزنة بأمان عبر الخادم' : 'Keys secured and proxied server-side'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#1C2536] text-[#F1F5F9] border hairline-border transition-colors cursor-pointer"
          >
            {isArabic ? 'إغلاق المركز' : 'Close Center'}
          </button>
        </div>
      </div>
    </div>
  );
};
