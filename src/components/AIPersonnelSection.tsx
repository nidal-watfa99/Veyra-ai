import React from 'react';
import { AIEmployee } from '../types';
import { Shield, Sparkles, MessageSquare, Calendar, Target, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AIPersonnelSectionProps {
  employees: AIEmployee[];
  onSelectEmployee: (employee: AIEmployee) => void;
  compact?: boolean;
}

export const AIPersonnelSection: React.FC<AIPersonnelSectionProps> = ({
  employees,
  onSelectEmployee,
  compact = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>{t('workforceHeading')}</span>
            <span className="font-serif italic font-normal text-[#C5A059] text-lg">{t('workforceItalic')}</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {t('workforceSubtext')}
          </p>
        </div>
        <div className="text-xs text-[#64748B] font-mono">
          {t('systemLatency')} <span className="text-emerald-400 font-semibold tabular-nums">1.4s</span> avg
        </div>
      </div>

      <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {employees.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-[#64748B]">
            {t('noConversationsMatch')}
          </div>
        )}
        {employees.map((agent) => {
          return (
            <div
              key={agent.id}
              onClick={() => onSelectEmployee(agent)}
              className="surface-card rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-[#334155] transition-colors relative group"
            >
              {/* Header: Avatar, Name, CodeName & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border hairline-border bg-[#141B26]"
                      />
                      {/* Calm state indicator */}
                      <span 
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0B0E14] ${
                          agent.status === 'active' 
                            ? 'bg-emerald-500' 
                            : agent.status === 'in_dialogue' 
                              ? 'bg-teal-400' 
                              : 'bg-amber-400'
                        }`} 
                        title={`Status: ${agent.status}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-[#F1F5F9] tracking-tight group-hover:text-white">
                          {agent.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          [{agent.codeName}]
                        </span>
                      </div>
                      <div className="text-xs text-[#C5A059] font-medium tracking-tight">
                        {agent.role}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-[#64748B] shrink-0">
                    {agent.status === 'in_dialogue' 
                      ? t('inDialogue') 
                      : agent.status === 'calibrating' 
                        ? t('calibrating') 
                        : t('activeDuty')}
                  </span>
                </div>

                {/* Specialization overview */}
                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2 mb-3">
                  {agent.specialization}
                </p>

                {/* Current Active Task Well */}
                <div className="panel-recessed p-2.5 rounded-lg mb-3 border hairline-border">
                  <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{t('currentFocus')}</span>
                  </div>
                  <div className="text-xs text-[#E2E8F0] line-clamp-2 leading-relaxed">
                    {agent.currentTask}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Telemetry & Channels */}
              <div>
                <div className="grid grid-cols-3 gap-2 py-2.5 border-t hairline-divider text-center">
                  <div>
                    <div className="text-[10px] text-[#64748B]">{t('activeChats')}</div>
                    <div className="text-xs font-mono font-semibold text-[#F1F5F9] tabular-nums">
                      {agent.activeWorkload.activeConversations}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B]">{t('bookedWk')}</div>
                    <div className="text-xs font-mono font-semibold text-[#F1F5F9] tabular-nums">
                      {agent.activeWorkload.scheduledThisWeek}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B]">{t('guardrails')}</div>
                    <div className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                      {agent.activeWorkload.guardrailIntegrity}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t hairline-divider flex items-center justify-between text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    {agent.channels.map((ch, i) => (
                      <span key={ch} className="font-mono text-[10px] text-[#94A3B8]">
                        {ch}{i < agent.channels.length - 1 ? ' ·' : ''}
                      </span>
                    ))}
                  </div>

                  <span className="text-[#C5A059] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform flex items-center gap-0.5 text-xs font-medium">
                    {t('inspect')} <ArrowRight className="w-3 h-3 rtl:-scale-x-100" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
