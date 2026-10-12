import React, { useState, useEffect } from 'react';
import { X, Bot, Shield, Check, Layers } from 'lucide-react';
import { Channel } from '../types';
import { useLanguage } from '../context/LanguageContext';
import ariaAvatar from '../assets/images/avatar_agent_aria_1791747368525.jpg';

interface DeployPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (agentData: any) => void;
}

export const DeployPersonnelModal: React.FC<DeployPersonnelModalProps> = ({
  isOpen,
  onClose,
  onDeploy,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState(language === 'ar' ? 'فاليري ستون' : 'Valerie Stone');
  const [codeName, setCodeName] = useState('VST-04');
  const [role, setRole] = useState(language === 'ar' ? 'أخصائي تأهيل وانضمام كبار العملاء' : 'Discreet Client Onboarding Specialist');
  const [specialization, setSpecialization] = useState(language === 'ar' ? 'التحقق من وثائق اعرف عميلك KYC وتنسيق حسابات المكاتب العائلية' : 'KYC validation, fiduciary onboarding paperwork & family office coordination');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['WhatsApp', 'Email']);
  const [modelProfile, setModelProfile] = useState('Veyra Cortex Dual-Triage v4.2');

  // Close on Escape while open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleChannel = (channel: Channel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDeploy({
      id: `agent-${Date.now()}`,
      name,
      codeName,
      role,
      specialization,
      avatar: ariaAvatar,
      status: 'active',
      channels: selectedChannels,
      modelProfile,
      currentTask: language === 'ar' ? 'إجراءات التوجيه وتأهيل الحسابات المصرفية الأوروبية الخاصة' : 'Initial onboarding orientation for European private banking accounts',
      guardrailPolicies: [
        'Enforce GDPR non-retention standards',
        'Verify document authenticity before calendar lock',
      ],
      recentMilestone: language === 'ar' ? 'تم الانضمام لشبكة استشارات إيثلغارد' : 'Initialized into Aethelgard Private Advisory network',
      activeSince: language === 'ar' ? 'تم النشر الآن' : 'Just deployed',
      activeWorkload: {
        activeConversations: 0,
        scheduledThisWeek: 0,
        qualifiedLeads: 0,
        avgLatency: '1.2s',
        guardrailIntegrity: '100%',
      },
    });
    onClose();
  };

  const channelOptions: Channel[] = ['WhatsApp', 'Web Chat', 'Email', 'SMS'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-xl max-h-[92dvh] bg-[#10151F] border hairline-border rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#E2E8F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F131C] border-b hairline-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-[#F1F5F9] tracking-tight">
              {t('newPersonnelTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#161D2B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                {t('personnelName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full panel-recessed px-3 py-2 rounded-lg text-xs text-[#F1F5F9] border hairline-border focus:outline-none focus:border-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                {t('systemIdentifier')}
              </label>
              <input
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                className="w-full panel-recessed px-3 py-2 rounded-lg text-xs font-mono text-[#F1F5F9] border hairline-border focus:outline-none focus:border-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
              {t('operationalMandate')}
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full panel-recessed px-3 py-2 rounded-lg text-xs text-[#F1F5F9] border hairline-border focus:outline-none focus:border-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
              {t('specializationLabel')}
            </label>
            <textarea
              rows={2}
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full panel-recessed px-3 py-2 rounded-lg text-xs text-[#F1F5F9] border hairline-border focus:outline-none focus:border-slate-500 resize-none leading-relaxed"
              required
            />
          </div>

          {/* Channel Multi-select */}
          <div>
            <label className="block text-[11px] font-mono text-[#94A3B8] mb-1.5">
              {t('omnichannelLabel')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {channelOptions.map((channel) => {
                const isSelected = selectedChannels.includes(channel);
                return (
                  <button
                    type="button"
                    key={channel}
                    onClick={() => toggleChannel(channel)}
                    className={`py-2 px-2 text-xs rounded-lg border transition-colors flex items-center justify-center gap-1 cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-[#15202B] text-[#F1F5F9] border-emerald-500/40'
                        : 'bg-[#0D111A] text-[#64748B] hairline-border hover:text-[#94A3B8]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{channel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Cortex & Guardrail Confirmation */}
          <div className="panel-recessed p-3 rounded-lg border hairline-border text-xs text-[#94A3B8] space-y-1">
            <div className="flex items-center justify-between font-mono text-[10px] text-[#64748B]">
              <span>Cortex Architecture</span>
              <span className="text-[#C5A059]">Fiduciary Guardrails Bound</span>
            </div>
            <p className="text-[11px] text-[#E2E8F0]">
              {language === 'ar'
                ? 'يتم تعيين الموظف آلياً مع ميثاق الامتثال Q4 والتحقق الكامل من العقود.'
                : 'Personnel initialized with Aethelgard Q4 Compliance Manual & zero-hallucination contract verification.'}
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t hairline-divider">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-[#0B0E14] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {t('authorizeDeploy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
