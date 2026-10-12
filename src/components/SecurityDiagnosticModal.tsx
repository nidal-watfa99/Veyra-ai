import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Cookie, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  HardDrive
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  validateReturnUrl, 
  safeOpenWindow, 
  checkAndRequestStorageAccess, 
  verifyCookieStorageState 
} from '../utils/security';

interface SecurityDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReturnUrl?: string | null;
}

export const SecurityDiagnosticModal: React.FC<SecurityDiagnosticModalProps> = ({
  isOpen,
  onClose,
  initialReturnUrl = null,
}) => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  // Storage and cookie status
  // Lazy initialiser: verifyCookieStorageState() touches document.cookie / localStorage,
  // so it must not run on every render.
  const [cookieState, setCookieState] = useState(() => verifyCookieStorageState());
  const [storageAccessResult, setStorageAccessResult] = useState<{
    hasAccess: boolean;
    supported: boolean;
    requiredUserGesture?: boolean;
    error?: string;
  } | null>(null);
  const [isRequestingStorage, setIsRequestingStorage] = useState(false);

  // Return URL tester
  const [testUrlInput, setTestUrlInput] = useState<string>(initialReturnUrl || '/');
  const [validatedOutput, setValidatedOutput] = useState<string | null>(null);
  const [urlStatus, setUrlStatus] = useState<'safe' | 'unsafe' | 'empty'>('safe');

  // Popup test status
  const [popupTestResult, setPopupTestResult] = useState<{
    tested: boolean;
    success: boolean;
    blocked: boolean;
    fallbackUrl?: string;
    error?: string;
  } | null>(null);

  // Refresh status on open
  useEffect(() => {
    if (isOpen) {
      setCookieState(verifyCookieStorageState());
      checkStorageStatus();
      if (initialReturnUrl) {
        setTestUrlInput(initialReturnUrl);
        handleValidateUrl(initialReturnUrl);
      } else {
        handleValidateUrl(testUrlInput);
      }
    }
  }, [isOpen]);

  const checkStorageStatus = async () => {
    // Passive check on open; the explicit button below performs the real (gesture-based) request
    const result = await checkAndRequestStorageAccess(false);
    setStorageAccessResult(result);
  };

  // Close on Escape while open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleRequestStorageAccess = async () => {
    setIsRequestingStorage(true);
    try {
      const result = await checkAndRequestStorageAccess();
      setStorageAccessResult(result);
      setCookieState(verifyCookieStorageState());
    } finally {
      setIsRequestingStorage(false);
    }
  };

  const handleValidateUrl = (urlToTest: string) => {
    const trimmed = urlToTest.trim();
    if (!trimmed) {
      setUrlStatus('empty');
      setValidatedOutput(null);
      return;
    }

    const safe = validateReturnUrl(trimmed);
    if (safe) {
      setUrlStatus('safe');
      setValidatedOutput(safe);
    } else {
      setUrlStatus('unsafe');
      setValidatedOutput(null);
    }
  };

  const handleTestPopup = () => {
    const targetUrl = validatedOutput || window.location.href;
    const result = safeOpenWindow(targetUrl);
    setPopupTestResult({
      tested: true,
      success: result.success,
      blocked: Boolean(result.blocked),
      fallbackUrl: targetUrl,
      error: result.error,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs select-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-2xl max-h-[92dvh] bg-[#10151F] border hairline-border rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#E2E8F0] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#0F131C] border-b hairline-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#141B26] border hairline-border flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#F1F5F9] tracking-tight">
                  {t('securityDiagnosticsTitle')}
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
                  {isArabic ? 'مدقق الأمان' : 'Verified'}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                {isArabic 
                  ? 'فحص شامل لملفات تعريف الارتباط والتخزين، وتأمين عناوين return_url ضد إعادة التوجيه المفتوح'
                  : 'Comprehensive browser cookie, storage access verification and open-redirect defense'}
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {/* Section 1: Cookie & Storage Access State */}
          <div className="surface-card p-4 rounded-xl border hairline-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-[#C5A059]" />
                <h3 className="text-xs font-semibold text-[#F1F5F9]">
                  {t('storageAccessStatus')}
                </h3>
              </div>
              <button
                onClick={handleRequestStorageAccess}
                disabled={isRequestingStorage}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRequestingStorage ? 'animate-spin' : ''}`} />
                <span>{t('requestStorageAccessBtn')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Storage Access API */}
              <div className="p-2.5 rounded-lg bg-[#0B0E14] border hairline-border space-y-1">
                <div className="text-[10px] font-mono text-[#64748B]">StorageAccess API</div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {storageAccessResult?.hasAccess ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'متاح وممنوح' : 'Granted'}</span>
                    </span>
                  ) : storageAccessResult?.supported ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'يتطلب تفاعل' : 'Restricted'}</span>
                    </span>
                  ) : (
                    <span className="text-[#94A3B8]">{isArabic ? 'غير مدعوم' : 'N/A (Direct)'}</span>
                  )}
                </div>
              </div>

              {/* Cookies Status */}
              <div className="p-2.5 rounded-lg bg-[#0B0E14] border hairline-border space-y-1">
                <div className="text-[10px] font-mono text-[#64748B]">Cookies Status</div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {cookieState.cookiesEnabled ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'مفعلة' : 'Enabled'}</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'معطلة / محجوبة' : 'Blocked'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Resilient Storage Fallback */}
              <div className="p-2.5 rounded-lg bg-[#0B0E14] border hairline-border space-y-1">
                <div className="text-[10px] font-mono text-[#64748B]">Resilient Storage</div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{cookieState.localStorageAvailable ? (isArabic ? 'LocalStorage متاح' : 'LocalStorage OK') : (isArabic ? 'ذاكرة بديلة نشطة' : 'Memory Fallback Active')}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: return_url Validation & Open-Redirect Defense */}
          <div className="surface-card p-4 rounded-xl border hairline-border space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-[#F1F5F9]">
                {isArabic ? 'التحقق الصارم من return_url ومنع إعادة التوجيه غير الآمن' : 'Strict return_url Validation & Open-Redirect Defense'}
              </h3>
            </div>

            <p className="text-[11px] text-[#94A3B8]">
              {isArabic 
                ? 'يتم تقييد وجهات إعادة التوجيه حصراً للمسارات الآمنة والوجهات الموثوقة لمنع استغلال الروابط الضارة أو مخططات javascript:.'
                : 'Redirects are strictly constrained to verified relative paths and authorized origins to eliminate open-redirect exploits.'}
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                {isArabic ? 'اختبار رابط العودة (return_url)' : 'Test return_url Destination'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={testUrlInput}
                  onChange={(e) => {
                    setTestUrlInput(e.target.value);
                    handleValidateUrl(e.target.value);
                  }}
                  placeholder="/overview or https://veyra.ai"
                  className="flex-1 min-w-0 panel-recessed px-3.5 py-2 rounded-lg text-xs font-mono text-[#F1F5F9] border hairline-border focus:outline-none focus:border-slate-500 placeholder-[#64748B]"
                />
                <button
                  type="button"
                  onClick={() => handleValidateUrl(testUrlInput)}
                  className="px-3 py-2 text-xs font-medium text-[#0B0E14] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {t('validateUrlBtn')}
                </button>
              </div>

              {/* Status Outcome */}
              {urlStatus === 'safe' && validatedOutput && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="break-all min-w-0">{t('safeDestination')}: <strong className="text-white">{validatedOutput}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200">
                    PASS
                  </span>
                </div>
              )}

              {urlStatus === 'unsafe' && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                  <div className="flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{t('unsafeDestination')}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-rose-900/60 px-2 py-0.5 rounded text-rose-200">
                    BLOCKED
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Window / Popup Blocker Handling */}
          <div className="surface-card p-4 rounded-xl border hairline-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#C5A059]" />
                <h3 className="text-xs font-semibold text-[#F1F5F9]">
                  {isArabic ? 'معالجة النوافذ المنبثقة المحظورة (window.open)' : 'Popup Blocker & window.open Handling'}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleTestPopup}
                className="px-3 py-1.5 text-xs font-medium text-[#E2E8F0] hover:text-white bg-[#141B26] hover:bg-[#1A2332] border hairline-border rounded-lg transition-colors cursor-pointer"
              >
                {t('testPopupBtn')}
              </button>
            </div>

            <p className="text-[11px] text-[#94A3B8]">
              {isArabic 
                ? 'إذا قام المتصفح بحظر النوافذ المنبثقة، يقوم النظام فوراً بتوفير رابط بديل صريح دون توقف أو إرباك للمستخدم.'
                : 'When browser policies block popups, Veyra AI provides an explicit inline fallback link to prevent user blockage.'}
            </p>

            {popupTestResult && (
              <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                popupTestResult.blocked || !popupTestResult.success
                  ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' 
                  : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className="flex items-center gap-2 font-mono">
                  {popupTestResult.blocked || !popupTestResult.success ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="break-words min-w-0">
                    {popupTestResult.blocked
                      ? t('popupBlockedNotice')
                      : !popupTestResult.success
                        ? (isArabic ? 'تعذّر فتح النافذة' : 'Could not open the window') + (popupTestResult.error ? ` (${popupTestResult.error})` : '')
                        : (isArabic ? 'تم فتح النافذة بنجاح' : 'Window opened successfully')}
                  </span>
                </div>
                {popupTestResult.blocked && popupTestResult.fallbackUrl && (
                  <div className="pt-1">
                    <a
                      href={popupTestResult.fallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C5A059] hover:underline"
                    >
                      <span>{isArabic ? 'فتح الوجهة مباشرة في لسان جديد' : 'Open destination directly in new tab'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#0F131C] border-t hairline-border flex items-center justify-between gap-3 text-xs text-[#64748B] shrink-0">
          <div className="flex items-center gap-2 font-mono min-w-0">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{isArabic ? 'معايير الأمان المالي والخصوصية مفعلة' : 'Fiduciary & GDPR privacy standards active'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#1C2536] text-[#F1F5F9] border hairline-border transition-colors cursor-pointer"
          >
            {isArabic ? 'إغلاق الفحص' : 'Close Diagnostics'}
          </button>
        </div>
      </div>
    </div>
  );
};
