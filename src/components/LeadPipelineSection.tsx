import React, { useState } from 'react';
import { Lead, AIEmployee } from '../types';
import { TrendingUp, Clock, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LeadPipelineSectionProps {
  leads: Lead[];
  employees: AIEmployee[];
  onSelectLead: (lead: Lead) => void;
}

export const LeadPipelineSection: React.FC<LeadPipelineSectionProps> = ({
  leads,
  employees,
  onSelectLead,
}) => {
  const { t } = useLanguage();
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const filteredLeads = leads.filter((lead) => {
    if (selectedStage === 'all') return true;
    return lead.stage === selectedStage;
  });

  const getAgent = (agentId: string) => {
    return employees.find((e) => e.id === agentId) || employees[0];
  };

  const stages = [
    'all',
    'Discovery Qualified',
    'Demo Scheduled',
    'Proposal Review',
    'Autonomous Follow-up',
  ];

  return (
    <div className="surface-card rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>{t('pipelineHeading')}</span>
            <span className="font-serif italic font-normal text-[#C5A059] text-lg">{t('pipelineItalic')}</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {t('pipelineSubtext')}
          </p>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-1 bg-[#0C1017] p-1 rounded-lg border hairline-border overflow-x-auto max-w-full">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedStage === stage
                  ? 'bg-[#161D2B] text-[#F1F5F9] border hairline-border'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {stage === 'all' ? 'All Stages' : stage}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Pipeline Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right text-xs border-collapse">
          <thead>
            <tr className="border-b hairline-border text-[11px] font-mono text-[#64748B]">
              <th className="py-2.5 px-3 font-medium">{t('leadAndFirm')}</th>
              <th className="py-2.5 px-3 font-medium">{t('pipelineValueCol')}</th>
              <th className="py-2.5 px-3 font-medium">{t('stageCol')}</th>
              <th className="py-2.5 px-3 font-medium">{t('assignedAgentCol')}</th>
              <th className="py-2.5 px-3 font-medium">{t('nextStepCol')}</th>
              <th className="py-2.5 px-3 text-right rtl:text-left font-medium">{t('touchpointCol')}</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline-divider">
            {filteredLeads.map((lead) => {
              const agent = getAgent(lead.assignedAgentId);
              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-[#141B26]/80 transition-colors cursor-pointer group"
                >
                  {/* Lead & Firm */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#F1F5F9] group-hover:text-white">
                      {lead.name}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                      <span>{lead.role}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#64748B]">{lead.company}</span>
                    </div>
                  </td>

                  {/* Value */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-semibold text-[#F1F5F9] tabular-nums">
                      {lead.dealValue}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      {lead.confidenceScore}% {t('winProbability')}
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-[#C5A059] font-medium">
                      {lead.stage}
                    </span>
                  </td>

                  {/* Assigned Agent */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded object-cover border hairline-border shrink-0"
                      />
                      <span className="text-xs text-[#E2E8F0]">
                        {agent.name}
                      </span>
                    </div>
                  </td>

                  {/* Next Step */}
                  <td className="py-3 px-3 max-w-xs">
                    <div className="text-xs text-[#94A3B8] line-clamp-1 leading-relaxed">
                      {lead.nextScheduledStep}
                    </div>
                  </td>

                  {/* Touchpoint */}
                  <td className="py-3 px-3 text-right rtl:text-left">
                    <span className="text-[11px] font-mono text-[#64748B] tabular-nums">
                      {lead.lastTouchpoint}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="py-8 text-center text-xs text-[#64748B]">{t('noItemsMatch')}</div>
        )}
      </div>
    </div>
  );
};
