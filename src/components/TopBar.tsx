import React from 'react';
import { ActiveTab, Channel } from '../types';
import { SlidersHorizontal, KeyRound, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TopBarProps {
  activeTab: ActiveTab;
  selectedChannelFilter: string;
  onChannelFilterChange: (channel: string) => void;
  onOpenAuditModal: () => void;
  onOpenDeployModal: () => void;
  onOpenAIKeysModal: () => void;
  onOpenSecurityModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  selectedChannelFilter,
  onChannelFilterChange,
  onOpenAuditModal,
  onOpenDeployModal,
  onOpenAIKeysModal,
  onOpenSecurityModal,
}) => {
  const { t, isRTL } = useLanguage();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return t('navOverview');
      case 'employees':
        return t('navPersonnel');
      case 'conversations':
        return t('navMessages');
      case 'appointments':
        return t('navCalendar');
      case 'pipeline':
        return t('navPipeline');
      case 'vault':
        return t('navVault');
      case 'aikeys':
        return t('navAIKeys');
      default:
        return t('navOverview');
    }
  };

  const channelFilters: { key: string; label: string }[] = [
    { key: 'All Channels', label: t('allChannels') },
    { key: 'WhatsApp', label: t('channelWhatsApp') },
    { key: 'Web Chat', label: t('channelWebChat') },
    { key: 'Email', label: t('channelEmail') },
    { key: 'SMS', label: t('channelSMS') },
  ];

  return (
    <header className="min-h-[4rem] px-4 md:px-6 py-2 bg-[#0F131C] border-b hairline-border flex flex-wrap items-center justify-between gap-x-6 gap-y-2 shrink-0">
      {/* Zone 1: Contextual Breadcrumb */}
      <div className="flex items-center gap-2 text-xs whitespace-nowrap min-w-0">
        <span className="text-[#64748B] font-mono">Veyra</span>
        <span className="text-[#475569] hidden sm:inline">/</span>
        <span className="text-[#94A3B8] hidden sm:inline">{t('workspaceTitle')}</span>
        <span className="text-[#475569]">/</span>
        <span className="text-[#F1F5F9] font-medium tracking-tight">
          {getTabTitle()}
        </span>
      </div>

      {/* Zone 2: Segmented Channel Filters */}
      <div className="order-last lg:order-none w-full lg:w-auto flex items-center gap-1 p-1 bg-[#0A0D13] rounded-lg border hairline-border overflow-x-auto">
        {channelFilters.map((channel) => {
          const isSelected = selectedChannelFilter === channel.key;
          return (
            <button
              key={channel.key}
              onClick={() => onChannelFilterChange(channel.key)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#141B26] text-[#F1F5F9] shadow-sm border hairline-border'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {channel.label}
            </button>
          );
        })}
      </div>

      {/* Zone 3: Actions + Language Switcher + AI Keys + Security */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {/* Language Switcher Button */}
        <LanguageSwitcher />

        {/* Security & Cookie Storage Diagnostics Button */}
        <button
          onClick={onOpenSecurityModal}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] bg-[#141B26] hover:bg-[#1A2332] border hairline-border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title={t('cookieDiagnostics')}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">{t('cookieDiagnostics')}</span>
        </button>

        {/* AI Keys & Models Center Button */}
        <button
          onClick={onOpenAIKeysModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#E2E8F0] hover:text-white bg-[#141B26] hover:bg-[#1A2332] border hairline-border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title={t('aiKeysAndModels')}
        >
          <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="hidden sm:inline">{t('aiKeysAndModels')}</span>
          <span className="sm:hidden font-mono">AI Keys</span>
        </button>

        {/* Guardrails and Vault shortcut */}
        <button
          onClick={onOpenAuditModal}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] bg-[#111622] hover:bg-[#161D2B] border hairline-border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>{t('guardrailsAndVault')}</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenDeployModal}
          className="px-3.5 py-1.5 text-xs font-medium text-[#0B0E14] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          {t('deploySpecialist')}
        </button>
      </div>
    </header>
  );
};
