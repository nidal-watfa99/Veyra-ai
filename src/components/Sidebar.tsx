import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  CalendarDays, 
  TrendingUp, 
  ShieldCheck, 
  Database,
  Building2,
  ChevronDown,
  Lock,
  KeyRound
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unreadCount: number;
  upcomingAppointmentsCount: number;
  openAgentDeployModal: () => void;
  openAIKeysModal: () => void;
  openSecurityModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
  upcomingAppointmentsCount,
  openAgentDeployModal,
  openAIKeysModal,
  openSecurityModal,
}) => {
  const { t } = useLanguage();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'overview', label: t('navOverview'), icon: LayoutDashboard },
    { id: 'employees', label: t('navPersonnel'), icon: Bot, badge: t('activeBadge') },
    { id: 'conversations', label: t('navMessages'), icon: MessageSquare, badge: unreadCount > 0 ? `${unreadCount} ${t('unreadBadge')}` : undefined },
    { id: 'appointments', label: t('navCalendar'), icon: CalendarDays, badge: `${upcomingAppointmentsCount}` },
    { id: 'pipeline', label: t('navPipeline'), icon: TrendingUp, badge: t('highValueBadge') },
    { id: 'vault', label: t('navVault'), icon: Database },
  ];

  return (
    <aside className="w-72 max-w-full bg-[#0F131C] border-r rtl:border-r-0 rtl:border-l hairline-border flex flex-col shrink-0 min-h-full lg:min-h-screen select-none">
      {/* Brand Identity Lockup */}
      <div className="h-16 px-5 flex items-center justify-between border-b hairline-border">
        <div className="flex items-center gap-3">
          {/* Precision Architectural Emblem */}
          <div className="w-8 h-8 rounded-lg bg-[#141B26] border hairline-border flex items-center justify-center relative overflow-hidden shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 6L7 9V15L12 18L17 15V9L12 6Z" stroke="#C5A059" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="1.5" fill="#E2E8F0" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-wide text-sm text-[#F1F5F9] uppercase font-mono">
                {t('appName')}
              </span>
            </div>
            <span className="text-[11px] text-[#64748B] tracking-tight">{t('appSubtitle')}</span>
          </div>
        </div>

        <button 
          onClick={openAgentDeployModal}
          className="text-[11px] font-mono text-amber-200/90 bg-[#161D2A] hover:bg-[#1C2536] border border-amber-900/30 px-2 py-1 rounded transition-colors cursor-pointer"
          title={t('deploySpecialist')}
        >
          + {t('deploySpecialist')}
        </button>
      </div>

      {/* Enterprise Organization Switcher */}
      <div className="p-3">
        <button 
          type="button"
          className="w-full text-left rtl:text-right p-2.5 rounded-lg bg-[#0C1017] hover:bg-[#121722] border hairline-border transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded bg-[#161D2B] border border-white/5 flex items-center justify-center text-[#94A3B8] shrink-0">
                <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-[#E2E8F0] truncate group-hover:text-white">
                  {t('workspaceTitle')}
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                  <span>{t('workspaceLocation')}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400/80">{t('privateTier')}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#94A3B8] shrink-0" />
          </div>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-2 flex-1 space-y-1">
        <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
          {t('navWorkspaceOps')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#141B26] text-[#F1F5F9] border hairline-border'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#111620]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-[#64748B]'}`} />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[11px] text-[#64748B] font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* AI Keys & Models Center Button in Sidebar */}
        <button
          onClick={openAIKeysModal}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#C5A059] hover:text-amber-200 bg-[#161D2B]/60 hover:bg-[#1B2436] border border-amber-900/20 transition-colors cursor-pointer mt-2"
        >
          <div className="flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span className="tracking-tight font-medium">{t('aiKeysAndModels')}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">API</span>
        </button>
      </div>

      {/* Autonomous Guardrail Status Well */}
      <div className="p-3 space-y-2">
        <div 
          onClick={openSecurityModal}
          className="panel-recessed p-3 rounded-lg border hairline-border hover:border-slate-600 transition-colors cursor-pointer group"
          title={t('cookieDiagnostics')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium text-[#E2E8F0] group-hover:text-white">{t('guardrailsNominal')}</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400/90 font-semibold tabular-nums">99.8%</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#94A3B8]">
            {t('fiduciaryNotice')}
          </p>
          <div className="mt-2.5 pt-2 border-t hairline-divider flex items-center justify-between text-[10px] text-[#64748B] font-mono">
            <span>{t('latencyAvg')}</span>
            <span className="text-emerald-400/90 flex items-center gap-1">
              <span>{t('cookieDiagnostics')}</span>
              <span className="text-[9px]">→</span>
            </span>
          </div>
        </div>

        {/* Secondary Language Switcher in Sidebar */}
        <div className="pt-1 flex items-center justify-between text-xs px-1">
          <span className="text-[10px] font-mono text-[#64748B]">اللغة / Language</span>
          <LanguageSwitcher compact placement="up" />
        </div>
      </div>

      {/* Operator Session Footer */}
      <div className="p-3 border-t hairline-border bg-[#0B0E14]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#161D2B] border hairline-border flex items-center justify-center text-xs font-mono font-medium text-[#E2E8F0] shrink-0">
              AW
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-[#F1F5F9] truncate">
                {t('managingDirector')}
              </div>
              <div className="text-[10px] text-[#64748B] truncate font-mono">
                ID #941 · Verified Session
              </div>
            </div>
          </div>
          <div className="text-[#64748B]" title="Authenticated via Hardware Key">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </aside>
  );
};
